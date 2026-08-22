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

### Bloco 2 — Shell UX — APROVADO PARA MERGE

PR #22 — shell mobile + tabelas responsivas
PR #23 — topbar + toolbar de filtros

Entregue:
- drawer acessível com Escape, focus trap, retorno de foco e bloqueio de scroll;
- drawer mobile/tablet com navegação vertical;
- breakpoint do drawer ampliado para até 1100px;
- tabelas responsivas em cards abaixo de 760px;
- `Gestão à vista / Pontos de atenção` com layout mobile próprio;
- controle de menu inspirado no Forecast Planner (`menu_open` expandido / `menu` recolhido);
- correção final da sidebar: nenhum botão pode escapar da largura útil no estado recolhido; logo e controle ficam centralizados dentro dos 68px;
- drawer mobile/tablet mostra somente o botão X como fechamento, com ícone explicitamente visível;
- topbar contém apenas página atual, escopo ativo e status HUB;
- filtros em `filter-toolbar` dedicada e sticky;
- desktop horizontal, tablet em grade e mobile empilhado;
- regras de período, supervisor, módulo e reset preservadas.

Último feedback do usuário em 21/08/2026: alterações boas, com duas correções finais solicitadas — inconsistência da sidebar e posição do Supervisor 360º. Ambas corrigidas no topo da pilha e autorizado merge após correção.

### Bloco 3 — Dashboard e data visualization — APROVADO PARA MERGE

PR #24 — `Restaura legenda interativa dos gráficos`

Entregue:
- legenda do `SimpleLineChart` é clicável e acessível;
- clicar oculta/exibe linha e pontos;
- eixo Y recalcula pelas séries visíveis;
- eixo X preserva períodos;
- tooltip permanece;
- última série visível não pode ser ocultada.

Ainda pendente para próximo ciclo:
- hierarquia Primary KPI vs Supporting KPI;
- refinamento amplo do Dashboard;
- headers e responsividade adicional de gráficos.

### Bloco 4 — Supervisor 360º — APROVADO PARA MERGE

PR #25 — `Cria visão 360 dos supervisores`

Entregue:
- selecionar um card de supervisor expande uma única superfície integrada, no padrão conceitual da visão 360º de Depositantes;
- correção final: a visão expandida agora aparece **acima da grade de supervisores**, logo após o PageHeader, assim como a experiência de Depositantes;
- hero com foto/avatar, nome, módulos, quantidade de depositantes, FCAs e status da carteira;
- quatro KPIs: Produção, Recebimento, Inventário e FCAs pendentes;
- carteira por depositante e FCAs pendentes integrados na mesma visão;
- carteira mantém tabela desktop e cards responsivos no mobile;
- clicar em depositante continua abrindo a visão de Depositantes;
- cards de supervisor usam `aria-expanded` e `aria-controls`;
- filtros e cálculos de FCA/KPI preservados.

### Bloco 5 — Redução da dívida CSS — ÚLTIMO
O `main.tsx` ainda carrega várias folhas globais legadas. Não consolidar em massa. Remover regras somente depois de migrar responsabilidades para primitives e validar regressões.

## Últimas entregas consolidadas na main antes deste ciclo

- PR #17: correções isoladas da auditoria de UI.
- PR #18: correção de cobertura/autenticação de substitutos.
- PR #19: regressão mínima para filtros e coberturas.
- PR #20: tooltip nos pontos dos gráficos + quantidade de FCA nos cards de supervisores.
- PR #21: UI Foundations + FCA piloto + protocolo de continuidade entre chats.

## Integração autorizada em 21/08/2026

Integrar na ordem:
1. #22
2. #23
3. #24
4. #25

Após os merges, atualizar este arquivo na `main` com os SHAs finais e marcar os Blocos 2, 3 (legenda) e 4 como concluídos.

## Próximo ciclo

Quando o usuário disser `retomar BI Logístico` em um novo chat:
1. conferir se #22–#25 foram mergeados;
2. partir para o refinamento amplo do Dashboard;
3. depois expandir primitives/estados e, por último, reduzir a dívida de CSS global.
