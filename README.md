# MoneyPlan$ — IA Financeira com Personalidade

> Seu agente de inteligência artificial para finanças pessoais, com personalidades interativas, gamificação e análise de patrimônio em tempo real.

---

## ⚠️ Importante — Configuração do Backend (n8n)

A funcionalidade principal do chat com IA e as análises financeiras dependem de uma instância do **n8n** conectada via webhook.

**No momento, o n8n do projeto está desligado.** Para usar todas as funcionalidades da aplicação, você precisa configurar seu próprio workflow no n8n.

### Passo a passo para ativar o backend:

1. **Crie uma conta no n8n** (cloud ou self-hosted):  
   [https://n8n.io](https://n8n.io)

2. **Crie um novo workflow** com os seguintes nós:
   - **Webhook** (método `POST`, resposta `Last Node`)
   - **Agente de IA** ou **HTTP Request** para processar a consulta
   - **Merge Node** antes de retornar a resposta (obrigatório para evitar respostas parciais)

3. **Configure o Webhook** para receber o seguinte payload:
   ```json
   {
     "query": "sua pergunta financeira aqui"
   }
   ```

4. **Resposta esperada** do webhook (JSON):
   ```json
   {
     "response": "Resposta da IA",
     "chart": {
       "type": "bar|line|pie",
       "labels": ["Jan", "Fev", "Mar"],
       "data": [1000, 1500, 2000]
     },
     "metrics": {
       "patrimonioTotal": 45000,
       "rendaMensal": 3200,
       "despesasMensais": 2100
     }
   }
   ```

5. **Substitua a URL do webhook** no código:
   - Arquivo: `src/lib/api.ts`
   - Linha 56: `const N8N_WEBHOOK_URL = "https://SEU-WEBHOOK-N8N-AQUI"`

6. **Reinicie a aplicação** após salvar as alterações.

> Dica: Certifique-se de que o CORS está habilitado no seu webhook n8n para aceitar requisições do domínio da aplicação.

---

## Funcionalidades

- **Chat com IA Financeira** — Converse com personalidades de IA sobre investimentos, orçamento e planejamento patrimonial.
- **Dashboard Mitológico** — Visualize seus "Domínios de Riqueza" com cards temáticos e gráficos de alocação.
- **Metas & Sonhos** — Crie cofres digitais para seus objetivos financeiros com simulador de juros compostos.
- **Odisséia (Conquistas)** — Sistema de gamificação com conquistas mitológicas desbloqueáveis.
- **Personalidades de IA** — Escolha entre diferentes personas (conservadora, agressiva, sábia) para orientar seus conselhos.
- **Máquina do Tempo** — Simule cenários de investimento com juros compostos em diferentes perfis de risco.
- **Análises Visuais** — Gráficos interativos e holográficos para acompanhar seu patrimônio.

---

## Tecnologias

- [Vite](https://vitejs.dev/) — Build tool
- [React 18](https://react.dev/) — UI library
- [TypeScript](https://www.typescriptlang.org/) — Tipagem estática
- [Tailwind CSS](https://tailwindcss.com/) — Estilização
- [shadcn/ui](https://ui.shadcn.com/) — Componentes de UI
- [Framer Motion](https://www.framer.com/motion/) — Animações
- [Supabase](https://supabase.com/) — Backend-as-a-Service (Auth + Database)
- [n8n](https://n8n.io/) — Automação e orquestração de IA

---

## Rodando Localmente

### Pré-requisitos

- Node.js 18+
- npm ou bun

### Instalação

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>
cd moneyplains

# Instale as dependências
bun install
# ou
npm install

# Configure as variáveis de ambiente
# (O Vite já injeta as chaves do Supabase automaticamente no build)

# Inicie o servidor de desenvolvimento
bun run dev
# ou
npm run dev
```

A aplicação estará disponível em `http://localhost:8080` (ou a porta indicada no terminal).

---

## Estrutura de Navegação

| Rota | Descrição |
|------|-----------|
| `/` | Landing Page |
| `/login` | Login com Google OAuth |
| `/dashboard` | Chat com IA Financeira |
| `/metas` | Metas e Sonhos (Cofres Digitais) |
| `/missoes` | Odisséia — Sistema de Conquistas |
| `/personalidades` | Escolha de Personas de IA |
| `/conquistas` | Galeria de Conquistas |
| `/configuracoes` | Ajustes de Perfil |
| `/moneymark` | Dashboard Mobile (MoneyMark$) |

---

## Build para Produção

```bash
bun run build
# ou
npm run build
```

Os arquivos estáticos serão gerados na pasta `dist/`.

---

## Autenticação

O login é feito via **Google OAuth** integrado ao Supabase. Não é necessário criar senha — basta clicar em "Entrar com o Google".

---

## Observações

- A aplicação utiliza `sessionStorage` para dados sensíveis (expira em 7 dias).
- Sem o n8n ativo, o chat e as análises em tempo real não funcionarão. As demais funcionalidades (metas, conquistas, simulador) continuam operacionais.
- O projeto é otimizado para experiência mobile-first com PWA (manifest-only, sem Service Worker).

---

## Licença

Este produto não é consultoria financeira regulamentada.  
© 2025 MoneyPlan$. Todos os direitos reservados.
