import { useState, useRef, useEffect } from "react";
import { User, Bot, Sparkles, Wallet, TrendingUp, Plus, ArrowRight } from "lucide-react"; 
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"; // Importando o gráfico
import QueryInput from "./QueryInput";
import MetricsGrid from "./MetricsGrid";
import HistorySidebar from "./HistorySidebar";
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
  
  // ESTADO DO COFRE
  const [saldo, setSaldo] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]); // Dados da curva

  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { history, saveConversation, deleteConversation } = useConversationHistory();

  // Scroll automático
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Efeito Espelho + Geração de Curva Decorativa (Se não tiver dados reais)
  useEffect(() => {
    if (chartData.length === 0) {
        // Gera uma curva "fake" bonita só para não ficar vazio no início
        const fakeCurve = [
            { name: 'Start', value: saldo * 0.8 },
            { name: 'P1', value: saldo * 0.85 },
            { name: 'P2', value: saldo * 0.82 },
            { name: 'P3', value: saldo * 0.9 },
            { name: 'P4', value: saldo * 0.95 },
            { name: 'Now', value: saldo || 100 } 
        ];
        setChartData(fakeCurve);
    }
  }, [saldo]);

  const handleQuery = async (query: string) => {
    const userMessage: ChatMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);

    const validation = validateQuery(query);
    if (!validation.success) {
      toast({ title: "Inválido", description: validation.error, variant: "destructive" });
      return;
    }
    
    if (!isApiConfigured()) { setError("API não configurada."); return; }

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
      
      // --- CAPTURA INTELIGENTE DE DADOS ---
      
      // 1. Atualiza o Saldo (Bala de Prata)
      if (raw.net_worth !== undefined) {
          const cleanVal = parseFloat(String(raw.net_worth).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
          setSaldo(cleanVal);
      }

      // 2. Atualiza a Curva do Cofre (Se vier gráfico da IA)
      let generatedCharts = raw.charts || [];
      if (raw.labels && raw.valores) {
           const newData = raw.labels.map((l:string, i:number) => ({ name: l, value: raw.valores[i] }));
           setChartData(newData); // Atualiza a curva do topo
           
           generatedCharts = [{
              title: raw.titulo || "Análise",
              data: newData
           }];
      }

      let generatedMetrics = raw.metrics || [];
      const v = raw.variaveis_matematicas || {};
      if (v.renda_mensal) generatedMetrics.push({ label: "Renda", value: `R$ ${v.renda_mensal}`, change: "Entrada", trend: "up" });
      if (v.gasto_mensal) generatedMetrics.push({ label: "Gasto", value: `R$ ${v.gasto_mensal}`, change: "Saída", trend: "down" });

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: raw.resposta || raw.conversation || "Dados processados.",
        charts: generatedCharts,
        metrics: generatedMetrics
      };
      
      setMessages(prev => [...prev, aiMessage]);
      saveConversation(query, { ...raw, charts: generatedCharts, metrics: generatedMetrics });

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
      setMessages([{ role: 'user', content: item.query }, { role: 'assistant', ...item.response }]);
      setSelectedConversationId(id);
    }
  };
  
  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    if (selectedConversationId === id) { setMessages([]); setSelectedConversationId(null); }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
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
                
                {/* --- COFRE INTELIGENTE (Visual Premium) --- */}
                <div className="relative w-full h-[320px] rounded-3xl bg-black border border-white/5 shadow-2xl overflow-hidden group">
                    
                    {/* Fundo com efeito de luz (Glow) */}
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full p-8 justify-between">
                        {/* Cabeçalho do Card */}
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 rounded-full bg-white/10">
                                        <Sparkles className="w-4 h-4 text-green-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-400 tracking-wide">COFRE INTELIGENTE</span>
                                </div>
                                <h2 className="text-5xl font-bold text-white tracking-tighter drop-shadow-lg">
                                    {saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </h2>
                                <div className="flex items-center gap-2 mt-2 text-green-400 text-sm font-medium bg-green-400/10 w-fit px-2 py-1 rounded-lg">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>+12.5% rendimento</span>
                                </div>
                            </div>

                            {/* Botão de Ação */}
                            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-black font-bold rounded-full transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]">
                                <Plus className="w-4 h-4" />
                                <span>Aportar</span>
                            </button>
                        </div>

                        {/* Área do Gráfico (Fica no fundo da parte inferior) */}
                        <div className="absolute bottom-0 left-0 right-0 h-[160px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip content={() => null} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke="#22c55e" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorValue)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                {/* --- FIM DO COFRE --- */}

                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 animate-in fade-in zoom-in duration-500 opacity-70">
                        <p className="text-sm text-muted-foreground">
                            Digite <span className="text-primary font-bold">"Guardar 500 reais"</span> para ver o cofre crescer.
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
                                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50'
                                }`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            )}
                            {msg.role === 'assistant' && (
                                <>
                                    {msg.metrics && <MetricsGrid metrics={msg.metrics} />}
                                    {/* Não mostramos o gráfico no chat se ele já está no cofre lá em cima */}
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
                         <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary" /></div>
                         <div className="bg-card px-4 py-3 rounded-2xl border border-border/50 flex items-center gap-1">
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
                <p className="text-center text-[10px] text-muted-foreground mt-2 opacity-50">MoneyPlan$ AI • Gestão Inteligente</p>
            </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
