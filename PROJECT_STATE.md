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
PR: #22 — `Melhora acessibilidade do shell mobile`

Primeira versão entregue:
- `aria-expanded` e `aria-controls` no acionador mobile;
- identificação semântica da navegação;
- drawer anunciado como diálogo quando aberto;
- fechamento com `Escape`;
- foco inicial dentro do drawer;
- contenção de `Tab` dentro do drawer enquanto aberto;
- retorno de foco ao botão de abertura ao fechar;
- bloqueio de scroll do body durante abertura;
- labels explícitos em botões de navegação/logout.

Feedback visual do usuário em 21/08/2026: NÃO APROVADO na primeira versão.
Problemas observados:
- itens/ícones da sidebar ficaram visualmente na horizontal no mobile;
- controle para recolher/expandir sidebar ficou inconsistente;
- usuário prefere padronizar o controle desktop/mobile com ícone hamburger em vez de seta;
- tabelas no mobile ficaram feias e desorganizadas.

Correções aplicadas no mesmo PR #22:
- sidebar mobile explicitamente em coluna única, neutralizando regras conflitantes da cascade;
- drawer ampliado para 272px e navegação organizada verticalmente;
- botão X permanece para fechar o drawer mobile;
- controle de expandir/recolher no desktop passa a usar ícone hamburger em vez de chevrons;
- criado padrão `responsive-data-table` em `ui-foundations.css`;
- abaixo de 760px, tabelas responsivas deixam de depender de scroll horizontal e cada linha vira um card de dados com `data-label`;
- padrão aplicado em FCA, KPIs, detalhe de Supervisores, Depositantes e Despesas do Financeiro;
- desktop preserva apresentação tabular normal.

#### Bloco 2B — Densidade da topbar/filtros — PENDENTE
Tratar em PR separado após aprovação do 2A:
- reduzir competição visual entre título, filtros, escopo e status HUB;
- revisar toolbar de filtros em desktop/intermediário/mobile;
- consolidar breakpoints do shell sem alterar semântica dos filtros.

### Bloco 3 — Dashboard — PENDENTE
- hierarquia Primary KPI vs Supporting KPI;
- revisão do painel de pontos de atenção;
- reduzir redundância do resumo de escopo;
- headers de gráfico consistentes;
- responsividade/data-viz.

### Bloco 4 — Tables/FCA/Depositantes — PENDENTE
Parte do trabalho responsivo de tabelas foi antecipada no PR #22 por feedback do usuário. Ainda pendente:
- toolbar reutilizável em mais páginas;
- estados loading/empty em toda aplicação;
- refinamentos de densidade/ações em FCA e Depositantes;
- auditar tabelas administrativas restantes depois que o padrão responsivo for aprovado.

### Bloco 5 — Redução da dívida CSS — ÚLTIMO
O `main.tsx` ainda carrega várias folhas globais legadas. Não consolidar em massa. Remover regras somente depois de migrar responsabilidades para primitives e validar regressões.

## Últimas entregas consolidadas na main

- PR #17: correções isoladas da auditoria de UI.
- PR #18: correção de cobertura/autenticação de substitutos.
- PR #19: regressão mínima para filtros e coberturas.
- PR #20: tooltip nos pontos dos gráficos + quantidade de FCA nos cards de supervisores.
- PR #21: UI Foundations + FCA piloto + protocolo de continuidade entre chats.

## Próxima ação recomendada

Validar novamente o Preview do PR #22 em viewport mobile/tablet, agora com foco visual e funcional:
1. abrir o menu pelo hamburger;
2. confirmar que itens da sidebar aparecem em uma única coluna vertical;
3. fechar pelo X, backdrop e Escape;
4. confirmar foco/Tab dentro do drawer;
5. em desktop, verificar que o controle de recolher/expandir agora usa hamburger;
6. testar tabelas de FCA, KPIs, Supervisores, Depositantes e Financeiro em mobile;
7. confirmar que cada linha vira um card legível com rótulo + valor e sem scroll horizontal desnecessário;
8. confirmar que desktop continua com tabelas tradicionais.

Se aprovado: mergear #22 e iniciar 2B em branch nova a partir da main.
