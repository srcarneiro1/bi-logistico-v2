# BI Logístico V2 — Auditoria Final de Consistência UI/UX

> Estado de referência consolidado em 2026-08-27.
>
> Fonte de regras: `docs/BI_LOGISTICO_UI_UX_SKILL.md` + `docs/BI_LOGISTICO_DESIGN_LAYOUT_MEMORY.md` + `docs/FCA_STATUS_SELECTOR_BOUNDARY_REVIEW_2026-08-27.md`.

## 1. Objetivo

Garantir que a aplicação não apenas **pareça** padronizada, mas que a consistência esteja representada no código: mesma função → mesmo primitive/componente compartilhado → um único owner visual/comportamental.

A auditoria considera como dívida qualquer situação em que:

- duas folhas CSS implementam a mesma anatomia;
- uma página mantém alias histórico sem consumidor;
- `!important` é usado para vencer CSS da própria aplicação;
- um estado semântico é comunicado por múltiplos rails/fundos/classes redundantes;
- loading/empty/error são recriados localmente apesar de existir primitive;
- uma classe permanece no JSX sem produzir comportamento, semântica ou teste necessário;
- mobile depende de swipe horizontal para informação essencial;
- a mesma regra funcional é repetida em várias superfícies sem fonte única;
- um owner de página usa seletor descendente genérico capaz de atravessar a fronteira de um primitive compartilhado.

## 2. Gramática oficial

```text
Shell
└─ PageHeader
   ├─ Summary / Headline quando aplicável
   ├─ PageToolbar quando há busca/filtros locais
   ├─ SectionHeader para seção aberta
   ├─ Panel + PanelHeader para conteúdo encapsulado
   ├─ conteúdo / tabela / detalhe
   └─ feedback contextual
```

Primitives/componentes compartilhados oficiais:

- `PageHeader`
- `Panel` / `PanelHeader`
- `SectionHeader`
- `PageToolbar`
- `SearchField`
- `SummaryMetrics`
- `DetailHero` / `DetailMetrics`
- `MetricCard`
- `Badge` / `StatusBadge` / `MetricStatusBadge`
- `Chip`
- `ContextNotice`
- `EmptyState`
- `Skeleton`
- `FcaCompactList` para a representação compacta de FCA em contexto de entidade.

Regras semânticas:

- `Badge` = estado/status;
- `Chip` = contexto, contagem ou escopo;
- `ContextNotice` = orientação contextual não crítica;
- `EmptyState` = ausência de conteúdo fora de tabela;
- `table-empty` = somente célula/linha de tabela;
- vermelho de marca não deve funcionar como decoração de criticidade;
- cards permanecem neutros; semântica fica em badge, ícone, valor ou progressão.

## 3. Ownership CSS

A cascata oficial segue esta ordem:

1. `styles.css` — reset + autenticação;
2. `design-system.css` — tokens, base global, controles e botões;
3. `planner-shell.css` — shell, navegação, filtros globais e PageHeader;
4. foundations/primitives compartilhados;
5. owners de página/domínio;
6. `ui-utilities.css` — utilities semânticas de alta precedência;
7. `accessibility-interactions.css` — estados acessíveis finais.

Owners principais:

| Responsabilidade | Owner |
|---|---|
| Tokens / controles globais | `design-system.css` |
| Shell / topbar / filtros / PageHeader | `planner-shell.css` |
| Panel, SectionHeader, Summary, Chip, EmptyState | `ui-foundations.css` |
| DetailHero / DetailMetrics | `detail-primitives.css` |
| Tabelas responsivas / record cards / FCA compacto | `record-lists.css` |
| Charts | `components/SimpleLineChart.css` |
| Home | `home-dashboard.css` |
| KPIs | `kpis-dashboard.css` |
| Supervisores | `supervisors-discovery.css` |
| Depositantes | `depositors-discovery.css` |
| Financeiro | `finance-dashboard.css` |
| FCA lista/detalhe/form | `fca-workspace.css` |
| Administração geral / Substituições | `admin-workspace.css` |
| Fotos de supervisores | `admin-supervisors.css` |
| Feedback contextual / notices | `sections-feedback.css` |
| Utilities semânticas | `ui-utilities.css` |
| Estados de interação/acessibilidade | `accessibility-interactions.css` |

`SimpleLineChart.css` é o único owner de charts. `record-lists.css` é o único owner da transformação tabela desktop → record card mobile e da anatomia do `FcaCompactList`.

## 4. Matriz aba por aba

| Superfície | Anatomia | Primitives / owner | Resultado da auditoria | Status |
|---|---|---|---|---|
| Visão Geral | PageHeader → KPI section → panels → gestão à vista | `PageHeader`, `SectionHeader`, `MetricCard`, `Panel`, `Chip`, `EmptyState`; `home-dashboard.css` | Sem vazamento de página para badges/primitives nos blocos revisados. Finance summary é compartilhado deliberadamente com Financeiro/Depositante. | **CONFORME** |
| KPIs | PageHeader → KPI overview → análise → histórico → tabela | `MetricCard`, `SectionHeader`, `Panel`, `Chip`, responsive table; `kpis-dashboard.css` | Breakpoints não dependem de `!important`; composição de inventário é especialização funcional. | **CONFORME** |
| Supervisores | PageHeader → Detail 360 opcional → Summary → cards | `DetailHero`, `DetailMetrics`, `SummaryMetrics`, `Panel`, `Chip`, `EmptyState`, `FcaCompactList`; `supervisors-discovery.css` + `record-lists.css` | Mini-lista FCA local removida; `StatusBadge` não é mais atingido por `span` genérico. Painel passa a se chamar `FCAs pendentes no período`. | **CONFORME** |
| Depositantes | PageHeader → Toolbar → Detail 360 opcional → Summary → tabela | `PageToolbar`, `SearchField`, `DetailHero`, `DetailMetrics`, `Panel`, `Chip`, `Skeleton`, `EmptyState`, `FcaCompactList`, responsive table | Mini-lista FCA local removida; status e anatomia compacta compartilham o mesmo componente/owner de Supervisores. | **CONFORME** |
| Financeiro | PageHeader → headline → Summary → aviso condicional → panels | `SummaryMetrics`, `ContextNotice`, `Panel`, `Chip`, `EmptyState`; `finance-dashboard.css` | Headline financeiro permanece especialização legítima. Guardrail de despesa preservado. | **EXCEÇÃO JUSTIFICADA / CONFORME** |
| FCA — Lista | PageHeader → Summary filtro → Panel → Toolbar → tabela | `SummaryMetrics` variant `filters`, `Panel`, `PageToolbar`, `SearchField`, `Chip`, `Skeleton`, `EmptyState`, `StatusBadge`, responsive table | Contagem, filtro e status da linha usam a mesma `deriveFcaDisplayStatus()`. Um vencido não entra simultaneamente como aberto. | **CONFORME** |
| FCA — Detalhe | PageHeader → DetailHero → DetailMetrics → panels | `DetailHero`, `DetailMetrics`, `Panel`, `Chip`, `StatusBadge`, `EmptyState`, `Skeleton`; `fca-workspace.css` | Status principal usa `deriveFcaDisplayStatus()`; seletores internos de metadados/stepper foram restringidos para a estrutura que controlam. | **CONFORME** |
| FCA — Novo | PageHeader → Stepper → ContextNotice opcional → formulário | `FcaFormStepper`, `ContextNotice`, notices, botões; `fca-workspace.css` | Formulário mantém owner único; stepper compartilhado com edição. | **CONFORME** |
| FCA — Editar | PageHeader → Stepper → ContextNotice opcional → formulário | mesmos primitives de Novo FCA | Markup e feedback alinhados ao fluxo de criação. | **CONFORME** |
| Administração — Acessos | PageHeader → Summary → Toolbar → confirmação → Panel/tabela | `SummaryMetrics`, `PageToolbar`, `Panel`, `Chip`, `Badge`, `EmptyState`, `Skeleton`; `admin-workspace.css` | Confirmação é região contextual; badges usam primitive oficial. | **CONFORME** |
| Administração — Substituições | PageHeader → Summary → ContextNotice → workspace | `SummaryMetrics`, `ContextNotice`, `Panel`, `Chip`, `Badge`, `EmptyState`; `admin-workspace.css` | Formulários permanecem especialização legítima; nenhum vazamento confirmado para Badge nesta revisão. | **CONFORME** |
| Administração — Fotos de supervisores | PageHeader → Summary → Toolbar → ContextNotice → SectionHeader → cards | `SummaryMetrics`, `PageToolbar`, `ContextNotice`, `SectionHeader`, `Badge`, `Chip`, `EmptyState`; `admin-supervisors.css` | Grid de mídia permanece especializado; seletores de identidade/avatar não atravessam Badge. | **CONFORME** |

## 5. Status FCA — regra única de apresentação

`deriveFcaStatus()` continua representando o workflow base.

Quando a pergunta é **qual status o usuário deve ver**, a fonte única é:

```ts
deriveFcaDisplayStatus(fca)
```

Estados exibidos:

- `ABERTO`;
- `EM_ANDAMENTO`;
- `VENCIDO`;
- `CONCLUIDO`;
- `CANCELADO`.

A mesma função deve governar:

- contadores;
- filtros;
- tabela FCA;
- detalhe FCA;
- Supervisor 360;
- Depositante 360;
- `FcaCompactList`.

Não repetir localmente `isFcaOverdue(fca) ? 'VENCIDO' : deriveFcaStatus(fca)`.

## 6. Selector boundaries

### Regra

Um owner de página/domínio não pode estilizar `span`, `strong`, `small`, `button` etc. por descendência genérica quando o container pode hospedar um primitive compartilhado.

Preferir:

1. classe explícita do conteúdo;
2. filho direto (`>`);
3. componente/primitive compartilhado;
4. seletor explícito do primitive apenas para adaptação contextual deliberada.

### Vazamentos corrigidos nesta revisão

- `.supervisor-fca-list span` → removido com a adoção de `FcaCompactList`;
- `.fca-mini-list span` → removido com a adoção de `FcaCompactList`;
- `.sidebar-user span` → restringido a `.sidebar-user-copy>span`;
- `.analytics-warning span` → restringido ao bloco textual `>div>span`;
- metadados/stepper FCA → seletores restringidos a filhos diretos onde a estrutura é fechada.

### Adaptação contextual permitida

`record-lists.css` pode ajustar `.responsive-data-table .ui-status-badge` para densidade de tabela, desde que não redefina tone/cor semântica.

Não corrigir vazamento aumentando especificidade do primitive ou adicionando `!important`.

## 7. Resíduos históricos removidos nos ciclos de padronização

- `dashboard-panel`;
- `panel-chip` manual — substituído por `Chip`;
- `depositor-row-*`;
- `fca-mobile.css`;
- `fca-list-page`;
- `fca-summary-metrics`;
- `fca-detail-shared-hero`;
- `form-panel` no FCA;
- `section-title-row` no FCA;
- `supervisor-card-${status}`;
- `supervisor-card-priority-${status}`;
- `supervisor-discovery-grid`;
- `supervisor-grid-with-detail`;
- `admin-guidance`;
- `scope-note`;
- `substitute-context`;
- `substitution-admin-first`;
- `coverage-card.is-active` sem consumidor;
- `empty-chart` como empty state genérico;
- `loading-panel` sem consumidor;
- variáveis locais FCA não utilizadas;
- CSS duplicado de chart em `sections-feedback.css`;
- `.supervisor-fca-list` e `.fca-mini-list` como implementações paralelas de FCA compacto.

## 8. `!important` — classificação final

Não se aceita `!important` para conflito interno de componentes/páginas/mobile/utilities.

Exceções deliberadas:

1. `prefers-reduced-motion` em `accessibility-interactions.css` — preferência do usuário precisa vencer qualquer owner;
2. `font-family:'Material Symbols Rounded'!important` no hardening inline de `index.html` — infraestrutura de iconografia devido ao histórico de ligatures aparecendo como texto bruto.

## 9. Charts

`SimpleLineChart.css` é a única fonte de verdade para plot, eixo/grid, pontos, legenda, tooltip, mobile e reduced motion local. No mobile a legenda usa grade e não scroll horizontal obrigatório.

## 10. Feedback states

- carregamento de bloco → `Skeleton`;
- ausência fora de tabela → `EmptyState`;
- ausência em célula de tabela → `table-empty`;
- sucesso/erro compacto → `.notice notice-success|notice-error`;
- orientação contextual → `ContextNotice`;
- alerta operacional global → `analytics-warning`.

Não criar novos `empty-*`, `guidance-*` ou `context-*` locais sem justificar nova função.

## 11. Critério de concluído

Uma tela está conforme quando:

- a mesma função usa o mesmo primitive/componente compartilhado;
- a regra funcional de apresentação tem fonte única;
- o owner CSS é identificável;
- não há classe fantasma para geração visual anterior;
- não existe folha posterior apenas para corrigir outra folha;
- selector de página respeita a fronteira dos primitives;
- semantic color não vira decoração da superfície;
- mobile preserva informação essencial sem swipe lateral;
- loading/empty/error/success são previsíveis;
- diferença visual corresponde a diferença funcional real.

## 12. Regra para futuras mudanças

Antes de criar CSS ou lógica visual nova:

1. procurar primitive/componente equivalente;
2. procurar owner da função;
3. verificar a mesma função em pelo menos duas outras telas;
4. verificar se já existe função de domínio que governa o estado exibido;
5. preferir composição a override;
6. não usar `!important` para resolver conflito interno de cascata;
7. verificar selector boundaries quando houver `span`, `strong`, `small`, `button` etc. descendentes;
8. se um padrão surgir em 3+ superfícies, promover a primitive/componente;
9. validar desktop, tablet, mobile e mobile estreito no Preview Cloudflare do HEAD exato.

O objetivo não é tornar todas as abas idênticas. É garantir que **diferenças visuais expressem diferenças de função, e não diferenças de implementação histórica**.
