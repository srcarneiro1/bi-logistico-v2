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

### Bloco 1 — UI Foundations — EM ANDAMENTO
Branch: `refactor/ui-foundations-v1`
PR: #21 — `Cria UI Foundations e migra FCA como piloto`

Objetivo:
- criar primitives reutilizáveis;
- parar de criar novas regras específicas espalhadas em folhas antigas;
- validar o padrão em uma tela-piloto antes de migrar outras áreas.

Primitives adicionados:
- `Panel` / `PanelHeader`;
- `Badge` / `StatusBadge`;
- `SearchField`;
- `EmptyState`;
- `Skeleton`.

Nova camada CSS: `src/ui-foundations.css`.

Tela-piloto: `FcaListPage`.
- busca migrada para `SearchField`;
- loading migrado para skeleton;
- erro/vazio migrados para `EmptyState`;
- status migrado para `StatusBadge`;
- `aria-pressed` nos filtros de status;
- `scope="col"` nos cabeçalhos da tabela.

Feedback visual de 21/08/2026:
- estrutura geral aprovada pelo usuário;
- diferença visual ainda pequena, o que é aceitável para foundations;
- toolbar de busca/status ficou estranha por parecer um card dentro de outro e por mostrar borda/foco duplicado;
- correção aplicada no mesmo PR: toolbar sem contêiner externo, busca e select como controles independentes, foco único e layout mais leve.

Ainda não remover as folhas CSS antigas. A remoção deve ser progressiva conforme primitives assumirem responsabilidades.

### Bloco 2 — Shell UX — PENDENTE
- sidebar mobile com `aria-expanded` / `aria-controls`;
- fechamento com Escape;
- gestão de foco e retorno ao acionador;
- revisão da densidade da topbar/filtros;
- breakpoints consolidados.

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

## Próxima ação recomendada

Validar novamente o Preview do PR #21 após a simplificação da toolbar da FCA. Se aprovado:
1. revisar diff e build/testes disponíveis;
2. mergear o PR #21;
3. atualizar este arquivo na `main` com Bloco 1 concluído;
4. iniciar Bloco 2 em branch própria a partir da nova `main`.
