import { useState, useRef, useEffect } from "react";
import { User, Bot, Sparkles, Wallet, TrendingUp, Plus, Minus, ArrowRight, ChevronDown, Zap } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"; 
import QueryInput from "./QueryInput";
import MetricsGrid from "./MetricsGrid";
import HistorySidebar from "./HistorySidebar";
import { useToast } from "@/hooks/use-toast";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { validateQuery, getFetchTimeout } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
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
  
  const [saldo, setSaldo] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]); 
  const [investmentType, setInvestmentType] = useState("cdb");
  const [streak, setStreak] = useState(1); // Estado do Streak

  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { history, saveConversation, deleteConversation } = useConversationHistory();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Lógica do Streak (Dias Seguidos)
  useEffect(() => {
    const checkStreak = () => {
      const today = new Date().toDateString();
      const lastLogin = localStorage.getItem('moneyplan_last_login');
      const currentStreak = parseInt(localStorage.getItem('moneyplan_streak') || '0');

      if (lastLogin === today) {
        setStreak(currentStreak || 1);
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastLogin === yesterday.toDateString()) {
          const newStreak = currentStreak + 1;
          setStreak(newStreak);
          localStorage.setItem('moneyplan_streak', newStreak.toString());
          toast({ title: "⚡ Streak Aumentou!", description: `${newStreak} dias seguidos focando no futuro!` });
        } else {
          setStreak(1);
          localStorage.setItem('moneyplan_streak', '1');
        }
        localStorage.setItem('moneyplan_last_login', today);
      }
    };
    checkStreak();
  }, []);

  useEffect(() => {
    if (chartData.length === 0) {
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
    if (validation.success === false) {
      toast({ title: "Inválido", description: validation.error, variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const { data: raw, error: fnError } = await supabase.functions.invoke('n8n-proxy', {
        body: { query: validation.data },
      });

      if (fnError || raw?.error) {
        throw new Error("Erro ao processar a solicitação.");
      }
      
      if (raw.net_worth !== undefined) {
          const cleanVal = parseFloat(String(raw.net_worth).replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
          setSaldo(cleanVal);
      }

      let generatedCharts = raw.charts || [];
      if (raw.labels && raw.valores) {
           const newData = raw.labels.map((l:string, i:number) => ({ name: l, value: raw.valores[i] }));
           setChartData(newData); 
           generatedCharts = [{ title: raw.titulo || "Análise", data: newData }];
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
    <div className="flex h-screen overflow-hidden font-sans relative text-white bg-black">
        
      {/* Imagem de Fundo (Garante que cubra tudo) */}
      <div className="absolute inset-0 z-0">
          <img 
            src="/bg-app.jpg" 
            alt="Background" 
            className="w-full h-full object-cover opacity-50"
            onError={(e) => {
                e.currentTarget.style.display = 'none';
            }}
          />
          {/* Overlay suave para integrar o fundo */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 flex h-full w-full">
          {/* Sidebar com fundo transparente para integrar */}
          <HistorySidebar
            history={history}
            selectedId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
          />
          
          <div className="flex-1 flex flex-col relative h-full w-full">
            
            {/* --- CABEÇALHO LIMPO (Agora indentado corretamente) --- */}
            <header className="flex items-center justify-between px-6 py-4 z-20 shrink-0 bg-transparent">
                <div className="flex items-center gap-2">
                    <MoneyPlanLogo size="sm" />
                    <h1 className="text-lg font-bold tracking-tight drop-shadow-md">
                        MoneyPlan<span className="text-primary">$</span>
                    </h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
                <div className="max-w-4xl mx-auto space-y-6 pb-4">
                    
                    {/* --- CARD PRINCIPAL (COFRE) --- */}
                    <div className="relative w-full h-[360px] rounded-[2rem] bg-black/40 border border-white/10 shadow-2xl overflow-hidden group backdrop-blur-md transition-all hover:border-white/20">
                        
                        {/* Glow de fundo */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full p-8 justify-between">
                            
                            {/* Topo do Card */}
                            <div className="flex justify-between items-start">
                                
                                {/* Esquerda: Título e Saldo */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 rounded-full bg-white/5 border border-white/10">
                                            <Sparkles className="w-4 h-4 text-green-400" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Patrimônio Inteligente</span>
                                    </div>
                                    <h2 className="text-6xl font-bold text-white tracking-tighter drop-shadow-xl">
                                        {saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-3 text-green-400 text-sm font-medium bg-green-500/10 w-fit px-3 py-1 rounded-full border border-green-500/20">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>+12.5% este mês</span>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 mt-4">
                                        <button
                                          onClick={() => {
                                            const val = window.prompt("Quanto deseja aportar? (R$)");
                                            if (val) {
                                              const num = parseFloat(val.replace(/[^\d.,-]/g, '').replace(',', '.'));
                                              if (!isNaN(num) && num > 0) setSaldo(prev => prev + num);
                                            }
                                          }}
                                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:shadow-[0_0_20px_hsl(160_84%_39%/0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
                                        >
                                          <Plus className="w-4 h-4" />
                                          Aportar
                                        </button>
                                        <button
                                          onClick={() => {
                                            const val = window.prompt("Quanto deseja resgatar? (R$)");
                                            if (val) {
                                              const num = parseFloat(val.replace(/[^\d.,-]/g, '').replace(',', '.'));
                                              if (!isNaN(num) && num > 0) setSaldo(prev => Math.max(0, prev - num));
                                            }
                                          }}
                                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white font-semibold text-sm hover:bg-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
                                        >
                                          <Minus className="w-4 h-4" />
                                          Resgatar
                                        </button>
                                    </div>
                                </div>

                                {/* Direita: STREAK + SELECT */}
                                <div className="flex flex-col items-end gap-3">
                                    
                                    {/* Streak Badge */}
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all cursor-default" title="Dias seguidos acessando o app">
                                        <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
                                        <span className="text-xs font-bold text-yellow-100">{streak} Dias</span>
                                    </div>

                                    {/* Select de Investimento */}
                                    <div className="relative group/select">
                                        <select 
                                            value={investmentType}
                                            onChange={(e) => setInvestmentType(e.target.value)}
                                            className="appearance-none bg-black/60 border border-white/10 text-white text-xs font-medium rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 cursor-pointer hover:bg-black/80 transition-all w-[180px]"
                                        >
                                            <option value="cdb">CDB & Renda Fixa</option>
                                            <option value="acoes">Ações (B3)</option>
                                            <option value="fii">Fundos Imobiliários</option>
                                            <option value="cripto">Criptomoedas</option>
                                            <option value="tesouro">Tesouro Direto</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none group-hover/select:text-gray-300" />
                                    </div>
                                </div>
                            </div>

                            {/* Gráfico no Fundo */}
                            <div className="absolute bottom-0 left-0 right-0 h-[180px] w-full opacity-80 mask-gradient">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <Tooltip content={() => null} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke="#22c55e" 
                                            strokeWidth={3} 
                                            fillOpacity={1} 
                                            fill="url(#colorValue)" 
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 animate-in fade-in zoom-in duration-700 opacity-80">
                            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                                Selecione um investimento acima ou digite <br/>
                                <span className="text-primary font-bold">"Simule R$ 5k em {investmentType}"</span> para ver a mágica.
                            </p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shrink-0 mt-1 backdrop-blur-sm">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                            )}
                            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] space-y-3`}>
                                {msg.content && (
                                    <div className={`px-6 py-4 rounded-3xl text-sm leading-relaxed shadow-lg ${
                                        msg.role === 'user' 
                                        ? 'bg-primary text-black font-medium rounded-tr-sm' 
                                        : 'bg-black/60 border border-white/10 backdrop-blur-md text-gray-100 rounded-tl-sm'
                                    }`}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                )}
                                {msg.role === 'assistant' && (
                                    <>
                                        {msg.metrics && <MetricsGrid metrics={msg.metrics} />}
                                    </>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                                    <User className="w-4 h-4 text-gray-300" />
                                </div>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3">
                             <div className="w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary" /></div>
                             <div className="bg-black/40 px-4 py-3 rounded-2xl border border-white/10 flex items-center gap-1">
                                 <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                 <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                 <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></span>
                             </div>
                        </div>
                    )}
                    <div ref={scrollRef} className="h-1" />
                </div>
            </div>

            <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/5 z-20">
                <div className="max-w-3xl mx-auto">
                    <QueryInput onSubmit={handleQuery} isLoading={isLoading} />
                    <p className="text-center text-[10px] text-gray-500 mt-2 opacity-60">MoneyPlan$ AI • Gestão Inteligente</p>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};
export default Dashboard;
