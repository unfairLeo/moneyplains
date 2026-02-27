import { useState, useRef, useEffect } from "react";
import { User, Bot, Sparkles, Wallet, TrendingUp, TrendingDown } from "lucide-react"; 
import QueryInput from "./QueryInput";
import ChartDisplay from "./ChartDisplay";
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
  
  // Estados simplificados (apenas números, sem gráficos complexos no topo)
  const [saldo, setSaldo] = useState<number>(0);
  const [entradas, setEntradas] = useState<number>(0);
  const [saidas, setSaidas] = useState<number>(0);

  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { history, saveConversation, deleteConversation } = useConversationHistory();

  // Scroll automático
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Efeito "Espelho": Atualiza os cards do topo baseado no que o chat responde
  useEffect(() => {
    if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.role === 'assistant') {
            // Se a IA mandou métricas, atualiza os cards do topo
            if (lastMsg.metrics) {
                lastMsg.metrics.forEach((m: any) => {
                    const val = parseFloat(m.value.replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
                    if (m.label.includes("Renda") || m.label.includes("Entrada")) setEntradas(val);
                    if (m.label.includes("Gasto") || m.label.includes("Saída")) setSaidas(val);
                    if (m.label.includes("Sobra") || m.label.includes("Saldo") || m.label.includes("Meta")) setSaldo(val);
                });
            }
            // Se a IA mandou um valor de patrimônio direto (net_worth), prioriza ele
            // (Você pode adicionar essa lógica se o N8N mandar net_worth no futuro)
        }
    }
  }, [messages]);

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
      
      // Processamento básico
      let generatedCharts = raw.charts || [];
      if (raw.labels && raw.valores) {
           generatedCharts = [{
              title: raw.titulo || "Análise",
              data: raw.labels.map((l:string, i:number) => ({ name: l, value: raw.valores[i] }))
           }];
      }

      let generatedMetrics = raw.metrics || [];
      const v = raw.variaveis_matematicas || {};
      if (v.renda_mensal) generatedMetrics.push({ label: "Renda Mensal", value: `R$ ${v.renda_mensal}`, change: "Entrada", trend: "up" });
      if (v.gasto_mensal) generatedMetrics.push({ label: "Gasto Mensal", value: `R$ ${v.gasto_mensal}`, change: "Saída", trend: "down" });
      if (v.sobra_mensal) generatedMetrics.push({ label: "Sobra/Saldo", value: `R$ ${v.sobra_mensal}`, change: "Acumulado", trend: "neutral" });

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
                
                {/* --- NOVO PAINEL SIMPLIFICADO (3 CARDS) --- */}
                {/* Ele aparece sempre, não precisa ativar, e não quebra */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* Card 1: Saldo/Patrimônio */}
                    <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Patrimônio</p>
                            <h3 className="text-xl font-bold">
                                {saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </h3>
                        </div>
                    </div>

                    {/* Card 2: Entradas */}
                    <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Entradas</p>
                            <h3 className="text-xl font-bold text-green-500">
                                {entradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </h3>
                        </div>
                    </div>

                    {/* Card 3: Saídas */}
                    <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm flex items-center gap-4">
                         <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Saídas</p>
                            <h3 className="text-xl font-bold text-red-500">
                                {saidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </h3>
                        </div>
                    </div>
                </div>

                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-6 text-center space-y-4 animate-in fade-in zoom-in duration-500 opacity-70">
                        <div className="p-4 rounded-full bg-primary/10 mb-2">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold">MoneyPlan AI</h2>
                        <p className="text-sm text-muted-foreground">
                            Digite sobre seus gastos ou peça uma simulação.
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
                                    {msg.charts && <ChartDisplay charts={msg.charts} />}
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
                <p className="text-center text-[10px] text-muted-foreground mt-2 opacity-50">MoneyPlan$ AI</p>
            </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
