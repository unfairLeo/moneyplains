import { useState } from "react";
import { AlertCircle, Bell } from "lucide-react";
import QueryInput from "@/components/QueryInput";
import ChartDisplay from "@/components/ChartDisplay";
import MetricsGrid from "@/components/MetricsGrid";
import ConversationCard from "@/components/ConversationCard";
import SmartActions from "@/components/SmartActions";
import StreakBadge from "@/components/StreakBadge";
import { useConversation } from "@/contexts/ConversationContext";
import { useToast } from "@/hooks/use-toast";
import { BackendResponse, transformBackendResponse } from "@/types/api";
import { validateQuery, getFetchTimeout } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/auth/UserMenu";
import { WealthWidget } from "@/components/wealth/WealthWidget";
import { TooltipProvider } from "@/components/ui/tooltip";

export function ChatView() {
  const { user } = useAuth();
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
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] ?? "Usuário";

  const handleSmartAction = (text: string) => {
    setPrefillQuery(text);
    setPrefillKey((prev) => prev + 1);
  };

  const handleQuery = async (query: string) => {
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

    setIsLoading(true);
    setError(null);
    setResponse(null);
    clearSelection();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), getFetchTimeout());

    try {
      const { data: rawData, error: fnError } = await supabase.functions.invoke('n8n-proxy', {
        body: { query: validatedQuery },
      });

      clearTimeout(timeoutId);

      if (fnError) {
        throw new Error("server_error");
      }

      if (rawData?.error) {
        throw new Error(rawData.error);
      }

      if (import.meta.env.DEV) {
        console.log("[MoneyPlan] API response:", rawData);
      }

      const { apiResponse, netWorth: newNetWorth } = transformBackendResponse(rawData as BackendResponse);

      setResponse(apiResponse);

      if (newNetWorth !== null) {
        setNetWorth(newNetWorth);
      }

      saveConversation(query, apiResponse);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[MoneyPlan] API Error:", err);
      }

      let message = "Erro ao processar a solicitação. Tente novamente.";

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          message = "Tempo limite excedido. Tente novamente.";
        } else if (
          err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError")
        ) {
          message = "Erro de rede. Verifique sua conexão.";
        } else if (err.message === "server_error") {
          message = "Erro no servidor. Tente novamente mais tarde.";
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
            Olá, {firstName} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Aqui está o resumo do seu patrimônio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StreakBadge />
          <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200">
            <Bell size={20} strokeWidth={1.5} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>
          <UserMenu />
        </div>
      </header>

      {/* Wealth Widget */}
      <div className="mb-6 animate-stagger-in stagger-1">
        <WealthWidget patrimony={netWorth ?? undefined} />
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
            const hasValidCharts =
              response?.charts?.some(
                (chart) =>
                  chart.data && chart.data.length > 0 && chart.data.some((point) => point.value > 0)
              ) ?? false;

            return (
              <>
                {response.title && (
                  <div className="text-center animate-slide-up">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                      {response.title}
                    </h2>
                  </div>
                )}

                {response.conversation && <ConversationCard text={response.conversation} />}

                {hasValidCharts && response.metrics && response.metrics.length > 0 && (
                  <MetricsGrid metrics={response.metrics} />
                )}

                {response.charts && response.charts.length > 0 && (
                  <ChartDisplay charts={response.charts} />
                )}
              </>
            );
          })()}

        {/* Empty State */}
        {!response && !isLoading && !error && (
          <div className="glass-card p-12 text-center animate-stagger-in stagger-4">
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
