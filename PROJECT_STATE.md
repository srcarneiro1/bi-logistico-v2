# BI Logístico V2 — Estado Vivo do Projeto

> Fonte operacional de continuidade entre chats. Antes de propor alterações relevantes, ler este arquivo e confirmar o estado atual da `main` e dos PRs abertos no GitHub.

## Comando de retomada

Comando combinado com o usuário: **`retomar BI Logístico`**.

Ao receber esse comando em um chat novo, seguir obrigatoriamente esta sequência:
1. Ler este arquivo (`PROJECT_STATE.md`).
2. Consultar a `main` atual e os PRs abertos.
3. Identificar o bloco atual, o último feedback validado e a próxima ação.
4. Validar o arquivo diretamente relacionado ao próximo bloco.
5. Só então implementar ou recomendar mudanças.
6. Atualizar este arquivo quando uma decisão arquitetural, guardrail, feedback de validação ou etapa do roadmap mudar.

Não depender do histórico de uma conversa para reconstruir decisões. O GitHub é a fonte persistente do projeto.

## Stack e fronteiras

- React + TypeScript + Vite.
- Cloudflare Pages.
- Supabase: autenticação, FCA, auditoria e substituições.
- Google Sheets/HUB revisada: cadastros operacionais, KPIs e financeiro.
- Forecast Planner e Preline podem ser usados como benchmarks visuais, nunca como dependência de runtime sem decisão explícita.
- O projeto não deve ser convertido para Next.js/Tailwind apenas para reproduzir padrões de outra biblioteca.
- Preline é o benchmark principal de UI/UX para shell/offcanvas, densidade de dashboard, tabelas responsivas, estados interativos, hierarquia visual e acessibilidade. Não instalar Preline neste estágio.

## Guardrails funcionais

- HUB original permanece intocada.
- FCA e novas substituições não escrevem na planilha.
- Período analítico e período FCA são independentes.
- Cobertura de substituição é autorizada pelo par exato Supervisor titular + Módulo.
- Despesas consolidadas não podem ser aplicadas a Supervisor/Módulo quando a fonte não possui essas dimensões.
- Não alterar o comportamento de “Limpar filtros” sem decisão explícita.
- Mudanças pequenas, isoladas e validáveis; evitar grandes patches multifuncionais.

## Roadmap UI/UX — objetivo 10/10

Benchmark principal: Preline como referência de arquitetura visual e padrões de aplicação, sem instalar a biblioteca neste estágio.

### Bloco 1 — UI Foundations — CONCLUÍDO
PR #21 — `Cria UI Foundations e migra FCA como piloto`
Merge na main: `511fb33a1a8fb8bd0691ee54e4904467bbc99fd9`

Entregue:
- `Panel` / `PanelHeader`;
- `Badge` / `StatusBadge`;
- `SearchField`;
- `EmptyState`;
- `Skeleton`;
- `src/ui-foundations.css`;
- FCA usada como tela-piloto;
- toolbar corrigida após feedback visual do usuário;
- `aria-pressed` nos filtros de status;
- `scope="col"` nos cabeçalhos da tabela.

Validação do usuário: aprovada em 21/08/2026.

Ainda não remover folhas CSS antigas. A remoção será progressiva conforme primitives assumirem responsabilidades.

### Bloco 2 — Shell UX — EM ANDAMENTO

#### Bloco 2A — Mobile + acessibilidade
Branch: `refactor/shell-accessibility`
PR: #22 — shell mobile + tabelas responsivas

Entregue/ajustado:
- `aria-expanded` e `aria-controls` no acionador mobile;
- drawer com semântica, fechamento por Escape, focus trap, retorno de foco e bloqueio de scroll;
- drawer mobile/tablet com navegação vertical;
- breakpoint do drawer ampliado para até 1100px;
- padrão responsivo de tabelas em cards abaixo de 760px;
- `Gestão à vista / Pontos de atenção` com layout mobile próprio;
- controle de menu replicando o padrão do Forecast Planner: `menu_open` expandido e `menu` recolhido, mesmo peso/escala de ícone e botão compacto.

Último feedback do usuário: mudanças funcionais aprovadas; hamburger precisava ficar visualmente mais próximo do Forecast Planner. Ajuste aplicado.

#### Bloco 2B — Topbar + filtros — EM VALIDAÇÃO
Branch: `refactor/topbar-filter-toolbar`
PR: #23 — `Separa topbar e toolbar de filtros`
Base: `refactor/shell-accessibility`

Implementado:
- topbar contém apenas página atual, escopo ativo e status HUB;
- filtros ficam em `filter-toolbar` própria;
- desktop: toolbar horizontal com labels;
- intermediário/tablet: filtros em grade;
- mobile: filtros empilhados;
- toolbar sticky abaixo da topbar;
- rotas contextuais continuam sem filtros globais;
- regras de período, supervisor, módulo e reset preservadas.

### Bloco 3 — Dashboard e data visualization — EM ANDAMENTO

#### Legenda interativa dos gráficos
Branch: `feat/chart-toggle-series`
Base: `refactor/topbar-filter-toolbar` (stacked sobre #23)

Implementado:
- legenda do `SimpleLineChart` vira controle clicável;
- clicar oculta a série (linha + pontos);
- clicar novamente exibe;
- tooltip permanece funcional para séries visíveis;
- eixo Y recalcula com as séries visíveis;
- eixo X preserva todos os períodos do conjunto original;
- não é permitido ocultar a última série visível;
- controles usam botão, `aria-pressed`, `aria-label` e foco por teclado;
- série oculta fica visualmente atenuada/rasurada na legenda.

Ainda pendente no Bloco 3:
- hierarquia Primary KPI vs Supporting KPI;
- revisão do painel de pontos de atenção;
- reduzir redundância do resumo de escopo;
- headers de gráfico consistentes;
- responsividade/data-viz adicional.

### Bloco 4 — Supervisores / Tables / FCA / Depositantes — PRÓXIMO
- detalhe do Supervisor deve evoluir para experiência equivalente ao 360º de Depositantes: selecionar card expande uma área integrada de detalhes, sem sensação de tabela solta abaixo;
- toolbar reutilizável em mais páginas;
- estados loading/empty em toda aplicação;
- refinamentos de densidade/ações em FCA e Depositantes.

### Bloco 5 — Redução da dívida CSS — ÚLTIMO
O `main.tsx` ainda carrega várias folhas globais legadas. Não consolidar em massa. Remover regras somente depois de migrar responsabilidades para primitives e validar regressões.

## Últimas entregas consolidadas na main

- PR #17: correções isoladas da auditoria de UI.
- PR #18: correção de cobertura/autenticação de substitutos.
- PR #19: regressão mínima para filtros e coberturas.
- PR #20: tooltip nos pontos dos gráficos + quantidade de FCA nos cards de supervisores.
- PR #21: UI Foundations + FCA piloto + protocolo de continuidade entre chats.

## Próximas ações

1. Validar #22 (shell/hamburger/tablet/mobile).
2. Validar #23 (topbar + toolbar de filtros).
3. Validar legenda clicável dos gráficos.
4. Implementar Supervisor 360º em PR isolado.
5. Depois seguir para hierarquia e refinamento amplo do Dashboard.
