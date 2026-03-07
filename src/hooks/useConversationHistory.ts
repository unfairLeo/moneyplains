import { useState, useEffect, useCallback } from "react";
import { SavedConversation, ApiResponse } from "@/types/api";

const STORAGE_KEY = "moneyplan_conversation_history";
const MAX_HISTORY_ITEMS = 50;
const EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function loadData(): SavedConversation[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed.filter((c: SavedConversation) => now - c.timestamp < EXPIRATION_MS);
  } catch {
    return [];
  }
}

export function useConversationHistory() {
  const [history, setHistory] = useState<SavedConversation[]>([]);

  useEffect(() => {
    setHistory(loadData());
  }, []);

  const saveConversation = useCallback((query: string, response: ApiResponse): string => {
    const newConversation: SavedConversation = {
      id: crypto.randomUUID(),
      query,
      response,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      const updated = [newConversation, ...prev].slice(0, MAX_HISTORY_ITEMS);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        if (import.meta.env.DEV) console.error("Erro ao salvar histórico:", error);
      }
      return updated;
    });

    return newConversation.id;
  }, []);

  const getConversation = useCallback((id: string): SavedConversation | undefined => {
    return history.find((conv) => conv.id === id);
  }, [history]);

  const deleteConversation = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((conv) => conv.id !== id);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        if (import.meta.env.DEV) console.error("Erro ao deletar conversa:", error);
      }
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Erro ao limpar histórico:", error);
    }
  }, []);

  return {
    history,
    saveConversation,
    getConversation,
    deleteConversation,
    clearHistory,
  };
}
