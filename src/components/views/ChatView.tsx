import { useState } from "react";
import { AlertCircle } from "lucide-react";
import QueryInput from "@/components/QueryInput";
import ChartDisplay from "@/components/ChartDisplay";
import MetricsGrid from "@/components/MetricsGrid";
import ConversationCard from "@/components/ConversationCard";
import SmartActions from "@/components/SmartActions";
import StreakBadge from "@/components/StreakBadge";
import { useConversation } from "@/contexts/ConversationContext";
import { useToast } from "@/hooks/use-toast";
import { BackendResponse, transformBackendResponse } from "@/types/api";
import { validateQuery, isApiConfigured, getApiUrl, getFetchTimeout } from "@/lib/api";
import { MoneyPlanLogo } from "@/components/brand/MoneyPlanLogo";
import { WealthWidget } from "@/components/wealth/WealthWidget";
import { TooltipProvider } from "@/components/ui/tooltip";

export function ChatView() {
  const [netWorth, setNetWorth] = useState<number | null>(null);
  const [prefillQuery, setPrefillQuery] = useState("");
  const [prefillKey, setPrefillKey] = useState(0);
  const {
    response,
    isLoading,
    error,
    saveConversation,
    clearSelection,
    setResponse,
    setIsLoading,
    setError,
  } = useConversation();
  const { toast } = useToast();

  const handleSmartAction = (text: string) => {
    setPrefillQuery(text);
    setPrefillKey((prev) => prev + 1);
  };

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
    clearSelection();

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

      let rawData: unknown;
      try {
        rawData = JSON.parse(rawText);
      } catch {
        throw new Error("Resposta inválida do servidor (não é JSON válido)");
      }

      console.log("[MoneyPlan] Raw API response:", rawData);

      const { apiResponse, netWorth: newNetWorth } = transformBackendResponse(rawData as BackendResponse);

      console.log("[MoneyPlan] Transformed response:", apiResponse);
      console.log("[MoneyPlan] Net worth:", newNetWorth);

      setResponse(apiResponse);

      if (newNetWorth !== null) {
        setNetWorth(newNetWorth);
      }

      // Save conversation to history
      saveConversation(query, apiResponse);
    } catch (err) {
      console.error("[MoneyPlan] API Error:", err);
      let message = "Erro ao consultar a API";

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          message = `Timeout: o servidor não respondeu a tempo.`;
        } else if (
          err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError")
        ) {
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

  const hasContent =
    response && (response.title || response.metrics || response.charts || response.conversation);

  return (
    <TooltipProvider>
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Olá, Usuário 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Aqui está o resumo do seu patrimônio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all duration-200">
            <Bell size={20} strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>
          <Avatar className="h-9 w-9 border border-slate-700">
            <AvatarFallback className="bg-slate-800 text-slate-300 text-sm">U</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Wealth + Streak Row */}
      <div className="flex items-center gap-4 mb-6 animate-stagger-in stagger-1">
        <div className="flex-1">
          <WealthWidget patrimony={netWorth ?? undefined} />
        </div>
        <StreakBadge />
      </div>

      {/* Smart Actions */}
      <div className="glass-card p-5 mb-6 animate-stagger-in stagger-2">
        <SmartActions onAction={handleSmartAction} />
      </div>

      {/* Query Input */}
      <div className="glass-card p-6 mb-8 animate-stagger-in stagger-3">
        <QueryInput
          onSubmit={handleQuery}
          isLoading={isLoading}
          prefillValue={prefillKey > 0 ? prefillQuery : undefined}
          key={prefillKey}
        />
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
        {hasContent &&
          !isLoading &&
          (() => {
            // Check if there are charts with valid data
            const hasValidCharts =
              response?.charts?.some(
                (chart) =>
                  chart.data && chart.data.length > 0 && chart.data.some((point) => point.value > 0)
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

                {/* Conversation - Assistant Text */}
                {response.conversation && <ConversationCard text={response.conversation} />}

                {/* Metrics Grid - Only appears if there are valid charts */}
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
          <div className="glass-card p-12 text-center animate-stagger-in stagger-4">
            <div className="inline-flex p-4 rounded-2xl bg-muted/50 mb-4">
              <MoneyPlanLogo size="lg" />
            </div>
            <h3 className="text-xl font-display font-semibold text-foreground mb-2">
              Pronto para começar
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Comande suas finanças ou registre um investimento para receber análises
              detalhadas e visualizações interativas.
            </p>
          </div>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
}
