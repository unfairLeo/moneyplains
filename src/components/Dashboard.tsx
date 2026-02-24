import { useState, useRef, useEffect } from "react";
import { User, Bot, Sparkles } from "lucide-react"; // Adicionei ícones para o chat
import QueryInput from "./QueryInput";
import ChartDisplay from "./ChartDisplay";
import MetricsGrid from "./MetricsGrid";
import HistorySidebar from "./HistorySidebar";
import { ApiResponse } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { validateQuery, isApiConfigured, getApiUrl, getFetchTimeout } from "@/lib/api";
import { MoneyPlanLogo } from "@/components/brand/MoneyPlanLogo";

// Definindo o tipo de cada balão de fala
type ChatMessage = {
  role: 'user' | 'assistant';
  content?: string;
  charts?: any[];
  metrics?: any[];
  error?: boolean;
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Lista de mensagens
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null); // Para rolar a tela automaticamente
  const { toast } = useToast();
  const { history, saveConversation, deleteConversation } = useConversationHistory();

  // Rolar para baixo sempre que chegar mensagem nova
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleQuery = async (query: string) => {
    // 1. Adiciona a mensagem do usuário na tela NA HORA
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

    // --- MODO APRESENTAÇÃO (Cheat Code) ---
    if (query.toLowerCase().includes("simul") || query.toLowerCase().includes("invest")) {
      setTimeout(() => {
        const mockResponse = {
          conversation: `Simulação projetada com sucesso! Investindo R$ 500/mês a 1% ao mês, você terá um crescimento exponencial.`,
          metrics: [
             { label: "Total Investido", value: "R$ 3.000,00", change: "Principal", trend: "neutral" },
             { label: "Juros Ganhos", value: "R$ 76,00", change: "+Lucro", trend: "up" }
          ],
          charts: [{
              title: "Projeção de Rendimento",
              data: [
                { name: "Mês 1", value: 500 }, { name: "Mês 2", value: 1005 },
                { name: "Mês 3", value: 1515 }, { name: "Mês 4", value: 2030 },
                { name: "Mês 5", value: 2550 }, { name: "Mês 6", value: 3076 }
              ]
          }]
        };
        
        const aiMessage: ChatMessage = { 
            role: 'assistant', 
            content: mockResponse.conversation,
            charts: mockResponse.charts,
            metrics: mockResponse.metrics
        };
        setMessages(prev => [...prev, aiMessage]);
        saveConversation(query, mockResponse as ApiResponse);
        setIsLoading(false);
      }, 1500);
      return; 
    }
    // ---------------------------------------

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
      
      // Tratamento de métricas (igual ao anterior)
      let metricsData = raw.metrics || [];
      if (raw.variaveis_matematicas && metricsData.length === 0) {
        metricsData = [
          { label: "Renda", value: `R$ ${raw.variaveis_matematicas.renda_mensal}`, change: "Entrada", trend: "up" },
          { label: "Meta", value: `R$ ${raw.variaveis_matematicas.meta_total}`, change: "Alvo", trend: "neutral" }
        ];
      }

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: raw.conversation || "Dados processados.",
        charts: raw.charts,
        metrics: metricsData
      };
      
      setMessages(prev => [...prev, aiMessage]);
      saveConversation(query, { ...raw, metrics: metricsData });

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
      {/* Sidebar */}
      <HistorySidebar
        history={history}
        selectedId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      
      {/* Área Principal (Chat) */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-gradient-to-b from-background to-background/50">
        
        {/* Header Fixo no Topo */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/80 backdrop-blur-md z-10 shrink-0">
            <div className="flex items-center gap-2">
                <MoneyPlanLogo size="sm" />
                <h1 className="text-lg font-bold tracking-tight">MoneyPlan<span className="text-primary">$</span></h1>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                <span className="text-sm">🔥</span>
                <span className="text-xs font-bold text-orange-500">5 Dias</span>
            </div>
        </header>

        {/* LISTA DE MENSAGENS (Scroll) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scroll-smooth">
            <div className="max-w-3xl mx-auto space-y-6 pb-4">
                
                {/* Tela de Boas Vindas (Só aparece se não tiver mensagens) */}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 animate-fade-in opacity-50">
                        <div className="p-4 rounded-full bg-muted/30">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold">Olá! Como posso ajudar?</h2>
                        <p className="text-sm text-muted-foreground">Pergunte sobre seus gastos, investimentos ou metas.</p>
                    </div>
                )}

                {/* Renderização das Mensagens */}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                        
                        {/* Avatar do Robô */}
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                        )}

                        {/* Conteúdo do Balão */}
                        <div className={`flex flex-col max-w-[85%] space-y-4`}>
                            {msg.content && (
                                <div className={`p-4 rounded-2xl text-sm md:text-base ${
                                    msg.role === 'user' 
                                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                                    : 'bg-muted/30 border border-border/50 text-foreground rounded-tl-sm'
                                }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                            )}

                            {/* Se for robô e tiver gráficos/métricas, mostra aqui dentro */}
                            {msg.role === 'assistant' && (
                                <>
                                    {msg.metrics && msg.metrics.length > 0 && <MetricsGrid metrics={msg.metrics} />}
                                    {msg.charts && msg.charts.length > 0 && <ChartDisplay charts={msg.charts} />}
                                </>
                            )}
                        </div>

                        {/* Avatar do Usuário */}
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                                <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                ))}

                {/* Loading (Três pontinhos) */}
                {isLoading && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                             <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-muted/30 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                
                {/* Div invisível para scroll automático */}
                <div ref={scrollRef} />
            </div>
        </div>

        {/* INPUT FIXO EMBAIXO */}
        <div className="p-4 bg-background/95 backdrop-blur-xl border-t border-border/40 z-20">
            <div className="max-w-3xl mx-auto">
                <QueryInput onSubmit={handleQuery} isLoading={isLoading} />
                <p className="text-center text-[10px] text-muted-foreground mt-2 opacity-50">
                    MoneyPlan AI pode cometer erros. Verifique informações importantes.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
