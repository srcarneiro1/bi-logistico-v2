# BI Logístico V2 — Estado Vivo do Projeto

> Fonte operacional de continuidade entre chats. Antes de propor alterações relevantes, ler este arquivo e confirmar o estado atual da `main` e dos PRs abertos no GitHub.

## Comando de retomada

Comando combinado com o usuário: **`retomar BI Logístico`**.

Ao receber esse comando em um chat novo:
1. Ler este arquivo.
2. Consultar a `main` atual e os PRs abertos.
3. Ler `docs/BI_LOGISTICO_UI_UX_SKILL.md`.
4. Ler `docs/BI_LOGISTICO_DESIGN_LAYOUT_MEMORY.md`.
5. Ler `docs/UI_UX_CONSISTENCY_AUDIT.md`.
6. Se houver incidente recente, ler a memória específica citada neste arquivo.
7. Só então implementar ou recomendar mudanças.
8. Atualizar este arquivo quando uma decisão arquitetural, guardrail, incidente, feedback de validação ou etapa do roadmap mudar.

Não depender do histórico de uma conversa para reconstruir decisões. O GitHub é a fonte persistente do projeto.

## Baseline atual

Última `main` confirmada antes do incidente temporal de 2026-08-28:

- PR #57 mergeado;
- commit `fd5b9acbe12f948bc2d75c40fa9014778908a538`;
- seleção de Depositantes refinada sem estado genérico de tabela;
- status FCA e selector boundaries consolidados no PR #56;
- layout Home, UI/UX transversal e mobile já normalizados nos ciclos anteriores.

PR aberto no momento desta atualização:

- **#58 — Corrige escopo temporal no primeiro carregamento**;
- branch `fix/initial-period-scope`;
- objetivo: eliminar render analítico transitório com período vazio e reconciliação incorreta da lista de alertas;
- memória: `docs/INCIDENT_INITIAL_PERIOD_SCOPE_2026-08-28.md`.

Nunca assumir que #58 está mergeado sem confirmar GitHub/main.

## Fontes obrigatórias de UI/UX

Antes de qualquer criação ou alteração visual, ler nesta ordem:

1. `docs/BI_LOGISTICO_UI_UX_SKILL.md` — gramática visual e de interação;
2. `docs/BI_LOGISTICO_DESIGN_LAYOUT_MEMORY.md` — decisões persistentes, benchmarks e anti-patterns;
3. `docs/UI_UX_CONSISTENCY_AUDIT.md` — matriz atual das superfícies;
4. `docs/FCA_STATUS_SELECTOR_BOUNDARY_REVIEW_2026-08-27.md` — regra de selector boundaries;
5. `docs/DEPOSITOR_SELECTION_REVIEW_2026-08-27.md` — ownership de seleção de entidade.

Esses documentos têm precedência sobre backlogs visuais históricos.

## Stack e fronteiras

- React + TypeScript + Vite.
- Cloudflare Pages.
- Supabase: autenticação, FCA, auditoria, governança, substituições e fotos internas de supervisores.
- Google Sheets/HUB revisada: cadastros operacionais, KPIs e financeiro.
- Preline Analytics/Admin é benchmark principal de UI/UX, não dependência.
- Flowbite React, shadcn/ui, Tremor, TailAdmin e Mosaic podem ser usados como benchmarks de composição/componentes.
- Radix Primitives e React Aria são candidatos incrementais para componentes comportamentais complexos quando houver justificativa técnica.
- O projeto atual não usa Tailwind; uma eventual adoção real exige POC/ADR isolado e decisão arquitetural explícita.
- Não converter o projeto para Next.js/Tailwind apenas para reproduzir padrões de outra biblioteca ou template.

## Guardrails funcionais

- HUB original permanece intocada.
- HUB revisada é fonte de cadastros/KPIs/financeiro; mudanças de conteúdo são permitidas, mudanças estruturais são contrato e exigem revisão de parser.
- FCA e novas substituições não escrevem na planilha.
- Período analítico e período FCA são independentes.
- Cobertura de substituição é autorizada pelo par exato Supervisor titular + Módulo.
- Despesas consolidadas não podem ser aplicadas a Supervisor/Módulo quando a fonte não possui essas dimensões.
- Não alterar o comportamento de “Limpar filtros” sem decisão explícita.
- Mudanças pequenas, isoladas e validáveis; evitar patches multifuncionais.
- Não fazer merge sem autorização explícita do usuário.
- Responsividade é requisito de aceite: desktop, tablet, mobile e mobile estreito.
- Em mobile, conteúdo essencial não depende de swipe horizontal.
- iOS/WebKit: campos textuais/select/textarea focáveis usam fonte efetiva de 16px no mobile para evitar zoom automático; não bloquear pinch zoom via viewport.
- Estados semânticos não devem ser repetidos por rails/fundos/classes concorrentes.
- Navegação para detalhes deve preservar contexto de origem quando o usuário espera retorno ao mesmo item.
- Em cards, evitar rails/faixas/bordas coloridas decorativas.
- Selector de página não pode atravessar primitive compartilhado com descendência genérica (`span`, `strong`, `button` etc.) quando houver risco de alterar semântica do primitive.
- Estado de domínio específico não deve ser promovido para foundation apenas por estar dentro de um primitive compartilhado.
- Filtros globais obrigatórios devem estar resolvidos antes do primeiro render analítico. O controle visual nunca pode aparentar um período/escopo diferente do estado real usado pelos dados.

## Segurança de acesso — CONCLUÍDA NESTA FASE

Concluído e mergeado:

- PR #27 — hardening P0;
- PR #28 — governança `OWNER | ADMIN | USER`;
- PR #29 — MFA/TOTP para Owner/Admin;
- PR #30 — enforcement AAL2 + hardening final de governança.

Regras:

- RLS e autorização server-side preservados;
- `AAL2` obrigatório para Owner/Admin;
- usuário comum não passa pelo gate obrigatório de MFA;
- novo login de Owner/Admin pode exigir novamente TOTP para elevar a sessão a AAL2;
- navegação dentro de uma sessão já AAL2 não solicita código a cada aba.

Não reabrir segurança sem incidente ou requisito explícito.

## Fotos de supervisores — CONCLUÍDO

PR #46 mergeado.

- Administração → Fotos de supervisores.
- Bucket Supabase `supervisor-fotos` privado.
- URLs assinadas por 24h.
- JPG/PNG/WEBP até 2 MB, com validação binária.
- Escrita/remoção apenas backend Cloudflare com Owner/Admin + AAL2.
- `SupervisorID` validado contra HUB.
- Supabase tem prioridade; `FotoURL` HUB/SharePoint continua fallback.
- A coluna `FotoURL` ainda integra o contrato posicional atual de `dSupervisores`; não excluir fisicamente sem primeiro refatorar o parser. Pode ficar vazia quando o Supabase for a única foto desejada.

## KPI de Inventário — regra consolidada

PR #54 mergeado.

No contexto global ADMIN sem Supervisor/Módulo:

- a composição de Inventário usa `fKPI_Inventario` oficial;
- agosto/2026: Prazo 76,38%, Endereço 91,59%, Unidade 99,81%, SKU 58,97%, Pontuação Total 84,45%;
- não usar média simples dos `Total_Pct` dos depositantes como consolidado oficial.

Com Supervisor/Módulo filtrado:

- permanece temporariamente a média granular por depositante;
- a UI identifica a origem como média do escopo;
- cálculo oficial filtrável exigirá numeradores/denominadores equivalentes à fonte consolidada.

Memória: `docs/KPI_INVENTORY_AGGREGATION_RULE.md`.

## UI/UX — estado consolidado

Ciclos #31–#57 tratados e mergeados até o baseline informado acima.

Entregue:

- `PageHeader`, `Panel/PanelHeader`, `SectionHeader`, `PageToolbar`, `SearchField`;
- `SummaryMetrics`, `MetricCard`, `DetailHero/DetailMetrics`;
- `Badge/StatusBadge/MetricStatusBadge`, `Chip`, `ContextNotice`;
- `EmptyState`, `Skeleton` e feedback states;
- `responsive-data-table` / record cards mobile;
- `FcaCompactList` compartilhado;
- `SimpleLineChart.css` como owner único de charts;
- `record-lists.css` como owner de anatomia de tabelas/record cards;
- selector boundaries formalizados;
- status FCA exibido centralizado em `deriveFcaDisplayStatus()`;
- seleção do Depositante com owner local (`depositor-row-selected`), sem `selected-row` global;
- foco de linha compartilhada somente por foco visível, não por clique comum;
- Home com coluna lateral compactada no desktop;
- iOS mobile sem zoom automático em campos textuais por fonte <16px;
- touch targets recorrentes alinhados a aproximadamente 44px no mobile;
- CSS transversal de correção (`context-ux.css`, `transversal-refinement.css`, `fca-mobile.css`) removido nos ciclos anteriores;
- `!important` interno eliminado, exceto reduced-motion deliberado e hardening Material Symbols.

As 12 superfícies principais são consideradas conformes segundo `docs/UI_UX_CONSISTENCY_AUDIT.md`, respeitando exceções funcionais documentadas.

## Incidente 2026-08-28 — dados históricos no primeiro carregamento

Memória obrigatória: `docs/INCIDENT_INITIAL_PERIOD_SCOPE_2026-08-28.md`.

Sintoma:

- período visual mostrava `ago 2026`;
- alguns usuários viam linhas de competências antigas em `Pontos de atenção`;
- Alex via CELLERA FARMA com valores de abr./mai. 2025;
- Dimas via BAOBÁ B2B repetida por competências diferentes;
- em Alex, o chip já indicava `3 alertas` enquanto a lista mantinha mais linhas antigas.

Causa raiz identificada:

1. `filters.periodo` iniciava vazio;
2. o HUB era publicado para páginas antes de `defaultPeriod()` ser aplicado por um `useEffect` posterior;
3. o select, sem opção vazia, já mostrava visualmente o primeiro período disponível;
4. `scoped()` recebia período vazio e processava histórico;
5. Home usava `key={r.cnpj}` durante esse estado com vários meses, produzindo chaves React duplicadas;
6. após o período ser aplicado, o total podia estar correto e a lista ainda manter nós históricos por reconciliação inadequada.

Não foi encontrada evidência de erro na HUB ou vazamento de autorização:

- Dimas = `USUARIO`, SupervisorID `334294`;
- Alex = `USUARIO`, SupervisorID `300068`;
- `dDepositantes` não contém BAOBÁ B2B duplicada;
- backend filtra facts por SupervisorID/Módulo antes de responder usuário operacional;
- endpoint bootstrap não mantém cache de payload entre usuários.

Correção no PR #58:

- resolver período contra `nextHub` dentro de `refreshHub()` antes de publicar o HUB;
- remover inicialização temporal tardia por `useEffect`;
- validar período existente em refresh e cair para `defaultPeriod()` quando necessário;
- usar identidade de alerta `período + CNPJ + supervisor + módulo`.

Critério esperado em ago./2026:

- Alex: 3 alertas reais — BIOCHIMICO, CELLERA CONSUMO, CELLERA FARMA — sem valores históricos antigos;
- Dimas: 6 alertas operacionais, sem BAOBÁ B2B repetida por mês.

## Atualização da HUB / confiança operacional

A ponte Apps Script lê a HUB revisada e possui cache curto. O BI não deve depender de um valor visual de filtro ainda não materializado no estado.

Pendência futura possível, ainda não implementada:

- botão discreto “Atualizar dados”;
- indicação “Atualizado há X min” usando `sourceUpdatedAt`;
- refresh automático controlado enquanto a aplicação estiver ativa.

Não implementar sem novo ciclo/decisão explícita.

## Próximo ciclo ao retomar

Ao receber `retomar BI Logístico`:

1. confirmar `main` e PRs abertos;
2. se #58 ainda estiver aberto, validar HEAD exato e Cloudflare antes de qualquer outro trabalho;
3. reproduzir login novo e conferir que período visual = período efetivo desde o primeiro render;
4. validar Alex/Dimas pelos critérios documentados;
5. não reabrir redesign amplo — a base visual está consolidada;
6. manter mudanças futuras incrementais, com owner claro e sem sobreposição/maquiagem;
7. não fazer merge sem autorização explícita do usuário.
