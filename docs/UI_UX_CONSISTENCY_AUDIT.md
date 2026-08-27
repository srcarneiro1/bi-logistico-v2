# BI Logístico V2 — Auditoria Final de Consistência UI/UX

> Estado de referência após os ciclos #47, #48, #49 e #51, complementado pela auditoria final de 2026-08-27.
>
> Fonte de regras: `docs/BI_LOGISTICO_UI_UX_SKILL.md` + `docs/BI_LOGISTICO_DESIGN_LAYOUT_MEMORY.md`.

## 1. Objetivo

Garantir que a aplicação não apenas **pareça** padronizada, mas que a consistência esteja representada no código: mesma função → mesmo primitive → um único owner visual.

A auditoria considera como dívida qualquer situação em que:

- duas folhas CSS implementam a mesma anatomia;
- uma página mantém alias histórico sem consumidor;
- `!important` é usado para vencer CSS da própria aplicação;
- um estado semântico é comunicado por múltiplos rails/fundos/classes redundantes;
- loading/empty/error são recriados localmente apesar de existir primitive;
- uma classe permanece no JSX sem produzir comportamento, semântica ou teste necessário;
- mobile depende de swipe horizontal para informação essencial.

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

Primitives oficiais:

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
| Tabelas responsivas / record cards | `record-lists.css` |
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

`SimpleLineChart.css` é o único owner de charts. `record-lists.css` é o único owner da transformação tabela desktop → record card mobile.

## 4. Matriz aba por aba

| Superfície | Anatomia | Primitives / owner | Resultado da auditoria | Status |
|---|---|---|---|---|
| Visão Geral | PageHeader → KPI section → panels → gestão à vista | `PageHeader`, `SectionHeader`, `MetricCard`, `Panel`, `Chip`, `EmptyState`; `home-dashboard.css` | Removidos aliases de panel/escopo, rail semântico e empty state genérico. Finance summary é compartilhado de forma deliberada com Financeiro/Depositante. | **CONFORME** |
| KPIs | PageHeader → KPI overview → análise → histórico → tabela | `MetricCard`, `SectionHeader`, `Panel`, `Chip`, responsive table; `kpis-dashboard.css` | Breakpoints não dependem mais de `!important`. Composição de inventário é especialização funcional, não linguagem paralela. | **CONFORME** |
| Supervisores | PageHeader → Detail 360 opcional → Summary → cards | `DetailHero`, `DetailMetrics`, `SummaryMetrics`, `Panel`, `Chip`, `EmptyState`; `supervisors-discovery.css` | Removidos modificadores `supervisor-card-*` sem efeito, aliases de grid/panel e empty state local. Card mantém identidade própria por ser seletor de entidade. | **CONFORME** |
| Depositantes | PageHeader → Toolbar → Detail 360 opcional → Summary → tabela | `PageToolbar`, `SearchField`, `DetailHero`, `DetailMetrics`, `Panel`, `Chip`, `Skeleton`, `EmptyState`, responsive table; `depositors-discovery.css` | Tabela mobile usa owner compartilhado; FCA relacionado usa Skeleton/EmptyState; sem rails ou classes de severidade na linha. | **CONFORME** |
| Financeiro | PageHeader → headline → Summary → aviso condicional → panels | `SummaryMetrics`, `ContextNotice`, `Panel`, `Chip`, `EmptyState`; `finance-dashboard.css` | Headline financeiro permanece como especialização legítima. Guardrail de despesa preservado. Rails removidos; lista de receita pertence somente ao owner financeiro. | **EXCEÇÃO JUSTIFICADA / CONFORME** |
| FCA — Lista | PageHeader → Summary filtro → Panel → Toolbar → tabela | `SummaryMetrics` variant `filters`, `Panel`, `PageToolbar`, `SearchField`, `Chip`, `Skeleton`, `EmptyState`, responsive table | Removidas classes `fca-list-page`/`fca-summary-metrics` sem owner. Sem carrossel obrigatório e sem cards inteiros tingidos por status. | **CONFORME** |
| FCA — Detalhe | PageHeader → DetailHero → DetailMetrics → panels | `DetailHero`, `DetailMetrics`, `Panel`, `Chip`, `StatusBadge`, `EmptyState`, `Skeleton`; `fca-workspace.css` | Removido hero paralelo e alias `fca-detail-shared-hero`; ausência de ações/auditoria usa EmptyState oficial. Timeline continua especializada por domínio. | **CONFORME** |
| FCA — Novo | PageHeader → Stepper → ContextNotice opcional → formulário | `FcaFormStepper`, `ContextNotice`, notices, botões; `fca-workspace.css` | Removidos `form-panel`, `section-title-row` e `substitute-context`; formulário tem owner único. Stepper é especialização funcional compartilhada com edição. | **CONFORME** |
| FCA — Editar | PageHeader → Stepper → ContextNotice opcional → formulário | mesmos primitives de Novo FCA | Markup e feedback alinhados ao fluxo de criação; loading/error usam Panel + Skeleton/EmptyState. | **CONFORME** |
| Administração — Acessos | PageHeader → Summary → Toolbar → confirmação → Panel/tabela | `SummaryMetrics`, `PageToolbar`, `Panel`, `Chip`, `Badge`, `EmptyState`, `Skeleton`; `admin-workspace.css` | Confirmação é região contextual, não falso modal. Feedback success usa classe oficial. Tabela mobile usa record cards compartilhados. | **CONFORME** |
| Administração — Substituições | PageHeader → Summary → ContextNotice → workspace | `SummaryMetrics`, `ContextNotice`, `Panel`, `Chip`, `Badge`, `EmptyState`; `admin-workspace.css` | Removidos `admin-guidance`, `substitution-admin-first` e estado CSS `coverage-card.is-active` sem consumidor. Formulários permanecem especialização legítima. | **CONFORME** |
| Administração — Fotos de supervisores | PageHeader → Summary → Toolbar → ContextNotice → SectionHeader → cards | `SummaryMetrics`, `PageToolbar`, `ContextNotice`, `SectionHeader`, `Badge`, `Chip`, `EmptyState`; `admin-supervisors.css` | Grid de mídia permanece especializado. Sem rails. Gestão de foto não interfere em cadastro HUB. | **CONFORME** |

## 5. Resíduos removidos nesta auditoria

Famílias eliminadas por não representarem mais comportamento real:

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
- CSS duplicado de chart em `sections-feedback.css`.

## 6. `!important` — classificação final

### Removidos

Não se aceita mais `!important` para:

- utilities de status (`text-ok`, `text-warn`, `text-crit`, `text-neutral`);
- SearchField;
- grids de KPI;
- DetailHero/DetailMetrics;
- record cards/tabelas mobile;
- shell e breakpoints;
- disabled state comum.

Esses casos foram substituídos por ownership e ordem de cascata corretos.

### Exceções deliberadas

1. `prefers-reduced-motion` em `accessibility-interactions.css`.
   - Precisa vencer qualquer animação/transição declarada por um owner.
   - É requisito de preferência do usuário, portanto a alta precedência é intencional.

2. `font-family:'Material Symbols Rounded'!important` no hardening inline de `index.html`.
   - Mantido deliberadamente por histórico de regressão em que ligatures passaram a aparecer como texto bruto (`space_dashboard`, `search`, etc.).
   - É infraestrutura de iconografia, não styling de página.
   - Não remover junto de cleanup visual; qualquer alteração exige teste isolado de carregamento de fontes/ícones.

## 7. Charts

`SimpleLineChart.css` é a única fonte de verdade para:

- plot;
- eixo/grid;
- pontos;
- legenda;
- tooltip;
- mobile;
- reduced motion local.

No mobile a legenda usa grade e **não** scroll horizontal obrigatório.

## 8. Feedback states

Regra final:

- carregamento de bloco → `Skeleton`;
- ausência fora de tabela → `EmptyState`;
- ausência em célula de tabela → `table-empty`;
- sucesso/erro compacto → `.notice notice-success|notice-error`;
- orientação contextual → `ContextNotice`;
- alerta operacional global → `analytics-warning`.

Não criar novos `empty-*`, `guidance-*` ou `context-*` locais sem justificar nova função.

## 9. Critério de concluído

Uma tela está conforme quando:

- a mesma função usa o mesmo primitive;
- o owner CSS é identificável;
- não há classe fantasma para uma geração visual anterior;
- não existe folha posterior apenas para corrigir outra folha;
- semantic color não vira decoração da superfície;
- mobile preserva todas as informações essenciais sem swipe lateral;
- loading/empty/error/success são previsíveis;
- diferença visual corresponde a diferença funcional real.

## 10. Regra para futuras mudanças

Antes de criar CSS novo:

1. procurar primitive equivalente;
2. procurar owner da função;
3. verificar a mesma função em pelo menos duas outras telas;
4. preferir composição a override;
5. não usar `!important` para resolver conflito interno de cascata;
6. se um padrão surgir em 3+ superfícies, promover a primitive;
7. validar desktop, tablet, mobile e mobile estreito no Preview Cloudflare do HEAD exato.

O objetivo não é tornar todas as abas idênticas. É garantir que **diferenças visuais expressem diferenças de função, e não diferenças de implementação histórica**.
