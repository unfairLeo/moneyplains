import { useState, useRef, useEffect } from "react";
// [ALTERAÇÃO 1] Adicionei 'Zap' (Raio) na importação dos ícones
import { User, Bot, Sparkles, Wallet, TrendingUp, Plus, ArrowRight, ChevronDown, Zap } from "lucide-react"; 
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"; 
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
  
  const [saldo, setSaldo] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]); 
  const [investmentType, setInvestmentType] = useState("cdb");

  // [ALTERAÇÃO 2] Adicionei o estado para controlar os dias seguidos (Streak)
  const [streak, setStreak] = useState(1);

  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { history, saveConversation, deleteConversation } = useConversationHistory();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // [ALTERAÇÃO 3] Lógica Inteligente do Streak (Calcula dias seguidos reais)
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
          // Mostra um aviso legal pro usuário
          toast({ title: "⚡ Streak!", description: `${newStreak} dias seguidos! Continue assim.` });
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

      const payload = { 
          query: validation.data,
          context: { investmentType } 
      };

      const res = await fetch(getApiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Erro na API: ${res.status}`);

      const raw = await res.json();
      
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
    <div className="flex h-screen overflow-hidden font-sans relative text-white">
        
      <div className="absolute inset-0 z-0">
          <img 
            src="/bg-app.jpg" 
            alt="Background" 
            className="w-full h-full object-cover opacity-60"
            onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.style.backgroundColor = '#09090b'; 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 flex h-full w-full">
          <HistorySidebar
            history={history}
            selectedId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={handleDeleteConversation}
          />
          
          <div className="flex-1 flex flex-col relative h-full w-full">
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md z-20 shrink-0">
                <div className="flex items-center gap-2">
                    <MoneyPlanLogo size="sm" />
                    <h1 className="text-lg font-bold">MoneyPlan<span className="text-primary">$</span></h1>
                </div>
                
                {/* [ALTERAÇÃO 4] Removi o contador antigo daqui (o "🔥 5 Dias") */}
                <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
                    {/* Deixei vazio ou você pode colocar data/hora aqui */}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
                <div className="max-w-3xl mx-auto space-y-6 pb-4">
                    
                    {/* --- COFRE INTELIGENTE --- */}
                    <div className="relative w-full h-[340px] rounded-3xl bg-black/40 border border-white/10 shadow-2xl overflow-hidden group backdrop-blur-md">
                        
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full p-8 justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1.5 rounded-full bg-white/10">
                                            <Sparkles className="w-4 h-4 text-green-400" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-400 tracking-wide">PATRIMÔNIO TOTAL</span>
                                    </div>
                                    <h2 className="text-5xl font-bold text-white tracking-tighter drop-shadow-lg">
                                        {saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-2 text-green-400 text-sm font-medium bg-green-400/10 w-fit px-2 py-1 rounded-lg">
                                        <TrendingUp className="w-3 h-3" />
                                        <span>+12.5% rendimento</span>
                                    </div>
                                </div>

                                {/* [ALTERAÇÃO 5] Área Direita do Card: Select + Streak Novo */}
                                <div className="flex flex-col items-end gap-3">
                                    
                                    {/* AQUI ESTÁ SEU NOVO STREAK COM RAIO */}
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                                        <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400/20 animate-pulse" />
                                        <span className="text-xs font-bold text-yellow-400">{streak} Dias</span>
                                    </div>

                                    {/* O Select continua aqui embaixo */}
                                    <div className="relative">
                                        <select 
                                            value={investmentType}
                                            onChange={(e) => setInvestmentType(e.target.value)}
                                            className="appearance-none bg-black/50 border border-white/20 text-white text-sm rounded-xl px-4 py-2 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer hover:bg-black/70 transition-all"
                                        >
                                            <option value="cdb">CDB & Renda Fixa</option>
                                            <option value="acoes">Ações (B3)</option>
                                            <option value="fii">Fundos Imobiliários</option>
                                            <option value="cripto">Criptomoedas</option>
                                            <option value="tesouro">Tesouro Direto</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

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
                                        <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 animate-in fade-in zoom-in duration-500 opacity-70">
                            <p className="text-sm text-gray-300">
                                Digite <span className="text-primary font-bold">"Simule R$ 5k em {investmentType}"</span> para ver o resultado.
                            </p>
                        </div>
                    )}

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                            )}
                            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] space-y-3`}>
                                {msg.content && (
                                    <div className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-black/60 border border-white/10 backdrop-blur-sm'
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
                             <div className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary" /></div>
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

            <div className="p-4 bg-black/30 backdrop-blur-xl border-t border-white/10 z-20">
                <div className="max-w-3xl mx-auto">
                    <QueryInput onSubmit={handleQuery} isLoading={isLoading} />
                    <p className="text-center text-[10px] text-gray-400 mt-2 opacity-50">MoneyPlan$ AI • Gestão Inteligente</p>
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};
export default Dashboard;
