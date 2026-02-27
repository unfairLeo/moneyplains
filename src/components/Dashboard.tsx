import { useState, useRef, useEffect } from "react";
import { User, Bot, Sparkles } from "lucide-react"; 
import QueryInput from "./QueryInput";
import ChartDisplay from "./ChartDisplay";
import MetricsGrid from "./MetricsGrid";
import HistorySidebar from "./HistorySidebar";
// Importando o Widget de Patrimônio
import { WealthWidget } from "@/components/wealth/WealthWidget"; 
import { useToast } from "@/hooks/use-toast";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { validateQuery, isApiConfigured, getApiUrl, getFetchTimeout } from "@/lib/api";
import { MoneyPlanLogo } from "@/components/brand/MoneyPlanLogo";

// Tipo da mensagem
type ChatMessage = {
  role: 'user' | 'assistant';
  content?: string;
  charts?: any[];
  metrics?: any[];
  error?: boolean;
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]); 
  
  // ESTADOS DO PATRIMÔNIO (O Card Grande)
  const [currentNetWorth, setCurrentNetWorth] = useState<number>(0);
  const [currentChartData, setCurrentChartData] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { history, saveConversation, deleteConversation } = useConversationHistory();

  // Rolar para baixo automaticamente
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // --- AQUI ESTÁ A FUNÇÃO QUE VOCÊ PRECISA (handleQuery) ---
  const handleQuery = async (query: string) => {
    // 1. Mostra a mensagem do usuário na tela
    const userMessage: ChatMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);

    const validation = validateQuery(query);
    if (!validation.success) {
      toast({ title: "Inválido", description: validation.error, variant: "destructive" });
      return;
    }
    
    if (!isApiConfigured()) {
       setError("API não configurada.");
       return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), getFetchTimeout());

      // Envia para o N8N
      const res = await fetch(getApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: validation.data }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Erro na API: ${res.status}`);

      const raw = await res.json();
      
      // --- TRADUTOR: N8N (PT-BR) -> REACT ---
      
      // 1. Atualiza o Card de Patrimônio (net_worth do seu prompt)
      if (raw.net_worth !== undefined) {
          setCurrentNetWorth(Number(raw.net_worth));
      }

      // 2. Traduzir 'labels' e 'valores' para o Gráfico
      let generatedCharts = [];
      
      if (raw.labels && raw.valores && raw.labels.length > 0) {
          const chartData = raw.labels.map((label: string, index: number) => ({
              name: label,
              value: raw.valores[index]
          }));
          
          generatedCharts.push({
              title: raw.titulo || "Análise Financeira",
              data: chartData
          });
          
          // Atualiza também o gráfico do widget lá em cima
          setCurrentChartData(chartData);
      } else if (raw.charts) {
          generatedCharts = raw.charts;
      }

      // 3. Traduzir 'variaveis_matematicas' para os Cards Pequenos
      let generatedMetrics = [];
      const vars = raw.variaveis_matematicas || {};
      
      if (vars.renda_mensal) generatedMetrics.push({ label: "Renda", value: `R$ ${vars.renda_mensal}`, change: "Entrada", trend: "up" });
      if (vars.gasto_mensal) generatedMetrics.push({ label: "Gasto", value: `R$ ${vars.gasto_mensal}`, change: "Saída", trend: "down" });
      if (vars.sobra_mensal) generatedMetrics.push({ label: "Sobra", value: `R$ ${vars.sobra_mensal}`, change: "Saldo", trend: "neutral" });
      if (vars.meta_total) generatedMetrics.push({ label: "Meta", value: `R$ ${vars.meta_total}`, change: "Alvo", trend: "up" });

      if (generatedMetrics.length === 0 && raw.metrics) {
          generatedMetrics = raw.metrics;
      }

      // 4. Cria a mensagem do Robô lendo 'resposta'
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: raw.resposta || raw.conversation || "Dados processados.",
        charts: generatedCharts,
        metrics: generatedMetrics
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Salva no histórico
      saveConversation(query, { 
          conversation: raw.resposta || raw.conversation, 
          charts: generatedCharts, 
          metrics: generatedMetrics,
          net_worth: raw.net_worth 
      });

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setMessages(prev => [...prev, { role: 'assistant', content: `Erro: ${msg}`, error: true }]);
    } finally {
      setIsLoading(false);
    }
  };
  // --- FIM DA FUNÇÃO HANDLEQUERY ---

  const handleSelectConversation = (id: string) => {
    const item = history.find((i) => i.id === id);
    if (item) {
      setMessages([
          { role: 'user', content: item.query },
          { role: 'assistant', content: item.response.conversation, charts: item.response.charts, metrics: item.response.metrics }
      ]);
      if (item.response.net_worth) setCurrentNetWorth(item.response.net_worth);
      setSelectedConversationId(id);
    }
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    if (selectedConversationId === id) {
        setMessages([]);
        setSelectedConversationId(null);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <HistorySidebar
        history={history}
        selectedId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      
      <div className="flex-1 flex flex-col relative h-full w-full">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/20 bg-background/80 backdrop-blur-md z-20 shrink-0">
            <div className="flex items-center gap-2">
                <MoneyPlanLogo size="sm" />
                <h1 className="text-lg font-bold">MoneyPlan<span className="text-primary">$</span></h1>
            </div>
            <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-500 flex items-center gap-1">
                🔥 5 Dias
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
            <div className="max-w-3xl mx-auto space-y-6 pb-4">
                
                {/* WIDGET DE PATRIMÔNIO (Recebe o netWorth do N8N) */}
                <div className="mb-8 animate-fade-in">
                    <WealthWidget 
                        netWorth={currentNetWorth} 
                        chartData={currentChartData}
                        isLoading={isLoading}
                    />
                </div>

                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 animate-in fade-in zoom-in duration-500 opacity-70">
                        <div className="p-4 rounded-full bg-primary/10 mb-2">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">Como posso ajudar suas finanças?</h2>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 mt-1">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                        )}

                        <div className={`flex flex-col max-w-[85%] md:max-w-[75%] space-y-3`}>
                            {msg.content && (
                                <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                                    : 'bg-card border border-border/50 text-foreground rounded-tl-sm'
                                }`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            )}
                            {msg.role === 'assistant' && (
                                <>
                                    {msg.metrics && msg.metrics.length > 0 && <MetricsGrid metrics={msg.metrics} />}
                                    {msg.charts && msg.charts.length > 0 && <ChartDisplay charts={msg.charts} />}
                                </>
                            )}
                        </div>

                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                                <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-card px-4 py-3 rounded-2xl rounded-tl-sm border border-border/50 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                
                <div ref={scrollRef} className="h-1" />
            </div>
        </div>

        <div className="p-4 bg-background/95 backdrop-blur-xl border-t border-border/30 z-20">
            <div className="max-w-3xl mx-auto">
                <QueryInput onSubmit={handleQuery} isLoading={isLoading} />
                <p className="text-center text-[10px] text-muted-foreground mt-2 opacity-50">
                    MoneyPlan$ AI • Finanças Inteligentes
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
