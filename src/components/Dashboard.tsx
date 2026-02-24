import { useState, useRef, useEffect } from "react";
import { AlertCircle, User } from "lucide-react";
import QueryInput from "./QueryInput";
import ChartDisplay from "./ChartDisplay";
import MetricsGrid from "./MetricsGrid";
import HistorySidebar from "./HistorySidebar";
import { ApiResponse } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { validateQuery, isApiConfigured, getApiUrl, getFetchTimeout } from "@/lib/api";
import { MoneyPlanLogo } from "@/components/brand/MoneyPlanLogo";

// Definindo o tipo de mensagem para o chat
type ChatMessage = {
  role: 'user' | 'assistant';
  content?: string;
  charts?: any[];
  metrics?: any[];
  error?: boolean;
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  // Agora usamos um Array de mensagens em vez de uma única resposta
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  // Ref para rolar o chat para baixo automaticamente
  const scrollRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const { history, saveConversation, deleteConversation } = useConversationHistory();

  // Rolar para o fim sempre que chegar mensagem nova
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleQuery = async (query: string) => {
    // 1. Adiciona a pergunta do usuário na tela imediatamente
    const userMessage: ChatMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);

    // Validação
    const validation = validateQuery(query);
    if (!validation.success) {
      toast({ title: "Inválido", description: validation.error, variant: "destructive" });
      return;
    }
    const validatedQuery = validation.data;
    
    if (!isApiConfigured()) {
       setError("API não configurada. Configure VITE_N8N_WEBHOOK_URL.");
       toast({ title: "Erro", description: "API não configurada", variant: "destructive" });
       return;
    }

    setIsLoading(true);
    setError(null);

    // --- MODO APRESENTAÇÃO / CHEAT CODE ---
    if (query.toLowerCase().includes("simul") || query.toLowerCase().includes("invest")) {
      setTimeout(() => {
        const mockResponse: ApiResponse = {
          conversation: `Simulação projetada com sucesso! Investindo R$ 500/mês a 1% ao mês, você terá cerca de R$ 3.076 em 6 meses. Veja o crescimento:`,
          net_worth: 3076.00,
          metrics: [
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
        
        // Adiciona a resposta da IA na lista
        const aiMessage: ChatMessage = { 
            role: 'assistant', 
            content: mockResponse.conversation,
            charts: mockResponse.charts,
            metrics: mockResponse.metrics
        };
        setMessages(prev => [...prev, aiMessage]);
        
        saveConversation(query, mockResponse);
        setIsLoading(false);
      }, 1500);
      return; 
    }

    // --- CHAMADA REAL API ---
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
      
      // Tratamento de dados (igual ao anterior)
      const netWorthValue = raw?.variaveis_matematicas?.net_worth ?? raw?.net_worth ?? 0;

      let metricsData = raw.metrics || [];
      if (raw.variaveis_matematicas && (!raw.metrics || raw.metrics.length === 0)) {
        metricsData = [
          { label: "Renda Mensal", value: `R$ ${raw.variaveis_matematicas.renda_mensal || 0}`, change: "Entrada", trend: "up" },
          { label: "Gasto Mensal", value: `R$ ${raw.variaveis_matematicas.gasto_mensal || 0}`, change: "Saída", trend: "down" },
          { label: "Sobra Mensal", value: `R$ ${raw.variaveis_matematicas.sobra_mensal || 0}`, change: "Saldo", trend: "neutral" },
          { label: "Meta Total", value: `R$ ${raw.variaveis_matematicas.meta_total || 0}`, change: "Alvo", trend: "up" }
        ];
      }

      const data: ApiResponse = { 
        ...raw, 
        net_worth: netWorthValue,
        metrics: metricsData 
      };

      // Adiciona resposta da IA
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.conversation || "Dados processados com sucesso.",
        charts: data.charts,
        metrics: metricsData
      };
      
      setMessages(prev => [...prev, aiMessage]);
      saveConversation(query, data);

    } catch (err) {
      let message = "Erro desconhecido";
      if (err instanceof Error) {
         if (err.name === "AbortError") message = "Timeout: Servidor demorou.";
         else if (err.message.includes("fetch")) message = "Erro de conexão.";
         else message = err.message;
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: `Erro: ${message}`, error: true }]);
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  // Função para carregar histórico lateral
  const handleSelectConversation = (id: string) => {
    const conversation = history.find((item) => item.id === id);
    if (conversation) {
      // Reconstrói o chat com aquela conversa única
      setMessages([
          { role: 'user', content: conversation.query },
          { 
            role: 'assistant', 
            content: conversation.response.conversation, 
            charts: conversation.response.charts,
            metrics: conversation.response.metrics 
          }
      ]);
      setSelectedConversationId(id);
    }
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    if (selectedConversationId === id) {
        setMessages([]); // Limpa a tela
        setSelectedConversationId(null);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar (Fica fixa à esquerda) */}
      <HistorySidebar
        history={history}
        selectedId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      
      {/* Background Effects (Reduzido para não pesar no scroll) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[600px] rounded-[100%] bg-primary/5 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)'
          }}
        />
      </div>

      {/* Área Principal (Chat) */}
      <div className="flex-1 flex flex-col relative min-w-0 z-10">
        
        {/* Header Compacto */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/50 backdrop-blur-md z-20">
            <div className="flex items-center gap-2">
                <MoneyPlanLogo size="sm" />
                <h1 className="text-xl font-bold tracking-tight">
                    <span className="text-primary text-glow-emerald">Money</span>
                    <span className="text-foreground">Plan</span>
                    <span className="text-primary">$</span>
                </h1>
            </div>
            {/* Streak Pequeno */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                <span className="text-lg drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]">🔥</span>
                <span className="text-sm font-bold text-orange-500">5 Dias</span>
            </div>
        </header>

        {/* Área de Scroll das Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
            <div className="max-w-3xl mx-auto space-y-8 pb-4">
                
                {/* Estado Vazio (Boas Vindas) */}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-fade-in">
                        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 mb-4 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]">
                            <MoneyPlanLogo size="xl" />
                        </div>
                        <h2 className="text-3xl font-display font-bold">Como posso ajudar suas finanças hoje?</h2>
                        <p className="text-muted-foreground max-w-md text-lg">
                            Pergunte sobre seus investimentos, registre gastos ou peça uma simulação de futuro.
                        </p>
                    </div>
                )}

                {/* Lista de Mensagens */}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                        
                        {/* Avatar do Robô (se for assistant) */}
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                <MoneyPlanLogo size="sm" />
                            </div>
                        )}

                        {/* Balão da Mensagem */}
                        <div className={`flex flex-col max-w-[90%] md:max-w-[80%] space-y-4`}>
                            
                            {/* Texto */}
                            {msg.content && (
                                <div className={`p-4 rounded-2xl shadow-lg ${
                                    msg.role === 'user' 
                                    ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-[0_4px_15px_rgba(16,185,129,0.2)]' 
                                    : 'glass-card text-foreground rounded-tl-sm border-border/50'
                                }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                </div>
                            )}

                            {/* Conteúdo Rico (Gráficos/Métricas) - Só aparece para o Assistente */}
                            {msg.role === 'assistant' && (
                                <>
                                    {msg.metrics && msg.metrics.length > 0 && (
                                        <MetricsGrid metrics={msg.metrics} />
                                    )}
                                    {msg.charts && msg.charts.length > 0 && (
                                        <ChartDisplay charts={msg.charts} />
                                    )}
                                </>
                            )}
                        </div>

                        {/* Avatar do Usuário (se for user) */}
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                                <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                             <MoneyPlanLogo size="sm" />
                        </div>
                        <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                
                {/* Elemento invisível para auto-scroll */}
                <div ref={scrollRef} />
            </div>
        </div>

        {/* Input Fixo no Rodapé */}
        <div className="p-4 bg-background/80 backdrop-blur-lg border-t border-border/40 z-20">
            <div className="max-w-3xl mx-auto">
                <QueryInput onSubmit={handleQuery} isLoading={isLoading} />
                <p className="text-center text-xs text-muted-foreground mt-2 opacity-60">
                    MoneyPlan$ pode cometer erros. Verifique informações importantes.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
