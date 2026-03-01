

## Plano de Implementacao

### 1. Trocar a imagem de fundo do projeto

Atualmente, o fundo do app e gerado por CSS (circulos com blur e grid pattern no `AppLayout.tsx`, linhas 34-48). O plano e:

- Copiar a imagem enviada (`user-uploads://fundompsemimg.png`) para `src/assets/fundompsemimg.png`
- No `AppLayout.tsx`, substituir os efeitos de fundo CSS atuais (divs com blur/grid) por uma tag `<img>` usando a imagem importada, posicionada com `fixed inset-0 object-cover` e `pointer-events-none`, mantendo o `z-0`

### 2. Adicionar Select (Dropdown) no card da Maquina do Tempo

No componente `TimeMachineSimulator.tsx`, adicionar um `Select` estilizado no canto superior direito do header do card. O dropdown permitira escolher o tipo de investimento/cenario de simulacao (ex: "Conservador", "Moderado", "Arrojado"), ajustando automaticamente a taxa de rentabilidade.

**Mudancas tecnicas:**

- Importar o componente `Select` do shadcn (`@/components/ui/select`)
- Adicionar estado `investmentProfile` com opcoes como:
  - Conservador (6% a.a.)
  - Moderado (10% a.a.)
  - Arrojado (15% a.a.)
  - Personalizado (valor manual atual)
- Posicionar o Select no header do card usando `flex justify-between` (ja existe parcialmente)
- Ao selecionar um perfil, atualizar o slider de rentabilidade automaticamente; ao escolher "Personalizado", manter o controle manual
- Estilizar o Select com classes consistentes com o design system (glass-card, cores neon)

### Arquivos modificados

| Arquivo | Alteracao |
|---|---|
| `src/assets/fundompsemimg.png` | Novo arquivo (copia da imagem) |
| `src/components/layout/AppLayout.tsx` | Substituir efeitos CSS de fundo pela imagem |
| `src/components/metas/TimeMachineSimulator.tsx` | Adicionar Select de perfil de investimento no header |

