export interface MetricItem {
  label: string;
  value: string;
  icon?: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface ChartItem {
  type: 'bar' | 'pie' | 'line';
  title: string;
  data: ChartDataPoint[];
}

export interface ApiResponse {
  title?: string;
  metrics?: MetricItem[];
  charts?: ChartItem[];
  conversation?: string;
}

export interface SavedConversation {
  id: string;
  query: string;
  response: ApiResponse;
  timestamp: number;
}

// Backend response from n8n webhook
export interface BackendResponse {
  resposta: string;
  intencao: "grafico" | "conversa";
  titulo?: string;
  tipo_grafico?: string;
  variaveis_matematicas?: {
    net_worth?: number;
    renda_mensal?: number;
    gasto_mensal?: number;
    sobra_mensal?: number;
    meta_total?: number;
  };
  labels?: string[];
  valores?: number[];
}

export function transformBackendResponse(raw: BackendResponse): {
  apiResponse: ApiResponse;
  netWorth: number | null;
} {
  const conversation = raw.resposta || undefined;
  const title = raw.titulo || (raw.intencao === "grafico" ? "Análise Financeira" : undefined);

  let charts: ChartItem[] | undefined;
  if (raw.intencao === "grafico" && raw.labels?.length && raw.valores?.length) {
    const chartType = (raw.tipo_grafico as ChartItem["type"]) || "bar";
    charts = [
      {
        type: chartType,
        title: title || "Gráfico",
        data: raw.labels.map((label, i) => ({
          name: label,
          value: raw.valores?.[i] || 0,
        })),
      },
    ];
  }

  let metrics: MetricItem[] | undefined;
  const vars = raw.variaveis_matematicas;
  if (vars) {
    const items: MetricItem[] = [];
    if (vars.renda_mensal && vars.renda_mensal > 0)
      items.push({ label: "Renda Mensal", value: `R$ ${vars.renda_mensal.toLocaleString("pt-BR")}`, icon: "TrendingUp" });
    if (vars.gasto_mensal && vars.gasto_mensal > 0)
      items.push({ label: "Gasto Mensal", value: `R$ ${vars.gasto_mensal.toLocaleString("pt-BR")}`, icon: "TrendingDown" });
    if (vars.sobra_mensal && vars.sobra_mensal > 0)
      items.push({ label: "Sobra Mensal", value: `R$ ${vars.sobra_mensal.toLocaleString("pt-BR")}`, icon: "Wallet" });
    if (vars.meta_total && vars.meta_total > 0)
      items.push({ label: "Meta Total", value: `R$ ${vars.meta_total.toLocaleString("pt-BR")}`, icon: "Target" });
    if (items.length > 0) metrics = items;
  }

  return {
    apiResponse: { title, metrics, charts, conversation },
    netWorth: vars?.net_worth ?? null,
  };
}

// Legacy types for backwards compatibility
export interface ChartData {
  labels: string[];
  valores: number[];
}
