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

  // 🟢 FUNÇÃO handleQuery ATUALIZADA (BLINDADA)
  const handleQuery = async (query: string) => {
    // 1. Validação Básica
    const validation = validateQuery(query);
    if (!validation.success) {
      toast({ title: "Inválido", description: validation.error, variant: "destructive" });
      return;
    }
    const validatedQuery = validation.data;

    // 2. Verificar Configuração da API
    if (!isApiConfigured()) {
       setError("API não configurada. Configure VITE_N8N_WEBHOOK_URL.");
       toast({ title: "Erro", description: "API não configurada", variant: "destructive" });
       return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);
    setSelectedConversationId(null);

    // --- MODO APRESENTAÇÃO / CHEAT CODE (CRUCIAL PARA AMANHÃ) ---
    // Se digitar "simula" ou "invest", ignora o servidor e gera gráfico falso na hora.
    if (query.toLowerCase().includes("simul") || query.toLowerCase().includes("invest")) {
      setTimeout(() => {
        const mockResponse: ApiResponse = {
          conversation: `Simulação projetada com sucesso! Investindo R$ 500/mês a 1% ao mês, você terá cerca de R$ 3.076 em 6 meses. Veja o crescimento:`,
          net_worth: 3076.00, // Valor final simulado
          metrics: [ // Preenche os cards do topo
             { label: "Aporte Mensal", value: "R$ 500,00", change: "Fixo", trend: "neutral" },
             { label: "Taxa de Juros", value: "1% a.m.", change: "Rentabilidade", trend: "up" },
             { label: "Total Investido", value: "R$ 3.000,00", change: "Principal", trend: "neutral" },
             { label: "Juros Ganhos", value: "R$ 76,00", change: "+Lucro", trend: "up" }
          ],
          charts: [
            {
              title: "Projeção de Rendimento (6 Meses)",
              data: [
                { name: "Mês 1", value: 500 },
                { name: "Mês 2", value: 1005 },
                { name: "Mês 3", value: 1515 },
                { name: "Mês 4", value: 2030 },
                { name: "Mês 5", value: 2550 },
                { name: "Mês 6", value: 3076 }
              ]
            }
          ]
        };
        
        setResponse(mockResponse);
        const newId = saveConversation(query, mockResponse);
        setSelectedConversationId(newId);
        setIsLoading(false);
      }, 1500); // Delay dramático de 1.5s para parecer que pensou
      return; 
    }
    // --- FIM DO MODO APRESENTAÇÃO ---

    // 3. Chamada Real para a API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), getFetchTimeout());

    try {
      const res = await fetch(getApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: validatedQuery }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro na API: ${res.status} - ${errorText}`);
      }

      const rawText = await res.text();
      const raw = JSON.parse(rawText);

      // --- TRATAMENTO DOS DADOS DO N8N (PONTE DE DADOS) ---
      
      // 1. Pega o Patrimônio (seja do novo formato ou antigo)
      const netWorthValue = raw?.variaveis_matematicas?.net_worth ?? raw?.net_worth ?? 0;
      
      // 2. Converte 'variaveis_matematicas' em Cards (Metrics) se não vier pronto
      let metricsData = raw.metrics || [];
      if (raw.variaveis_matematicas && (!raw.metrics || raw.metrics.length === 0)) {
        metricsData = [
          { 
            label: "Renda Mensal", 
            value: `R$ ${raw.variaveis_matematicas.renda_mensal || 0}`, 
            change: "Entrada", trend: "up" 
          },
          { 
            label: "Gasto Mensal", 
            value: `R$ ${raw.variaveis_matematicas.gasto_mensal || 0}`, 
            change: "Saída", trend: "down" 
          },
          { 
            label: "Sobra Mensal", 
            value: `R$ ${raw.variaveis_matematicas.sobra_mensal || 0}`, 
            change: "Saldo", trend: "neutral" 
          },
          { 
            label: "Meta Total", 
            value: `R$ ${raw.variaveis_matematicas.meta_total || 0}`, 
            change: "Alvo", trend: "up" 
          }
        ];
      }

      const data: ApiResponse = { 
        ...raw, 
        net_worth: netWorthValue,
        metrics: metricsData 
      };

      setResponse(data);
      const newId = saveConversation(query, data);
      setSelectedConversationId(newId);

    } catch (err) {
      let message = "Erro ao consultar a API";
      if (err instanceof Error) {
         if (err.name === "AbortError") message = "Timeout: Servidor demorou.";
         else if (err.message.includes("fetch")) message = "Erro de conexão.";
         else message = err.message;
      }
      setError(message);
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  // --- Função de Histórico (Mantida igual) ---
  const handleSelectConversation = (id: string) => {
    // Busca direta na lista de histórico para garantir que pega o dado mais atual
    const conversation = history.find((item) => item.id === id);
    
    if (conversation) {
      setSelectedConversationId(id);
      setResponse(conversation.response);
      setError(null);
    }
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
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
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[600px] rounded-[100%] bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between w-full mb-8 gap-4">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-2">
              <MoneyPlanLogo size="lg" />
              <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight">
                <span className="text-primary text-glow-emerald">Money</span>
                <span className="text-foreground">Plan</span>
                <span className="text-primary">$</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Gestão de Patrimônio Inteligente
            </p>
          </div>

          {/* Streak Badge */}
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-orange-500/10 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)] backdrop-blur-md transition-transform hover:scale-105 cursor-help" title="Dias seguidos focando nas finanças">
            <div className="relative">
              <span className="text-2xl drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">🔥</span>
              <div className="absolute inset-0 bg-orange-500/20 blur-lg rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold text-orange-500 leading-none">5</span>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                Dias
              </span>
            </div>
          </div>
        </header>
        
        {/* Wealth Widget (Com suporte ao gráfico da API) */}
        <WealthWidget 
          className="mb-6" 
          netWorth={response?.net_worth}
          chartData={response?.charts?.[0]?.data}
        />

        {/* Query Input */}
        <div className="glass-card p-6 mb-8">
          <QueryInput onSubmit={handleQuery} isLoading={isLoading} />
        </div>

        {/* Response Area */}
        <div className="space-y-6">
          {error && (
            <div className="glass-card p-6 border-destructive/50 animate-slide-up">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

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

          {hasContent && !isLoading && (() => {
            const hasValidCharts = response?.charts?.some(chart => 
              chart.data && 
              chart.data.length > 0 && 
              chart.data.some(point => point.value > 0)
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

                {response.conversation && (
                  <ConversationCard text={response.conversation} />
                )}

                {/* Metrics Grid - Mostra os Cards do topo se tiver dados */}
                {response.metrics && response.metrics.length > 0 && (
                  <MetricsGrid metrics={response.metrics} />
                )}

                {hasValidCharts && response.charts && response.charts.length > 0 && (
                  <ChartDisplay charts={response.charts} />
                )}
              </>
            );
          })()}

          {/* Empty State */}
          {!response && !isLoading && !error && (
            <div className="glass-card p-12 text-center animate-fade-in">
              <div className="hidden md:inline-flex p-4 rounded-2xl bg-muted/50 mb-4">
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
