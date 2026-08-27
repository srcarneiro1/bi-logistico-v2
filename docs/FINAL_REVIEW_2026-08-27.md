# BI Logístico V2 — Revisão Final 2026-08-27

## Baseline consolidado

O PR #52 (`Fecha auditoria final de consistência visual`) foi validado no Cloudflare no HEAD exato `c61b392e521f7ffb6fcf68ae0e45e184b5897d9e` e mergeado via squash.

Baseline de `main` após o merge:

`74a06e496ffd31821eb5e1e7cce2785d6e025d83`

O merge consolida a matriz de 12 superfícies, owners CSS, primitives, feedback states, remoção de aliases mortos, owner único de charts, utilities semânticas e política de `!important`.

## Feedback visual posterior ao #52

### Supervisores → Performance por depositante

Foi observado em uso real que os nomes dos depositantes dentro da tabela do Supervisor 360 apareciam como botões retangulares grosseiros.

Causa raiz:

- `SupervisorsPage.tsx` usa um `<button class="table-link">` para abrir o depositante;
- `record-lists.css` definia cor/display do `.table-link`, mas não neutralizava a aparência nativa de `<button>`;
- por isso o navegador podia renderizar border/background/padding nativos, gerando uma linguagem visual diferente da mesma tabela quando o elemento era um `<a>`.

Correção:

- `record-lists.css` é o owner correto;
- `.table-link` agora normaliza `appearance`, `border`, `background`, `padding`, `font`, `text-align` e `cursor`;
- não foi criado override específico para Supervisores;
- links e botões com função equivalente passam a compartilhar a mesma affordance visual.

Regra permanente: um primitive que aceita semanticamente `<a>` ou `<button>` deve normalizar explicitamente a aparência dos dois elementos. Não depender de user-agent styles.

### Aliases sem owner na aba Supervisores

A revisão posterior ao feedback visual encontrou classes mantidas no JSX sem regra CSS, função de acessibilidade ou responsabilidade funcional:

- `supervisors-discovery`;
- `supervisor-360-expanded`;
- `supervisor-portfolio`;
- `status-table` na tabela do Supervisor 360, onde o seletor não possuía owner aplicável.

Esses aliases foram removidos. A tela passa a depender apenas de `portfolio-discovery`, `supervisor-360`, `supervisor-360-grid`, `Panel` e `responsive-data-table`, que possuem owners reais.

## Mobile / iOS

### Zoom automático ao focar campos

Foi reportado zoom indesejado no iPhone ao tocar em inputs/selects.

Causa raiz:

- iOS/WebKit amplia a viewport quando um campo focado usa fonte inferior a 16px;
- o BI possui controles compactos com 9–12px por razões de densidade desktop;
- tentar resolver com `user-scalable=no` ou `maximum-scale=1` seria incorreto porque prejudica acessibilidade e zoom voluntário.

Correção:

- `accessibility-interactions.css` continua sendo a camada final de interação;
- em WebKit touch/mobile (`@supports (-webkit-touch-callout:none)` + `max-width:760px`), `input`, `select` e `textarea` recebem `font-size:16px`;
- o seletor usa `#root` para vencer owners locais pela cascata normal, sem `!important`;
- inputs/selects mobile também recebem touch target mínimo efetivo de 44px com precedência suficiente para vencer regras locais compactas;
- desktop não é alterado.

### Filtros globais mobile

Foi identificado um conflito estrutural adicional no shell:

- `planner-shell.css` reservava 32–34px para selects/reset no mobile;
- a camada de acessibilidade exigia 44px;
- o botão de reset podia ultrapassar a coluna fixa de 32/34px e os selects tinham owner local abaixo do touch target oficial.

Correção no owner:

- coluna do reset passa a 44px nos breakpoints mobile;
- selects do toolbar passam a nascer com 44px de altura;
- reset passa a 44x44px;
- a camada de acessibilidade deixa de compensar um layout estruturalmente menor.

### Outros touch targets revisados

- legenda interativa do `SimpleLineChart`: 44px no mobile, mantendo grid sem swipe obrigatório;
- `icon-button` da gestão de coberturas: 44x44px no mobile;
- chips editáveis de substitutos: mínimo de 44px no mobile;
- links/ações de tabelas: continuam em 42–44px conforme função;
- summaries e CTAs principais já atendiam ao padrão.

Regra permanente mobile:

1. conteúdo essencial não depende de swipe horizontal;
2. touch target recorrente deve ficar em ~44px;
3. campos focáveis no iOS devem ter fonte efetiva >=16px;
4. nunca desabilitar pinch zoom para esconder o problema;
5. correções mobile devem ocorrer no owner/foundation correto, não em patches por página;
6. se a camada de acessibilidade precisa vencer uma geometria fixa do owner, revisar o owner antes de aumentar especificidade.

## Scanner final de dívida visual

Revisão posterior ao #52:

- `fca-mobile.css`: ausente da árvore atual;
- `panel-chip`: ausente da árvore atual;
- `dashboard-panel`: removido do owner de Supervisores; `supervisors-discovery.css` usa apenas `.ui-panel` no grid 360;
- aliases de status do Supervisor sem efeito: removidos no #52;
- aliases adicionais sem owner na aba Supervisores: removidos nesta rodada;
- `SimpleLineChart.css`: permanece owner único de charts;
- `record-lists.css`: permanece owner único da transformação desktop table → mobile record card;
- `table-empty`: reservado para contexto de tabela; fora de tabela usar `EmptyState`;
- `!important`: permitido deliberadamente em `prefers-reduced-motion`; hardening de Material Symbols em `index.html` permanece como exceção de infraestrutura devido à regressão histórica de ligatures.

Não reintroduzir classes antigas para “corrigir” uma tela. Se uma mudança precisa competir com outro owner, primeiro identificar por que existem dois owners.

## MFA / autenticação em duas etapas

Implementação revisada em `App.tsx` e `components/MfaGate.tsx`.

Comportamento atual:

- MFA é obrigatório somente quando `governanceRole` é `OWNER` ou `ADMIN`;
- usuários comuns (`USER`) não passam pelo `MfaGate` obrigatório;
- ao abrir uma sessão de Owner/Admin, o gate consulta o nível AAL atual;
- se a sessão já está em `aal2`, o BI abre sem pedir outro código;
- se a sessão está em `aal1` e há TOTP verificado, o código atual do autenticador é exigido;
- se ainda não existe fator verificado, o cadastro TOTP é exigido;
- depois da validação, navegar entre abas não pede novo código;
- enquanto a mesma sessão continuar válida em `aal2`, um simples refresh não deve criar um novo desafio por página;
- em um novo login/nova sessão administrativa, a expectativa de segurança atual é voltar a elevar a sessão para `aal2`, portanto o código pode ser solicitado novamente.

Não existe hoje implementação de “lembrar este dispositivo” ou bypass confiável por dispositivo. Qualquer mudança nessa política deve ser tratada como decisão de segurança, em PR separado, e não como ajuste visual.

## Direção dos finalmentes

O projeto está em fase de estabilização, não de redesign.

Princípios para os próximos PRs:

- preservar a estrutura consolidada;
- regressão zero como prioridade;
- mudanças pequenas e rastreáveis;
- preview Cloudflare do HEAD exato antes de merge;
- atualizar memória Git sempre que uma regra permanente ou causa raiz nova for confirmada;
- diferenças entre telas só permanecem quando representam diferença funcional real;
- não usar CSS para mascarar duplicidade de ownership.
