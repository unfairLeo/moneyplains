import { useState, useRef, useEffect } from "react";
import { User, Bot, Sparkles, Send } from "lucide-react"; 
import QueryInput from "./QueryInput";
import ChartDisplay from "./ChartDisplay";
import MetricsGrid from "./MetricsGrid";
import HistorySidebar from "./HistorySidebar";
import { ApiResponse } from "@/types/api";
import { useToast } from "@/hooks/use-toast";
import { useConversationHistory } from "@/hooks/useConversationHistory";
import { validateQuery, isApiConfigured, getApiUrl, getFetchTimeout } from "@/lib/api";
import { MoneyPlanLogo } from "@/components/brand/MoneyPlanLogo";

// --- TIPO DAS MENSAGENS DO CHAT ---
type ChatMessage = {
  role: 'user' | 'assistant';
  content?: string;
  charts?: any[];
  metrics?: any[];
  error?: boolean;
};

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Lista que cresce (Scroll)
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  // Ref para forçar o scroll para baixo
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { history, saveConversation, deleteConversation } = useConversationHistory();

  // Efeito: Rola para o fim sempre que mensagens mudam
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleQuery = async (query: string) => {
    // 1. Joga a mensagem do usuário na tela IMEDIATAMENTE
    const userMessage: ChatMessage = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);

    // Validação
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

    // --- MODO APRESENTAÇÃO (SIMULAÇÃO) ---
    // Se digitar "simul" ou "invest", cria resposta falsa bonita
    if (query.toLowerCase().includes("simul") || query.toLowerCase().includes("invest")) {
      setTimeout(() => {
        const mockResponse = {
          conversation: `Simulação projetada com sucesso! Com aportes de R$ 500,00, veja o crescimento:`,
          metrics: [
             { label: "Investido", value: "R$ 3.000,00", change: "Total", trend: "neutral" },
             { label: "Retorno", value: "R$ 76,00", change: "+1.2%", trend: "up" }
          ],
          charts: [{
              title: "Projeção 6 Meses",
              data: [
                { name: "Mês 1", value: 500 }, { name: "Mês 2", value: 1050 },
                { name: "Mês 3", value: 1600 }, { name: "Mês 4", value: 2200 },
                { name: "Mês 5", value: 2800 }, { name: "Mês 6", value: 3076 }
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

    // --- CHAMADA REAL API ---
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
  // --- CORREÇÃO PARA LER OS DADOS DO SEU N8N ---

      // 1. Traduz 'labels' e 'valores' para o Gráfico
      let chartsData = raw.charts || [];
      if (raw.labels && raw.valores && raw.labels.length > 0) {
          const chartPoints = raw.labels.map((label: string, index: number) => ({
              name: label,
              value: raw.valores[index]
          }));
          
          chartsData = [{
              title: raw.titulo || "Análise Financeira",
              data: chartPoints
          }];
      }

      // 2. Traduz 'variaveis_matematicas' para os Cards
      let metricsData = raw.metrics || [];
      if (raw.variaveis_matematicas) {
          metricsData = []; // Reinicia para preencher certo
          const v = raw.variaveis_matematicas;
          if (v.renda_mensal) metricsData.push({ label: "Renda", value: `R$ ${v.renda_mensal}`, change: "Entrada", trend: "up" });
          if (v.gasto_mensal) metricsData.push({ label: "Gasto", value: `R$ ${v.gasto_mensal}`, change: "Saída", trend: "down" });
          if (v.sobra_mensal) metricsData.push({ label: "Sobra", value: `R$ ${v.sobra_mensal}`, change: "Saldo", trend: "neutral" });
          if (v.meta_total) metricsData.push({ label: "Meta", value: `R$ ${v.meta_total}`, change: "Alvo", trend: "up" });
      }

      // 3. Cria a mensagem lendo 'resposta' (que é o que o seu prompt manda)
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: raw.resposta || raw.conversation || "Dados processados.",
        charts: chartsData,
        metrics: metricsData
      };
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
    // ESTRUTURA FLEX COLUMN PARA OCUPAR TELA TODA
    <div className="flex h-screen bg-background overflow-hidden">
      
      {/* Sidebar na Esquerda */}
      <HistorySidebar
        history={history}
        selectedId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      
      {/* Área Principal do Chat */}
      <div className="flex-1 flex flex-col relative h-full w-full">
        
        {/* 1. TOPO: Header Fixo */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border/20 bg-background/80 backdrop-blur-md z-20 shrink-0">
            <div className="flex items-center gap-2">
                <MoneyPlanLogo size="sm" />
                <h1 className="text-lg font-bold">MoneyPlan<span className="text-primary">$</span></h1>
            </div>
            <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-500 flex items-center gap-1">
                🔥 5 Dias
            </div>
        </header>

        {/* 2. MEIO: Área de Mensagens (Scrollável) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
            <div className="max-w-3xl mx-auto space-y-6 pb-4">
                
                {/* Boas vindas (Só aparece se não tiver mensagens) */}
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="p-4 rounded-full bg-primary/10 mb-2">
                            <Sparkles className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold">Olá! Vamos organizar suas finanças?</h2>
                        <p className="text-muted-foreground max-w-sm">
                            Digite abaixo sobre seus gastos, investimentos ou peça uma simulação.
                        </p>
                    </div>
                )}

                {/* Renderização das Mensagens */}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                        
                        {/* Avatar do Robô */}
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0 mt-1">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                        )}

                        {/* Conteúdo (Texto + Gráficos) */}
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

                            {/* Se for robô, mostra gráficos DENTRO da mensagem */}
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

                {/* Loading State */}
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
                
                {/* Elemento invisível para auto-scroll */}
                <div ref={scrollRef} className="h-1" />
            </div>
        </div>

        {/* 3. RODAPÉ: Input Fixo */}
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
