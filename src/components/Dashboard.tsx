import { useState } from "react";
 import { AlertCircle } from "lucide-react";
import QueryInput from "./QueryInput";
import ChartDisplay from "./ChartDisplay";
import MetricsGrid from "./MetricsGrid";
import ConversationCard from "./ConversationCard";
import HistorySidebar from "./HistorySidebar";
import { ApiResponse } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { validateQuery, isApiConfigured, getApiUrl, getFetchTimeout } from "@/lib/api";
 import { MoneyPlanLogo } from "@/components/brand/MoneyPlanLogo";
 import { WealthWidget } from "@/components/wealth/WealthWidget";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { history, saveConversation, getConversation, deleteConversation } = useConversationHistory();

  const handleQuery = async (query: string) => {
    // Validate query before proceeding
    const validation = validateQuery(query);
    if (validation.success === false) {
      setError(validation.error);
      toast({
        title: "Consulta inválida",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }
    const validatedQuery = validation.data;

    // Check if API is configured
    if (!isApiConfigured()) {
      setError("API não configurada. Configure a variável de ambiente VITE_N8N_WEBHOOK_URL.");
      toast({
        title: "Erro de configuração",
        description: "A URL da API não foi configurada.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);
    setSelectedConversationId(null);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), getFetchTimeout());

    try {
      const res = await fetch(getApiUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: validatedQuery }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro na API: ${res.status} - ${errorText}`);
      }

      const rawText = await res.text();

      let data: ApiResponse;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Resposta inválida do servidor (não é JSON válido)");
      }

      setResponse(data);
      
      // Save conversation to history
      const newId = saveConversation(query, data);
      setSelectedConversationId(newId);
    } catch (err) {
      let message = "Erro ao consultar a API";
      
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          message = `Timeout: o servidor não respondeu a tempo.`;
        } else if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
          message = "Erro de rede. Verifique sua conexão.";
        } else {
          message = err.message;
        }
      }
      
      setError(message);
      toast({
        title: "Erro na consulta",
        description: message,
        variant: "destructive",
      });
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    const conversation = getConversation(id);
    if (conversation) {
      setSelectedConversationId(id);
      setResponse(conversation.response);
      setError(null);
    }
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    // Se a conversa deletada estava selecionada, limpar a tela
    if (selectedConversationId === id) {
      setSelectedConversationId(null);
      setResponse(null);
    }
  };

  const hasContent = response && (response.title || response.metrics || response.charts || response.conversation);

  return (
    <div className="min-h-screen bg-background">
      {/* History Sidebar */}
      <HistorySidebar
        history={history}
        selectedId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'linear-gradient(hsl(220 20% 18%) 1px, transparent 1px), linear-gradient(90deg, hsl(220 20% 18%) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <MoneyPlanLogo size="lg" />
            <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight">
              <span className="text-primary text-glow-emerald">Money</span>
              <span className="text-foreground">Plan</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Gestão de Patrimônio Inteligente
          </p>
        </header>

        {/* Wealth Widget */}
        <WealthWidget className="mb-6" />

        {/* Query Input */}
        <div className="glass-card p-6 mb-8">
          <QueryInput onSubmit={handleQuery} isLoading={isLoading} />
        </div>

        {/* Response Area */}
        <div className="space-y-6">
          {/* Error State */}
          {error && (
            <div className="glass-card p-6 border-destructive/50 animate-slide-up">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="glass-card p-12 animate-fade-in">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-muted animate-spin border-t-primary" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent animate-ping border-t-primary/30" />
                </div>
                <p className="text-muted-foreground">Analisando seus dados...</p>
              </div>
            </div>
          )}

          {/* Response Content */}
          {hasContent && !isLoading && (() => {
            // Verificar se há gráficos com dados válidos
            const hasValidCharts = response?.charts?.some(chart => 
              chart.data && 
              chart.data.length > 0 && 
              chart.data.some(point => point.value > 0)
            ) ?? false;

            return (
              <>
                {/* Title */}
                {response.title && (
                  <div className="text-center animate-slide-up">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                      {response.title}
                    </h2>
                  </div>
                )}

                {/* Conversation - Texto do Assistente */}
                {response.conversation && (
                  <ConversationCard text={response.conversation} />
                )}

                {/* Metrics Grid - Só aparece se houver gráficos válidos */}
                {hasValidCharts && response.metrics && response.metrics.length > 0 && (
                  <MetricsGrid metrics={response.metrics} />
                )}

                {/* Charts */}
                {response.charts && response.charts.length > 0 && (
                  <ChartDisplay charts={response.charts} />
                )}
              </>
            );
          })()}

          {/* Empty State */}
          {!response && !isLoading && !error && (
            <div className="glass-card p-12 text-center animate-fade-in">
              <div className="inline-flex p-4 rounded-2xl bg-muted/50 mb-4">
                <MoneyPlanLogo size="lg" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                Pronto para começar
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Comande suas finanças ou registre um investimento para receber análises detalhadas e visualizações interativas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
