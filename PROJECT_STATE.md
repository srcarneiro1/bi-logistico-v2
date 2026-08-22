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
- controle de expandir/recolher e botão de abertura usam o mesmo `HamburgerGlyph` próprio em CSS, sem depender de Material Symbols;
- botão X permanece para fechar o drawer;
- padrão `responsive-data-table` abaixo de 760px: linhas viram cards com rótulo + valor;
- aplicado em FCA, KPIs, detalhe de Supervisores, Depositantes e Despesas do Financeiro;
- Administração de substituições já usa cards e não precisa conversão;
- `Gestão à vista / Pontos de atenção` ganhou layout mobile específico: cabeçalho do depositante + três métricas organizadas em cards internos, sem a grade desktop comprimida.

Feedbacks do usuário que motivaram as revisões:
- primeira versão do #22 não aprovada;
- sidebar mobile apresentou itens/ícones inadequados;
- controle desktop não aparentava hamburger no preview;
- faixa intermediária/tablet ficou visualmente ruim com sidebar estreita;
- tabelas convertidas para cards foram aprovadas visualmente;
- `Gestão à vista` ficou ruim em mobile e foi corrigido separadamente.

#### Bloco 2B — Densidade da topbar/filtros — PENDENTE
Tratar em PR separado após aprovação do 2A:
- reduzir competição visual entre título, filtros, escopo e status HUB;
- revisar toolbar de filtros em desktop/intermediário/mobile;
- consolidar breakpoints do shell sem alterar semântica dos filtros.

### Bloco 3 — Dashboard e data visualization — PENDENTE
- hierarquia Primary KPI vs Supporting KPI;
- revisão do painel de pontos de atenção;
- reduzir redundância do resumo de escopo;
- headers de gráfico consistentes;
- responsividade/data-viz;
- RESTAURAR interação antiga dos gráficos: clicar na legenda oculta a série e clicar novamente exibe a série; preservar tooltip, acessibilidade e pelo menos uma série visível.

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

## Próxima ação recomendada

Validar novamente o Preview do PR #22 em três larguras: desktop, tablet/intermediário e mobile.

Checklist:
1. desktop: hamburger de recolher/expandir deve aparecer como três linhas;
2. tablet/intermediário: sidebar fixa estreita não deve existir; navegação deve abrir como drawer pelo hamburger;
3. mobile: drawer vertical com rótulos, X, backdrop e Escape;
4. tabelas: manter cards responsivos já aprovados;
5. Home mobile: `Gestão à vista` deve ficar organizada, sem pontos/colunas desalinhados;
6. desktop deve preservar layout analítico atual.

Se aprovado:
1. mergear #22;
2. iniciar Bloco 2B (topbar/filtros) em branch própria;
3. em seguida criar PR isolado para legenda clicável do `SimpleLineChart`;
4. depois criar PR isolado para detalhe expandido/360º de Supervisor.
