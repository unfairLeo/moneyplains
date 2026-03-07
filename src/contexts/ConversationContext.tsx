import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { SavedConversation, ApiResponse } from "@/types/api";

const STORAGE_KEY = "moneyplan_conversation_history";
const MAX_HISTORY_ITEMS = 50;
const EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function loadConversationData(): SavedConversation[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out expired conversations
    const now = Date.now();
    return parsed.filter((c: SavedConversation) => now - c.timestamp < EXPIRATION_MS);
  } catch {
    return [];
  }
}

function saveToStorage(data: SavedConversation[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Erro ao salvar histórico:", error);
    }
  }
}

// Cleanup: remove old localStorage data if it exists (one-time migration)
function cleanupOldStorage() {
  try {
    localStorage.removeItem("moneyplan_conversation_history");
    localStorage.removeItem("frivacs_conversation_history");
  } catch {
    // ignore
  }
}

interface ConversationContextType {
  history: SavedConversation[];
  selectedId: string | null;
  response: ApiResponse | null;
  isLoading: boolean;
  error: string | null;
  saveConversation: (query: string, response: ApiResponse) => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  clearSelection: () => void;
  setResponse: (response: ApiResponse | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const ConversationContext = createContext<ConversationContextType | null>(null);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<SavedConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cleanupOldStorage();
    setHistory(loadConversationData());
  }, []);

  const saveConversation = useCallback((query: string, apiResponse: ApiResponse): string => {
    const newConversation: SavedConversation = {
      id: crypto.randomUUID(),
      query,
      response: apiResponse,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      const updated = [newConversation, ...prev].slice(0, MAX_HISTORY_ITEMS);
      saveToStorage(updated);
      return updated;
    });

    setSelectedId(newConversation.id);
    return newConversation.id;
  }, []);

  const selectConversation = useCallback((id: string) => {
    const conversation = history.find((conv) => conv.id === id);
    if (conversation) {
      setSelectedId(id);
      setResponse(conversation.response);
      setError(null);
    }
  }, [history]);

  const deleteConversation = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((conv) => conv.id !== id);
      saveToStorage(updated);
      return updated;
    });

    if (selectedId === id) {
      setSelectedId(null);
      setResponse(null);
    }
  }, [selectedId]);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setResponse(null);
    setError(null);
  }, []);

  return (
    <ConversationContext.Provider
      value={{
        history,
        selectedId,
        response,
        isLoading,
        error,
        saveConversation,
        selectConversation,
        deleteConversation,
        clearSelection,
        setResponse,
        setIsLoading,
        setError,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error("useConversation must be used within a ConversationProvider");
  }
  return context;
}
