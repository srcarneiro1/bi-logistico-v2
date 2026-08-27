# BI Logístico V2 — Memória de Design e Layout

> Documento persistente de decisões visuais, achados de auditoria e critérios de aceite. Complementa `docs/BI_LOGISTICO_UI_UX_SKILL.md`; não substitui regras funcionais, segurança ou a skill visual principal.

## 1. Objetivo

Evitar regressões visuais e impedir que cada página crie uma linguagem própria. Esta memória registra:

- decisões de arquitetura visual já aceitas;
- problemas percebidos pelo usuário;
- anti-patterns encontrados no código;
- referências externas estudadas;
- o que pode ser absorvido sem trocar o stack;
- critérios para decidir quando uma biblioteca externa realmente justifica adoção;
- backlog visual ativo e ordem de correção.

O GitHub é a fonte persistente. Ao retomar trabalho visual em outro chat, ler, nesta ordem:

1. `PROJECT_STATE.md`;
2. `docs/BI_LOGISTICO_UI_UX_SKILL.md`;
3. este arquivo;
4. a `main` e os PRs abertos;
5. os arquivos reais da tela que será alterada.

---

## 2. Direção visual do produto

O BI deve parecer um único produto administrativo/analítico da Unilog, com leitura rápida, densidade controlada e pouca ornamentação.

### Linguagem desejada

- superfícies predominantemente neutras;
- branco/cinza para estrutura;
- vermelho Unilog como marca e CTA, não como decoração repetida;
- cores semânticas localizadas em status, ícone, valor ou pequeno indicador;
- hierarquia construída com tipografia, espaçamento e agrupamento antes de bordas coloridas;
- bordas discretas e sombras leves;
- cards compactos, com função clara e sem excesso de sinais simultâneos;
- ações primárias fáceis de encontrar, ações secundárias visualmente subordinadas;
- desktop, tablet e mobile pensados em conjunto.

### Regra adicional de 2026-08-26

Evitar **rails/faixas/bordas coloridas decorativas em topo de cards**. Elas fragmentam a página e criam uma aparência de template. Quando o estado precisa ser comunicado, preferir:

1. badge textual;
2. ícone/indicador semântico pequeno;
3. cor do valor quando realmente útil;
4. borda inteira discretamente semântica apenas em casos de alta prioridade;
5. fundo semântico muito suave somente quando o card inteiro representa uma condição de atenção/erro.

Nunca combinar, sem necessidade, rail + fundo colorido + badge + texto colorido para dizer a mesma coisa.

---

## 3. Achados atuais no código

### 3.1 FCA — inconsistência visual prioritária

A listagem FCA usa `SummaryMetrics`, mas os itens de status recebem `tone` semântico. O primitive atual pinta borda e fundo de alguns cards (`danger`, `warning`, `success`) e o item ativo recebe um rail inferior vermelho. Isso cria mais ruído que as demais páginas e faz os cards parecerem botões grandes de um template diferente.

A `fca-workspace-card` também possui uma gramática própria de radius/sombra/espaçamento em `src/fca-workspace.css`, embora o restante do produto já tenha `Panel`, `PageToolbar`, `SummaryMetrics`, `responsive-data-table` e outros primitives compartilhados.

Além disso, `src/fca-workspace.css` ainda contém CSS legado de `.fca-status-summary`, inclusive comportamento mobile horizontal, embora a tela atual já use `SummaryMetrics`. Esse CSS é dívida técnica e pode confundir futuras manutenções.

**Direção para o redesign:**

- summary FCA com mesma anatomia dos summaries das outras páginas;
- superfície neutra por padrão;
- sem rail vermelho de seleção;
- estado semântico concentrado em ícone/label/contagem, e não no card inteiro;
- seleção comunicada por fundo neutro leve + borda/foco consistente;
- reduzir sensação de “cinco CTAs concorrentes”;
- workspace deve se aproximar do mesmo `Panel/Header/Toolbar/List` usado no restante do BI;
- no mobile, nenhuma faixa de status deve exigir swipe horizontal.

### 3.2 Depositantes — linha colorida no topo de métricas

`src/detail-primitives.css` implementa `.ui-detail-metric:before` como uma faixa de 2px no topo, colorida em success/warning/danger. O usuário identificou visualmente essa linha como feia nos cards de Depositantes.

Esse é um primitive compartilhado, portanto qualquer mudança deve considerar Supervisor 360 e outras telas que usam `DetailMetrics`.

**Direção:** remover a faixa superior e manter semântica por valor, badge/dot discreto ou outro indicador de menor peso visual. A superfície do card deve permanecer neutra.

### 3.3 Depositantes — CSS legado e excesso de override mobile

`src/depositors-discovery.css` ainda contém famílias antigas como `.depositors-summary` e uma implementação mobile extremamente específica para a tabela, com muitos `!important`. Parte disso antecede `SummaryMetrics` e `record-lists.css`.

Não fazer limpeza ampla junto do redesign. Primeiro estabilizar visualmente FCA/Depositantes; depois remover somente regras comprovadamente substituídas.

---

## 4. Pesquisa externa — o que foi estudado

Pesquisa realizada em 2026-08-26/27 a partir das fontes fornecidas pelo usuário e referências complementares.

### Tailwind CSS v4

Referências:

- https://github.com/tailwindlabs/tailwindcss
- https://tailwindcss.com/
- https://tailwindcss.com/docs/hover-focus-and-other-states
- https://tailwindcss.com/blog/tailwindcss-v4

Aprendizados úteis para o BI:

- design tokens tratados como CSS variables;
- estados (`hover`, `focus-visible`, `disabled`, `selected`) considerados parte explícita do componente;
- responsividade e container queries tratadas como composição, não como remendo final;
- utilitários favorecem consistência quando existe um sistema de tokens bem definido.

**Decisão:** não instalar Tailwind no BI apenas para corrigir UI. O projeto já possui CSS semântico, tokens e primitives próprios. Introduzir Tailwind agora criaria duas estratégias concorrentes de styling. Uma adoção real exige POC + ADR em branch isolada.

### GitHub Topics / templates Tailwind

Referências fornecidas:

- https://github.com/topics/tailwind-css
- https://github.com/topics/tailwind-css-template?l=typescript&o=desc&s=
- https://github.com/topics/tailwindcss-template?o=asc&s=forks

Uso correto: **descoberta de referências**, não fonte de verdade. Popularidade, estrelas ou forks não garantem qualidade de UX, acessibilidade, manutenção ou adequação ao BI.

### React

Referências:

- https://github.com/react/react
- https://react.dev/

Princípios relevantes:

- componentes funcionais e composição;
- uma fonte de verdade para cada estado;
- evitar estados duplicados entre componentes equivalentes;
- UI derivada de estado, não de manipulação imperativa do DOM.

Aplicação no BI: filtros, seleção de entidade, status ativo e navegação contextual devem continuar com ownership explícito e primitives controlados.

### React Native website

Referência fornecida:

- https://github.com/react/react-native-website

É útil como referência editorial e de princípios de experiência mobile, mas **não é fonte técnica para componentes web do BI**. React Native tem runtime, layout e interação diferentes do DOM.

### shadcn/ui

Referências:

- https://ui.shadcn.com/
- https://ui.shadcn.com/docs/components
- https://ui.shadcn.com/docs/tailwind-v4

Pontos úteis:

- componentes são incorporados ao código do projeto, não tratados como caixa-preta;
- forte uso de tokens semânticos e CSS variables;
- anatomia consistente para Card, Table, Tabs, Dialog, Drawer/Sheet, Empty, Skeleton, Sidebar etc.;
- bom benchmark de densidade, composição e estados.

**Decisão:** usar como benchmark visual/arquitetural. Não adicionar o CLI/Tailwind ao BI sem ADR.

### Flowbite React

Referência:

- https://flowbite-react.com/

Possui componentes React/Tailwind para alerts, cards, tables, sidebar, modal, tabs, forms, file input, tooltips e outros. É bom benchmark de completude e comportamento, especialmente para administração e formulários.

**Decisão:** benchmark. Não instalar nesta fase.

### Preline

Benchmark já adotado pelo projeto para dashboards/admin. Continuar usando como referência de densidade e composição, mas sem reproduzir literalmente assets/estilos ou instalar Tailwind apenas para isso.

### Tremor

Referência:

- https://github.com/tremorlabs/tremor

Tremor trabalha com componentes React voltados a dashboards, Tailwind e Radix. É especialmente útil como benchmark para KPI cards, chart panels, filtros analíticos e composição de dashboards.

**Decisão:** benchmark prioritário para superfícies analíticas; não instalar agora.

### TailAdmin

Referências:

- https://github.com/TailAdmin/free-react-tailwind-admin-dashboard
- https://tailadmin.com/react

Stack atual do template: React, TypeScript, Vite e Tailwind v4. É uma boa fonte para observar shell, card density, sidebars, tables e páginas administrativas completas.

**Decisão:** benchmark de páginas completas; não copiar o template nem substituir o shell atual.

### Mosaic Lite / Cruip

Referência:

- https://github.com/cruip/tailwind-dashboard-template

Dashboard React + Tailwind responsivo, útil para observar grid, charts, widgets e ritmo de layout.

**Decisão:** benchmark secundário.

### Radix Primitives

Referências:

- https://www.radix-ui.com/primitives
- https://github.com/radix-ui/primitives

Primitives React sem estilo, com foco em WAI-ARIA, teclado, foco e composição.

**Decisão arquitetural importante:** se o BI precisar de Dialog, Popover, Menu, Tabs, Tooltip ou Select com comportamento complexo e o código próprio começar a ficar frágil, **Radix é candidato mais coerente que uma migração para Tailwind**, porque pode ser adotado incrementalmente mantendo o CSS/design system atual.

### React Aria Components

Referência:

- https://react-spectrum.adobe.com/react-aria/

Componentes/hooks React sem estilo, com acessibilidade, interação, internacionalização e suporte a múltiplos dispositivos. Aceita vanilla CSS ou Tailwind.

**Decisão:** candidato forte, junto com Radix, para componentes comportamentais complexos. Avaliar por componente; não substituir primitives simples que já funcionam.

### Headless UI

Referência:

- https://headlessui.com/

Componentes acessíveis sem estilo, mas com ecossistema fortemente associado a Tailwind.

**Decisão:** benchmark/comparativo. Radix/React Aria têm melhor encaixe incremental no stack atual.

### TanStack Table

Referência:

- https://tanstack.com/table/

Útil quando houver necessidade real de ordenação complexa, paginação, column visibility, grouping, virtualização ou comportamento avançado de data grid.

**Decisão:** não introduzir para tabelas simples atuais. Considerar somente quando a complexidade funcional justificar.

---

## 5. Matriz de adoção

| Tecnologia | Usar como referência | Adotar agora | Motivo |
|---|---:|---:|---|
| Tailwind CSS v4 | Sim | Não | Conceitos excelentes; migração criaria segunda estratégia de styling |
| shadcn/ui | Sim | Não | Excelente anatomia/tokens, mas pressupõe Tailwind |
| Flowbite React | Sim | Não | Boa biblioteca completa, mas adiciona Tailwind/ecossistema próprio |
| Preline | Sim | Não | Benchmark já consolidado |
| Tremor | Sim | Não | Excelente para dashboard; depende de Tailwind/Radix |
| TailAdmin | Sim | Não | Bom benchmark de página completa/template |
| Mosaic Lite | Sim | Não | Benchmark secundário de dashboard |
| Radix Primitives | Sim | Talvez, incremental | Excelente para comportamento acessível sem impor estilo |
| React Aria | Sim | Talvez, incremental | Muito forte em acessibilidade/interações e aceita vanilla CSS |
| Headless UI | Sim | Não por enquanto | Boa qualidade, mas menor vantagem frente a Radix/React Aria no stack atual |
| TanStack Table | Sim | Somente se necessário | Justifica-se quando tabela virar data-grid de verdade |

---

## 6. Regras visuais V2

### Cards de summary/status

- mesma anatomia entre páginas;
- background neutro por padrão;
- iconografia discreta;
- valor com maior peso que label;
- detalhe menor e secundário;
- estado ativo não deve usar rail grosso/colorido;
- semantic tone não deve transformar todos os cards em blocos coloridos;
- um conjunto de 4–5 filtros de status deve parecer **controle de exploração**, não um painel de alertas concorrentes.

### Entity cards

- identidade primeiro;
- um status principal;
- métricas de apoio;
- metadados no fim;
- sem borda superior colorida;
- sem múltiplos rails;
- affordance de clique discreta e previsível.

### Botões

- um CTA principal por contexto quando possível;
- botões secundários neutros;
- perigo só para ações destrutivas;
- ícone não substitui label quando a ação não for óbvia;
- alturas e radius consistentes;
- evitar botões com aparência de card e cards com aparência de botão quando a função é filtro simples.

### Seleção

Preferência:

1. mudança suave de superfície;
2. borda um pouco mais forte;
3. `aria-pressed`/`aria-selected` quando aplicável;
4. foco visível independente da seleção.

Evitar rails vermelhos como principal linguagem de seleção em cards.

### Cor semântica

Cor deve responder à pergunta: “o usuário precisa perceber esse estado antes de ler o texto?”.

- se não, manter neutro;
- se sim, usar cor em uma área pequena;
- fundo inteiro colorido somente quando a condição governa toda a superfície;
- vermelho Unilog de marca e vermelho de criticidade devem permanecer conceitualmente separados.

---

## 7. Processo obrigatório para mudanças visuais

1. Receber screenshot/feedback e identificar o componente real no código.
2. Comparar com primitive equivalente em pelo menos duas outras telas.
3. Identificar se o problema é local ou sistêmico.
4. Corrigir o primitive quando a função for realmente compartilhada; usar override local apenas quando a função for diferente.
5. Validar desktop, tablet, mobile e mobile estreito.
6. Validar hover, focus-visible, active, disabled, loading, empty e error quando aplicáveis.
7. Verificar overflow horizontal.
8. Revisar contraste e touch target.
9. Cloudflare Preview no HEAD exato.
10. Somente mergear após autorização explícita do usuário.

Não fazer “cleanup de CSS” simultaneamente a redesign visual amplo. Primeiro estabilizar comportamento e aparência; depois remover regras mortas com evidência.

---

## 8. Backlog visual ativo

### P0 visual

1. FCA listagem — summaries/status filters e workspace fora do padrão percebido pelo usuário.
2. Depositantes — remover/reformular faixa colorida superior dos `DetailMetrics` sem gerar regressão no Supervisor 360.

### P1

3. Revisar consistência de buttons/actions do FCA detalhe e formulários após receber screenshots.
4. Verificar se `fca-workspace.css` ainda tem overrides que competem com `record-lists.css`, `sections-feedback.css` ou `ui-foundations.css`.
5. Revisar densidade e seleção de cards/tabelas mobile após os ajustes visuais.

### P2

6. Remover CSS morto comprovado (`.fca-status-summary`, `.depositors-summary` etc.) em PRs específicos e pequenos.
7. Avaliar Radix ou React Aria apenas quando houver primitive comportamental complexo que justifique dependência.

---

## 9. Critério de qualidade

Uma tela não está boa apenas porque “está moderna”. Deve atender simultaneamente:

- consistência com o restante do BI;
- leitura rápida;
- hierarquia correta;
- baixo ruído visual;
- semântica clara;
- responsividade real;
- acessibilidade de interação;
- código sustentável;
- ausência de nova linguagem paralela;
- nenhuma mudança funcional acidental.

Quando houver conflito entre um template externo e a gramática do BI, vence a gramática do BI.
