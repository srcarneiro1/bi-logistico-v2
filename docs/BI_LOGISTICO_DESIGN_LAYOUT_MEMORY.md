# BI Logístico V2 — Memória de Design e Layout

> Documento persistente de decisões visuais, arquitetura de UI, referências externas estudadas e critérios de aceite. Complementa `docs/BI_LOGISTICO_UI_UX_SKILL.md` e `docs/UI_UX_CONSISTENCY_AUDIT.md`.

## 1. Ordem de leitura ao retomar o projeto

1. `PROJECT_STATE.md`;
2. `docs/BI_LOGISTICO_UI_UX_SKILL.md`;
3. este arquivo;
4. `docs/UI_UX_CONSISTENCY_AUDIT.md` — estado corrente aba por aba;
5. `main`, PRs abertos e Preview Cloudflare;
6. arquivos reais da tela que será alterada.

Quando houver divergência entre um backlog histórico e `UI_UX_CONSISTENCY_AUDIT.md`, prevalece a auditoria mais recente.

---

## 2. Estado consolidado em 2026-08-27

Os problemas que originaram o ciclo de redesign foram tratados:

- FCA deixou de usar cards/status com linguagem visual paralela;
- `SummaryMetrics` possui variante de filtro neutra para FCA;
- `DetailMetrics` não possui mais faixa colorida superior;
- Depositantes deixou de manter tabela mobile própria;
- FCA deixou de manter tabela mobile própria e `fca-mobile.css` foi removido;
- Home, KPIs, Supervisores, Depositantes, Financeiro, FCA e Administração usam primitives compartilhados;
- `dashboard-panel`, `panel-chip` manual e outros aliases históricos foram removidos;
- `Chip` virou primitive oficial para contexto/contagem;
- `ContextNotice` virou primitive oficial para orientação contextual;
- `EmptyState`/`Skeleton` são os padrões de ausência/carregamento fora de tabelas;
- `SimpleLineChart.css` é o único owner de charts;
- `record-lists.css` é o único owner da transformação tabela → record card mobile;
- semantic color permanece localizada em badge, ícone, valor ou progressão;
- rails/faixas coloridas decorativas não fazem parte da linguagem atual;
- a cascata foi organizada para não depender de `!important` para resolver conflitos internos.

A matriz detalhada das 12 superfícies navegáveis está em `docs/UI_UX_CONSISTENCY_AUDIT.md`.

---

## 3. Direção visual do produto

O BI deve parecer um único produto administrativo/analítico da Unilog, com leitura rápida, densidade controlada e pouca ornamentação.

### Linguagem visual

- superfícies predominantemente neutras;
- branco/cinza para estrutura;
- vermelho Unilog como marca e CTA, não como decoração repetida;
- cores semânticas localizadas;
- hierarquia construída primeiro com tipografia, espaçamento e agrupamento;
- bordas discretas e sombras leves;
- cards compactos, com função clara;
- ações primárias fáceis de localizar e secundárias subordinadas;
- desktop, tablet e mobile tratados como o mesmo produto.

### Rails e bordas semânticas

Evitar rails/faixas/bordas coloridas decorativas em topo/lateral de cards. Quando o estado precisa ser comunicado, preferir nesta ordem:

1. badge textual;
2. ícone/indicador semântico pequeno;
3. cor do valor;
4. borda inteira discretamente semântica apenas quando toda a superfície representa alta prioridade;
5. fundo semântico suave somente quando a condição governa toda a superfície.

Não combinar rail + fundo + badge + texto colorido para repetir a mesma informação.

---

## 4. Gramática oficial de páginas

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

- `PageHeader`;
- `Panel` / `PanelHeader`;
- `SectionHeader`;
- `PageToolbar`;
- `SearchField`;
- `SummaryMetrics`;
- `DetailHero` / `DetailMetrics`;
- `MetricCard`;
- `Badge` / `StatusBadge` / `MetricStatusBadge`;
- `Chip`;
- `ContextNotice`;
- `EmptyState`;
- `Skeleton`.

Semântica:

- `Badge` = status/estado;
- `Chip` = contexto, contagem, período ou escopo;
- `ContextNotice` = orientação contextual não crítica;
- `EmptyState` = ausência fora de tabela;
- `table-empty` = somente tabela;
- `Skeleton` = loading de bloco/conteúdo.

---

## 5. Cards e summaries

### Summary/status

- mesma anatomia entre páginas;
- superfície neutra por padrão;
- iconografia discreta;
- valor com maior peso que label;
- detalhe menor;
- semantic tone não colore o card inteiro;
- filtros de status devem parecer controles de exploração, não cinco alertas concorrentes;
- seleção usa superfície/borda neutra e foco independente.

### Entity cards

- identidade primeiro;
- um status principal;
- métricas de apoio;
- metadados no fim;
- sem faixa superior colorida;
- sem múltiplos rails;
- affordance previsível.

### MetricCard

Home/KPIs podem usar `MetricCard` porque a função é analítica e diferente de um summary/filter. Isso é uma exceção funcional legítima, não linguagem paralela.

---

## 6. Botões, seleção e cor

### Botões

- um CTA principal por contexto quando possível;
- secundários neutros;
- perigo reservado a ação destrutiva;
- ícone não substitui label quando a ação não for óbvia;
- altura/radius consistentes;
- card não deve parecer botão sem necessidade e botão não deve parecer card.

### Seleção

Preferência:

1. mudança suave de superfície;
2. borda um pouco mais forte;
3. `aria-pressed`/`aria-selected` quando aplicável;
4. foco visível independente da seleção.

Evitar rail vermelho como linguagem de seleção.

### Cor semântica

Pergunta de decisão: “o usuário precisa perceber este estado antes de ler o texto?”.

- se não: neutro;
- se sim: cor em área pequena;
- fundo inteiro somente quando toda a superfície é semântica;
- vermelho de marca e vermelho de criticidade não devem se confundir conceitualmente.

---

## 7. Responsividade

Regra absoluta: nenhuma informação essencial pode depender de drag horizontal.

- tabelas viram record cards no mobile;
- summary strips não viram carrossel obrigatório;
- stepper FCA permanece integralmente visível e reorganiza em telas muito estreitas;
- legendas de chart usam grid no mobile, não swipe horizontal;
- toolbar empilha controles;
- ações principais ocupam largura total quando necessário;
- touch targets recorrentes ficam em torno de 40–44 px.

---

## 8. Ownership e cascata CSS

Ordem oficial:

1. `styles.css` — reset + autenticação;
2. `design-system.css` — tokens, base global, controles e botões;
3. `planner-shell.css` — shell, topbar, filtros e PageHeader;
4. foundations/primitives;
5. owners de página/domínio;
6. `ui-utilities.css` — utilities semânticas;
7. `accessibility-interactions.css` — estados finais de interação/acessibilidade.

Owners:

- foundation UI → `ui-foundations.css`;
- detail → `detail-primitives.css`;
- tabelas/record cards → `record-lists.css`;
- chart → `components/SimpleLineChart.css`;
- Home → `home-dashboard.css`;
- KPIs → `kpis-dashboard.css`;
- Supervisores → `supervisors-discovery.css`;
- Depositantes → `depositors-discovery.css`;
- Financeiro → `finance-dashboard.css`;
- FCA → `fca-workspace.css`;
- Administração/Substituições → `admin-workspace.css`;
- fotos → `admin-supervisors.css`;
- feedback/notices → `sections-feedback.css`;
- utilities → `ui-utilities.css`;
- acessibilidade → `accessibility-interactions.css`.

Não criar folha “transversal” para corrigir outras folhas. Se uma regra não tem owner claro, isso é sinal de arquitetura incompleta.

---

## 9. `!important`

Não usar `!important` para resolver conflito interno de componentes, páginas, mobile ou utilities.

Exceções deliberadas:

1. `prefers-reduced-motion` em `accessibility-interactions.css`, para garantir que a preferência do usuário vença qualquer owner;
2. hardening de `Material Symbols Rounded` no `index.html`, mantido por histórico de regressão global dos ícones.

A exceção de Material Symbols é infraestrutura visual. Não removê-la em cleanup de página sem teste isolado de fonte/ligatures.

---

## 10. Feedback

Padrão final:

- loading de bloco → `Skeleton`;
- ausência fora de tabela → `EmptyState`;
- ausência em tabela → `table-empty`;
- sucesso/erro compacto → `.notice notice-success|notice-error`;
- orientação contextual → `ContextNotice`;
- alerta operacional global → `analytics-warning`.

Não criar novos `empty-*`, `guidance-*` ou `context-*` locais se a função já estiver coberta.

---

## 11. Pesquisa externa e benchmarks

Pesquisa realizada em 2026-08-26/27 com as referências fornecidas pelo usuário e complementares.

### Tailwind CSS v4

- https://github.com/tailwindlabs/tailwindcss
- https://tailwindcss.com/
- https://tailwindcss.com/docs/hover-focus-and-other-states
- https://tailwindcss.com/blog/tailwindcss-v4

Aprendizados absorvidos:

- tokens como CSS variables;
- estados explícitos;
- responsividade como composição;
- restrições consistentes reduzem divergência.

**Decisão:** não instalar Tailwind apenas para corrigir UI. Uma adoção real exige POC + ADR em branch isolada.

### GitHub Topics / templates Tailwind

- https://github.com/topics/tailwind-css
- https://github.com/topics/tailwind-css-template?l=typescript&o=desc&s=
- https://github.com/topics/tailwindcss-template?o=asc&s=forks

Uso: descoberta de referências, não fonte de verdade. Estrelas/forks não garantem UX, a11y ou adequação.

### React

- https://github.com/react/react
- https://react.dev/

Princípios absorvidos:

- composição;
- fonte única de verdade para estado;
- evitar estado duplicado;
- UI derivada do estado.

### React Native website

- https://github.com/react/react-native-website

Referência editorial/mobile, não fonte técnica de componentes DOM.

### shadcn/ui

- https://ui.shadcn.com/
- https://ui.shadcn.com/docs/components
- https://ui.shadcn.com/docs/tailwind-v4

Benchmark forte de anatomia, tokens e composição. Não instalar CLI/Tailwind sem ADR.

### Flowbite React

- https://flowbite-react.com/

Benchmark de completude de componentes, administração e formulários. Não instalar nesta fase.

### Preline

Benchmark já consolidado para densidade/composição de dashboards/admin. Não copiar assets nem introduzir Tailwind apenas por referência visual.

### Tremor

- https://github.com/tremorlabs/tremor

Benchmark prioritário para KPI cards, charts e superfícies analíticas. Não instalar agora.

### TailAdmin

- https://github.com/TailAdmin/free-react-tailwind-admin-dashboard
- https://tailadmin.com/react

Benchmark de páginas administrativas completas; não substituir shell atual.

### Mosaic Lite / Cruip

- https://github.com/cruip/tailwind-dashboard-template

Benchmark secundário para grid/widgets/dashboard.

### Radix Primitives

- https://www.radix-ui.com/primitives
- https://github.com/radix-ui/primitives

Candidato incremental para Dialog, Popover, Menu, Tabs, Tooltip e Select complexos sem impor styling.

### React Aria

- https://react-spectrum.adobe.com/react-aria/

Candidato forte para componentes comportamentais complexos e acessíveis, mantendo vanilla CSS.

### Headless UI

- https://headlessui.com/

Benchmark/comparativo. Radix/React Aria têm encaixe incremental melhor no stack atual.

### TanStack Table

- https://tanstack.com/table/

Somente considerar quando tabelas exigirem ordenação/paginação/visibility/grouping/virtualização de data-grid real.

---

## 12. Matriz de adoção tecnológica

| Tecnologia | Referência | Adotar agora | Motivo |
|---|---:|---:|---|
| Tailwind CSS v4 | Sim | Não | Criaria segunda estratégia de styling |
| shadcn/ui | Sim | Não | Excelente anatomia, pressupõe Tailwind |
| Flowbite React | Sim | Não | Boa completude, adiciona ecossistema próprio |
| Preline | Sim | Não | Benchmark consolidado |
| Tremor | Sim | Não | Excelente para dashboard, depende de Tailwind/Radix |
| TailAdmin | Sim | Não | Benchmark de página/template |
| Mosaic Lite | Sim | Não | Benchmark secundário |
| Radix | Sim | Talvez, incremental | Comportamento acessível sem impor estilo |
| React Aria | Sim | Talvez, incremental | Forte em a11y/interação, aceita vanilla CSS |
| Headless UI | Sim | Não por enquanto | Menor vantagem frente a Radix/React Aria |
| TanStack Table | Sim | Somente se necessário | Justifica-se para data-grid complexo |

---

## 13. Processo obrigatório para mudanças visuais

1. Identificar o componente real no código.
2. Comparar com a mesma função em pelo menos duas telas.
3. Decidir se o problema é local ou sistêmico.
4. Corrigir primitive quando a função for compartilhada.
5. Usar owner local apenas para diferença funcional real.
6. Verificar desktop, tablet, mobile e mobile estreito.
7. Verificar hover, focus-visible, active, disabled, loading, empty e error.
8. Verificar overflow horizontal.
9. Revisar contraste e touch target.
10. Validar Preview Cloudflare no HEAD exato.
11. Somente mergear após autorização explícita do usuário.

Não misturar redesign amplo e cleanup especulativo. Remover CSS somente com evidência de substituição/uso zero.

---

## 14. Critério de qualidade

Uma tela não está boa apenas porque parece moderna. Precisa atender simultaneamente:

- consistência com o BI;
- leitura rápida;
- hierarquia correta;
- baixo ruído visual;
- semântica clara;
- responsividade real;
- acessibilidade de interação;
- código sustentável;
- owner claro;
- ausência de linguagem paralela;
- nenhuma mudança funcional acidental.

Quando houver conflito entre um template externo e a gramática do BI, vence a gramática do BI.
