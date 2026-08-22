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

Escopo:
- `aria-expanded` e `aria-controls` no acionador mobile;
- identificação semântica da navegação;
- drawer anunciado como diálogo quando aberto;
- fechamento com `Escape`;
- foco inicial dentro do drawer;
- contenção de `Tab` dentro do drawer enquanto aberto;
- retorno de foco ao botão de abertura ao fechar;
- bloqueio de scroll do body durante abertura;
- labels explícitos em botões de navegação/logout;
- sem alteração visual da topbar ou regras de filtro.

#### Bloco 2B — Densidade da topbar/filtros — PENDENTE
Tratar em PR separado após validação do 2A:
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
- toolbar reutilizável;
- semântica consistente de tabelas;
- estados loading/empty em toda aplicação;
- refinamento de FCA e Depositantes.

### Bloco 5 — Redução da dívida CSS — ÚLTIMO
O `main.tsx` ainda carrega várias folhas globais legadas. Não consolidar em massa. Remover regras somente depois de migrar responsabilidades para primitives e validar regressões.

## Últimas entregas consolidadas na main

- PR #17: correções isoladas da auditoria de UI.
- PR #18: correção de cobertura/autenticação de substitutos.
- PR #19: regressão mínima para filtros e coberturas.
- PR #20: tooltip nos pontos dos gráficos + quantidade de FCA nos cards de supervisores.
- PR #21: UI Foundations + FCA piloto + protocolo de continuidade entre chats.

## Próxima ação recomendada

Validar o Preview do Bloco 2A em viewport mobile/tablet:
1. abrir menu pelo botão hamburger;
2. verificar foco no botão de fechar;
3. usar Tab/Shift+Tab e confirmar que o foco permanece dentro do drawer;
4. fechar com Escape e confirmar retorno de foco ao hamburger;
5. fechar pelo backdrop e pelo botão X;
6. navegar para outra rota e confirmar fechamento automático;
7. confirmar que desktop permanece visualmente igual.

Se aprovado: mergear 2A e iniciar 2B em branch nova a partir da main.
