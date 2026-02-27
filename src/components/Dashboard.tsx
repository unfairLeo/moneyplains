import { useState, useRef, useEffect } from "react";
import { User, Bot, Sparkles } from "lucide-react"; 
import QueryInput from "./QueryInput";
import ChartDisplay from "./ChartDisplay";
import MetricsGrid from "./MetricsGrid";
import HistorySidebar from "./HistorySidebar";
import { WealthWidget } from "@/components/wealth/WealthWidget"; 
import { useToast } from "@/hooks/use-toast";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { validateQuery, isApiConfigured, getApiUrl, getFetchTimeout } from "@/lib/api";
import { MoneyPlanLogo } from "@/components/brand/MoneyPlanLogo";

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
  const [showDashboard, setShowDashboard] = useState(false); 
  const [currentNetWorth, setCurrentNetWorth] = useState<number>(0);
  const [currentChartData, setCurrentChartData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { history, saveConversation, deleteConversation } = useConversationHistory();

  // --- O SEGREDO: O EFEITO "ESPELHO" ---
  // Toda vez que as mensagens mudam, ele verifica se tem gráfico novo
  // e força a atualização do topo. É infalível.
  useEffect(() => {
    if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        
        // Se a última mensagem for do robô e tiver gráficos
        if (lastMsg.role === 'assistant' && lastMsg.charts && lastMsg.charts.length > 0) {
            const chart = lastMsg.charts[0];
            
            // Pega os dados do gráfico
            if (chart.data && chart.data.length > 0) {
                // 1. Atualiza o Gráfico do Topo
                setCurrentChartData(chart.data);

                // 2. Pega o ÚLTIMO valor do gráfico (o saldo final)
                const lastValue = chart.data[chart.data.length - 1].value;
                
                // 3. Força o Card a mostrar esse valor
                setCurrentNetWorth(Number(lastValue));
                
                // 4. Garante que o painel esteja visível
                if (!showDashboard) setShowDashboard(true);
            }
        }
    }
  }, [messages]); // Roda sempre que 'messages' muda

  // Scroll automático
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Função auxiliar de limpeza
  const parseMoney = (val: any) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const cleanStr = val.replace(/[^\d.,-]/g, '');
        const dotStr = cleanStr.replace(',', '.');
        return parseFloat(dotStr) || 0;
    }
    return 0;
  };

  const handleQuery = async (query: string) => {
    const userMessage: ChatMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);

    // Comandos manuais de ativação
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("ativar") || lowerQuery.includes("mostrar") || lowerQuery.includes("ver")) {
        if (lowerQuery.includes("painel") || lowerQuery.includes("grafico")) setShowDashboard(true);
    }
    if (lowerQuery.includes("ocultar") || lowerQuery.includes("fechar")) setShowDashboard(false);

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

      const res = await fetch(getApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: validation.data }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Erro na API: ${res.status}`);

      const raw = await res.json();
      
      // --- PROCESSAMENTO SIMPLIFICADO ---
      // (O trabalho pesado agora é feito pelo useEffect lá em cima)

      let generatedCharts = [];
      if (raw.labels && raw.valores && raw.labels.length > 0) {
          const chartData = raw.labels.map((label: string, index: number) => ({
              name: label,
              value: parseMoney(raw.valores[index])
          }));
          
          generatedCharts.push({
              title: raw.titulo || "Análise Financeira",
              data: chartData
          });
      } else if (raw.charts) {
          generatedCharts = raw.charts;
      }

      let generatedMetrics = [];
      const vars = raw.variaveis_matematicas || {};
      if (vars.renda_mensal) generatedMetrics.push({ label: "Renda", value: `R$ ${vars.renda_mensal}`, change: "Entrada", trend: "up" });
      if (vars.gasto_mensal) generatedMetrics.push({ label: "Gasto", value: `R$ ${vars.gasto_mensal}`, change: "Saída", trend: "down" });
      if (vars.sobra_mensal) generatedMetrics.push({ label: "Sobra", value: `R$ ${vars.sobra_mensal}`, change: "Saldo", trend: "neutral" });
      
      if (generatedMetrics.length === 0 && raw.metrics) generatedMetrics = raw.metrics;

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: raw.resposta || raw.conversation || "Dados processados.",
        charts: generatedCharts,
        metrics: generatedMetrics
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Salva no histórico com o valor corrigido se possível
      const finalWorth = raw.net_worth ? parseMoney(raw.net_worth) : 0;
      saveConversation(query, { 
          conversation: raw.resposta || raw.conversation, 
          charts: generatedCharts, 
          metrics: generatedMetrics,
          net_worth: finalWorth
      });

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setMessages(prev => [...prev, { role: 'assistant', content: `Erro: ${msg}`, error: true }]);
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="flex items-center gap-3">
                <div className="hidden md:flex px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-500 items-center gap-1">
                    🔥 5 Dias
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
            <div className="max-w-3xl mx-auto space-y-6 pb-4">
                
                {showDashboard && (
                    <div className="mb-8 animate-in slide-in-from-top-10 fade-in duration-700 ease-out">
                        <WealthWidget 
                            netWorth={currentNetWorth} 
                            chartData={currentChartData}
                            isLoading={isLoading}
                        />
                    </div>
                )}

                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 animate-in fade-in zoom-in duration-500 opacity-70">
                        <div className="p-4 rounded-full bg-primary/10 mb-2">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">MoneyPlan AI</h2>
                        <p className="text-sm text-muted-foreground">
                            Digite <span className="font-bold text-primary">"Ativar Painel"</span> e peça uma simulação.
                        </p>
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
