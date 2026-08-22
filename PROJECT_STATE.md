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
- breakpoint do drawer ampliado para até 1100px para eliminar o estado intermediário de sidebar estreita em tablet;
- padrão responsivo de tabelas em cards abaixo de 760px;
- `Gestão à vista / Pontos de atenção` com layout mobile próprio;
- controle de menu refinado para replicar o padrão visual do Forecast Planner: `menu_open` expandido e `menu` recolhido, mesmo peso/escala de ícone e botão compacto.

Último feedback do usuário: mudanças funcionais aprovadas; único refinamento pedido foi aproximar o hamburger do Forecast Planner. Ajuste aplicado e o trabalho pode seguir para os próximos blocos.

#### Bloco 2B — Topbar + filtros — EM VALIDAÇÃO
Branch: `refactor/topbar-filter-toolbar`
Base: `refactor/shell-accessibility` (stacked sobre #22)

Objetivo:
- retirar filtros da mesma faixa de título/escopo/status HUB;
- manter topbar curta e legível;
- criar toolbar dedicada de filtros logo abaixo;
- preservar integralmente regras de período, supervisor, módulo e reset.

Implementado:
- topbar agora contém apenas página atual, escopo ativo e status HUB;
- filtros ficam em `filter-toolbar` própria;
- desktop: toolbar horizontal com rótulos e controles compactos;
- intermediário/tablet: filtros em grade de três colunas;
- mobile: filtros empilhados;
- toolbar é sticky abaixo da topbar;
- rotas contextuais continuam sem filtros globais;
- nenhuma regra de filtro foi alterada.

### Bloco 3 — Dashboard e data visualization — PRÓXIMO
- hierarquia Primary KPI vs Supporting KPI;
- revisão do painel de pontos de atenção;
- reduzir redundância do resumo de escopo;
- headers de gráfico consistentes;
- responsividade/data-viz;
- restaurar interação dos gráficos: clicar na legenda oculta a série e clicar novamente exibe a série; preservar tooltip, acessibilidade e pelo menos uma série visível.

### Bloco 4 — Supervisores / Tables / FCA / Depositantes — PENDENTE
- detalhe do Supervisor deve evoluir para experiência equivalente ao 360º de Depositantes: selecionar card expande a área de detalhes de forma clara, sem sensação de tabela solta abaixo;
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

1. Validar o Preview do #22 com o controle de menu refinado.
2. Validar o Preview do Bloco 2B: topbar + filter toolbar em desktop, tablet e mobile.
3. Criar PR isolado para legenda clicável do `SimpleLineChart`.
4. Criar PR isolado para Supervisor 360º.
5. Só depois seguir para hierarquia e refinamento amplo do Dashboard.
