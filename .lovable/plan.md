

## Ajuste da Integracao com o Webhook n8n

### Problema Atual

O frontend espera um `ApiResponse` com campos `{ title, metrics, charts, conversation }`, mas o backend envia:

```text
{
  "resposta": "Texto da conversa",
  "intencao": "grafico" | "conversa",
  "variaveis_matematicas": { "net_worth": 1000, ... },
  "labels": ["Jan", "Fev", ...],
  "valores": [100, 200, ...]
}
```

Resultado: os dados chegam mas nenhum campo e mapeado corretamente -- o chat nao exibe a resposta, os graficos nao renderizam e o patrimonio permanece estatico.

---

### Solucao: Camada de Transformacao + Estado Global de Patrimonio

#### 1. Novo tipo `BackendResponse` (api.ts)

Criar a interface que representa exatamente o que o n8n envia, e uma funcao `transformBackendResponse` que converte para o `ApiResponse` que o frontend ja consome.

Mapeamento:
- `resposta` -> `conversation` (texto do assistente)
- `intencao === "grafico"` -> gera um `ChartItem` do tipo `bar` usando `labels` como `name` e `valores` como `value`
- `variaveis_matematicas.net_worth` -> extraido e retornado separadamente para atualizar o WealthWidget
- `titulo` (se vier vazio, gerar titulo automatico baseado na intencao)

#### 2. Modificar ChatView.tsx

Na funcao `handleQuery`, apos parsear o JSON:
- Chamar `transformBackendResponse(rawData)` ao inves de fazer cast direto para `ApiResponse`
- Adicionar `console.log` com label claro em cada etapa: raw response, dados transformados, erros
- Se `net_worth` vier na resposta, atualizar um novo estado `netWorth` que sera passado como prop para o `WealthWidget`

#### 3. Modificar WealthWidget.tsx

O componente ja aceita `patrimony` como prop (default 12450). Basta o `ChatView` passar o valor real quando disponivel. Nenhuma mudanca estrutural no widget -- apenas receber o valor atualizado.

---

### Resumo dos Arquivos

| Arquivo | Acao |
|---------|------|
| `src/types/api.ts` | **Modificar** - Adicionar `BackendResponse` e funcao `transformBackendResponse` |
| `src/components/views/ChatView.tsx` | **Modificar** - Usar transformacao, estado de patrimonio, console.logs de debug |
| `src/components/wealth/WealthWidget.tsx` | **Nenhuma mudanca** - Ja aceita `patrimony` como prop |

---

### Detalhes Tecnicos

#### api.ts - Novo Tipo e Transformacao

```text
Interface BackendResponse:
  resposta: string
  intencao: "grafico" | "conversa"
  titulo?: string
  tipo_grafico?: string
  variaveis_matematicas?: {
    net_worth?: number
    renda_mensal?: number
    gasto_mensal?: number
    sobra_mensal?: number
    meta_total?: number
  }
  labels?: string[]
  valores?: number[]

Funcao transformBackendResponse(raw: BackendResponse):
  retorna { apiResponse: ApiResponse, netWorth: number | null }

  Logica:
  1. conversation = raw.resposta || undefined
  2. title = raw.titulo || (raw.intencao === "grafico" ? "Analise Financeira" : undefined)
  3. Se intencao === "grafico" E labels/valores existem e tem length > 0:
     - Montar ChartItem com type = (raw.tipo_grafico || "bar")
     - data = labels.map((label, i) => ({ name: label, value: valores[i] || 0 }))
     - charts = [chartItem]
  4. Se variaveis_matematicas existem e tem valores > 0:
     - Montar MetricItem[] com renda, gasto, sobra (apenas os que forem > 0)
  5. netWorth = raw.variaveis_matematicas?.net_worth ?? null
```

#### ChatView.tsx - Mudancas

```text
Novos estados:
  const [netWorth, setNetWorth] = useState<number | null>(null)

Na funcao handleQuery, apos JSON.parse:
  console.log("[MoneyPlan] Raw API response:", rawData)

  const { apiResponse, netWorth: newNetWorth } = transformBackendResponse(rawData)

  console.log("[MoneyPlan] Transformed response:", apiResponse)
  console.log("[MoneyPlan] Net worth:", newNetWorth)

  setResponse(apiResponse)

  if (newNetWorth !== null) {
    setNetWorth(newNetWorth)
  }

  saveConversation(query, apiResponse)

No bloco de catch:
  console.error("[MoneyPlan] API Error:", err)

No JSX, passar netWorth para WealthWidget:
  <WealthWidget patrimony={netWorth ?? undefined} />
```

#### Console.log Strategy

Logs com prefixo `[MoneyPlan]` em 4 pontos criticos:
1. `[MoneyPlan] Raw API response:` - JSON bruto recebido do n8n
2. `[MoneyPlan] Transformed response:` - ApiResponse apos transformacao
3. `[MoneyPlan] Net worth:` - Valor extraido do net_worth
4. `[MoneyPlan] API Error:` - Qualquer erro durante o fetch/parse

Isso permite abrir o console do navegador e filtrar por "[MoneyPlan]" para ver exatamente o que esta chegando e como esta sendo transformado.

