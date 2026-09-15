# EXTRA COST CONTROL COMO REFERÊNCIA PARA O BI LOGÍSTICO V2

**Status:** decisão arquitetural e plano de migração do PR #69  
**Data:** 14/09/2026  
**Repositórios analisados:** `srcarneiro1/extra-cost-control-unilog` e `srcarneiro1/bi-logistico-v2`

## 1. Objetivo

Este documento registra o que efetivamente existe e funciona no Extra Cost Control, quais padrões devem ser reaproveitados no BI Logístico V2 e qual é o esforço/risko de cada frente de modernização.

O objetivo não é recriar o BI do zero e nem copiar o Extra Cost Control literalmente. O objetivo é fazer os dois produtos parecerem parte da mesma família Unilog, usando os mesmos princípios de interface e a mesma stack visual quando isso trouxer ganho real.

Regras permanentes:

- preservar regras de negócio, cálculos, APIs, autenticação, autorização, perfis, escopos, banco, integrações e histórico do BI;
- preservar Supabase, HUB, Apps Script, Pages Functions e contratos atuais;
- manter o PR #69 em Draft durante toda a modernização;
- não fazer merge parcial;
- o merge em `main` é o gate de release para produção no Cloudflare;
- nunca fazer merge sem autorização explícita;
- nunca declarar build/deploy aprovado sem validar o head exato.

## 2. Conclusão executiva

A arquitetura de apresentação do Extra Cost Control é uma boa referência para o BI:

- PrimeReact 10;
- PrimeIcons;
- Chart.js através de PrimeReact Chart;
- design system Unilog próprio;
- wrappers semânticos sobre PrimeReact;
- DataTable no desktop e record cards no mobile;
- Dialog compartilhado;
- shell grafite com faixa vermelha ativa;
- cards brancos de baixa sombra;
- badges semânticos discretos;
- charts compactos, responsivos e com tooltips completos;
- CSS legado removido gradualmente, não em massa.

A recomendação para o PR #69, entretanto, é **não migrar o BI de Vite/React Router para Next.js apenas para obter essa aparência**.

O Next.js não é a origem da qualidade visual do Extra Cost Control. A qualidade vem dos componentes, tokens, Chart.js, regras de layout, wrappers e auditoria visual.

No BI, manter Vite + React Router reduz substancialmente o risco e permite reutilizar praticamente toda a arquitetura de apresentação do Extra Cost.

## 3. O que o Extra Cost Control usa hoje

### 3.1 Frontend

- Next.js 15 com App Router;
- React 19;
- TypeScript;
- PrimeReact 10.9.9;
- PrimeIcons 7;
- Chart.js 4.x;
- PrimeReact Chart;
- CSS próprio Unilog carregado sobre o tema Lara;
- componentes client-side para toda a experiência operacional.

### 3.2 Modelo de renderização/deploy

O Extra Cost Control usa:

```text
Next.js
→ output: export
→ out/
→ cópia para dist/
→ Cloudflare Pages
```

Portanto, o Next é utilizado como framework de apresentação/build, mas a aplicação ativa é exportada estaticamente.

### 3.3 Backend

O backend não foi migrado para Route Handlers do Next.

A arquitetura continua:

```text
Browser
→ /api/*
→ Cloudflare Pages Functions
→ Google Apps Script
→ Google Sheets
```

As Pages Functions cuidam de sessão, autorização, escopo, cache e proteção do segredo de integração.

### 3.4 Autenticação

O Extra Cost usa sessão própria:

```text
login
→ Pages Function
→ Apps Script autentica
→ Function cria JWT
→ cookie HttpOnly / Secure / SameSite=Lax
```

Esse modelo **não deve ser copiado para o BI**, porque o BI já possui Supabase Auth + MFA + regras de governança próprias e validadas.

### 3.5 Estrutura da interface

O Extra Cost possui uma página App Router raiz e, dentro dela, troca as áreas por estado client-side:

- Visão geral;
- Solicitações;
- Fechamentos;
- Cadastros;
- Usuários.

As seções são carregadas dinamicamente e mantidas montadas conforme o usuário navega.

Isso é importante: o Extra Cost não depende de uma árvore complexa de URLs do App Router para representar os módulos.

## 4. Design system do Extra Cost Control

### 4.1 Tokens canônicos

```css
--unilog-red: #db0812;
--unilog-red-dark: #b8070f;
--unilog-red-soft: #fdecee;
--unilog-ink: #171b24;
--unilog-ink-2: #242a36;
--unilog-graphite: #494a56;
--unilog-graphite-2: #676d77;
--unilog-muted: #8a9099;
--unilog-border: #e2e5e9;
--unilog-border-soft: #edf0f2;
--unilog-canvas: #f5f6f8;
--unilog-surface: #ffffff;
--unilog-surface-soft: #f8f9fb;
--unilog-success: #3f7c59;
--unilog-warning: #a87900;
--unilog-danger: #c91a23;
--unilog-radius: 14px;
--unilog-control-radius: 10px;
```

### 4.2 Semântica de cor

- vermelho Unilog: marca, CTA, foco e destaque principal;
- grafite: informação, texto forte e séries realizadas;
- cinza: previsto/referência;
- verde: sucesso;
- amarelo: atenção;
- vermelho de perigo: erro, desvio ou ação destrutiva;
- azul/índigo do tema PrimeReact não deve aparecer na interface final.

### 4.3 Componentes PrimeReact usados como padrão

| Necessidade | Extra Cost Control |
| --- | --- |
| Card/painel | `Card` |
| Tabela | `DataTable` + `Column` |
| Dialog | `Dialog` através de `Modal` compartilhado |
| Dropdown | `Dropdown` |
| Botão | `Button` |
| Busca | `InputText` em `SearchField` compartilhado |
| Senha | `Password` |
| Textarea | `InputTextarea` |
| Toggle | `InputSwitch` |
| Checkbox | `Checkbox` |
| Status | `Tag` através de `Badge` compartilhado |
| Paginação | `Paginator` |
| Tabs | `SelectButton` / `TabMenu` |
| Loading | `Skeleton` |
| Avisos | `Message` / notice compartilhado |
| Gráficos | `Chart` PrimeReact + Chart.js |
| Avatar | `Avatar` |

### 4.4 Wrappers compartilhados

O Extra Cost evita espalhar PrimeReact sem camada semântica. Entre os padrões reutilizáveis estão:

- `Panel`;
- `PanelHeader`;
- `SearchField`;
- `PageToolbar`;
- `SummaryMetrics`;
- `Badge`;
- `Chip`;
- `EmptyState`;
- `Skeleton`;
- `Modal`.

Esse padrão deve ser replicado no BI: a página usa o componente semântico do BI e esse componente encapsula PrimeReact quando apropriado.

## 5. Gráficos: padrão que deve ser trazido ao BI

O Extra Cost usa PrimeReact Chart + Chart.js para:

- barras verticais;
- barras horizontais;
- linhas;
- scatter;
- Pareto bar + line;
- múltiplos eixos quando necessário.

Permanece customizado quando a estrutura não é naturalmente um chart:

- heatmap/matriz;
- comparativos executivos compostos;
- grades informacionais;
- record cards.

### 5.1 Regras importantes que devem ser copiadas

- `responsive: true`;
- `maintainAspectRatio: false`;
- stage com altura controlada;
- canvas ocupando 100% do stage;
- labels longos abreviados no eixo;
- nome completo preservado no tooltip;
- ranking com nomes longos preferencialmente horizontal;
- `autoSkip` em séries temporais quando necessário;
- rotação limitada quando útil;
- eixos monetários compactos;
- séries realizadas em grafite;
- projeção/destaque em vermelho Unilog;
- não usar cores aleatórias;
- evitar grandes áreas vazias dentro do card.

### 5.2 Candidato direto no BI

`src/components/SimpleLineChart.tsx` é um candidato forte à migração para PrimeReact Chart. Hoje ele mantém manualmente:

- SVG;
- cálculo de escala;
- pontos de interação;
- tooltip customizado;
- legenda interativa;
- labels de eixo;
- cores de séries.

A migração deve preservar os dados e a semântica existente; muda apenas a camada de renderização.

## 6. Diferença arquitetural crítica: Extra Cost x BI

### Extra Cost Control

Possui uma página raiz e navegação interna por estado.

```text
/
 └─ FunctionalShell
     ├─ Dashboard
     ├─ Solicitações
     ├─ Fechamentos
     ├─ Cadastros
     └─ Usuários
```

Esse formato funciona bem com `output: 'export'` porque não precisa gerar páginas dinâmicas para entidades em runtime.

### BI Logístico V2

O BI possui URLs reais via React Router:

```text
/
/kpis
/supervisores
/depositantes
/financeiro
/fca
/fca/novo
/fca/:id
/fca/:id/editar
/administracao/supervisores
/administracao/substituicoes
/administracao/acessos
```

As rotas `/fca/:id` e `/fca/:id/editar` são particularmente importantes porque o ID nasce em runtime.

### Impacto em Next.js static export

Uma migração literal para App Router + export estático criaria uma decisão adicional:

1. transformar os IDs dinâmicos em rotas pré-geradas — inadequado porque os IDs não são conhecidos em build;
2. mudar o contrato de URL — regressão funcional indesejada;
3. manter React Router dentro de uma página Next e usar fallback SPA — adiciona Next sem usufruir do roteamento App Router;
4. abandonar export estático e ir para SSR/Workers — altera infraestrutura e aumenta muito o raio da migração.

Por isso, **Next.js não deve ser requisito para atingir a paridade visual com o Extra Cost**.

## 7. Decisão recomendada para o PR #69

### Arquitetura recomendada

```text
React 19
TypeScript
Vite
React Router
PrimeReact 10.9.9
PrimeIcons 7
Chart.js 4.x
PrimeReact Chart
Design System Unilog alinhado ao Extra Cost
Cloudflare Pages + Pages Functions
Supabase preservado
Apps Script/HUB preservado
```

### O que é compartilhado conceitualmente com o Extra Cost

- PrimeReact;
- PrimeIcons;
- Chart.js;
- tokens;
- shell visual;
- wrappers;
- cards;
- badges;
- tabelas;
- dialogs;
- filtros;
- charts;
- responsividade;
- mobile record cards;
- regras de acessibilidade e densidade.

### O que permanece específico do BI

- Vite;
- React Router;
- Supabase Auth;
- MFA/AAL2;
- RLS;
- governança OWNER/ADMIN;
- HUB bootstrap;
- filtros globais do BI;
- FCA;
- regras financeiras e de inventário;
- rotas existentes;
- Pages Functions atuais.

## 8. Alternativas arquiteturais avaliadas

| Opção | Benefício | Risco | Recomendação |
| --- | --- | --- | --- |
| Vite + PrimeReact + Chart.js | Máximo ganho visual com mínimo impacto funcional | Médio-baixo | **Recomendada para PR #69** |
| Next static export copiando Extra Cost literalmente | Uniformiza framework entre projetos | Alto para rotas dinâmicas e auth/recovery | Não recomendar agora |
| Next App Router com React Router interno | Mantém URLs sem SSR | Complexidade sem benefício proporcional | Não recomendar |
| Next com SSR/Workers | App Router completo e rotas dinâmicas nativas | Muito alto: deploy, runtime e infraestrutura mudam | Somente projeto futuro separado |

## 9. Modelo de release do PR #69

O PR #69 deve funcionar como **branch de release completa**, não como pacote parcial a ser mergeado cedo.

Fluxo:

```text
main estável
   ↓
feature/frontend-modernization-primereact
   ↓
commits incrementais
   ↓
Cloudflare Preview
   ↓
build + testes + auditoria visual + funcional
   ↓
PR continua Draft até tudo estar concluído
   ↓
autorização explícita
   ↓
merge único em main
   ↓
Cloudflare Production Deploy
```

### Consequência prática

- pushes na branch não devem alterar produção;
- cada push pode disparar preview;
- o merge é o gatilho que deve ser tratado como release;
- não existe necessidade de fazer merges intermediários;
- todo o escopo pode ser concluído no mesmo Draft PR, desde que os commits permaneçam pequenos e auditáveis.

## 10. Gate zero: pipeline do Cloudflare

Antes de continuar a migração visual, o pipeline precisa voltar a ser confiável.

Erro confirmado em 14/09/2026:

```text
Installing project dependencies: npm install --progress=false
npm error Cannot read properties of null (reading 'edgesOut')
```

A falha acontece antes de `npm run build`.

Portanto, ainda não existe evidência de erro no React, TypeScript, Vite ou PrimeReact desse head.

### Ações do gate zero

- tornar instalação de dependências determinística;
- adicionar lockfile compatível com o projeto;
- definir explicitamente a versão de Node usada pelo projeto/CI;
- validar instalação limpa;
- validar `npm run build`;
- validar `npm test`;
- validar Cloudflare Preview no head exato.

Nenhuma migração em massa deve prosseguir antes desse gate ficar verde.

## 11. Mapeamento de esforço relativo

Escala:

- **1 — baixo:** alteração localizada, baixo acoplamento;
- **2 — baixo/médio:** alguns consumidores, validação simples;
- **3 — médio:** múltiplos componentes/telas ou CSS associado;
- **4 — alto:** superfície compartilhada ou risco de regressão transversal;
- **5 — muito alto:** fluxo crítico, muitos estados ou forte acoplamento funcional.

A escala mede complexidade e risco de implementação, não calendário.

| Frente | Escopo | Esforço | Risco | Dependência |
| --- | --- | ---: | --- | --- |
| Gate de build | lockfile, Node, build/test/preview | 3 | Alto imediato | nenhuma |
| Design tokens | alinhar BI ao Extra Cost sem quebrar aliases | 2 | Baixo | build verde |
| PrimeReact foundation | provider, tema/normalização, PrimeIcons | 2 | Médio | tokens |
| Primitives | Badge/Tag, Panel/Card, Search, Feedback, Skeleton | 3 | Médio | PrimeReact |
| Login/recovery | visual PrimeReact, auth intacta | 2 | Médio | primitives |
| MFA | inputs, messages e states sem tocar AAL2 | 3 | Alto | auth validada |
| Shell | sidebar, drawer, topbar, avatar, filtros | 4 | Alto | primitives |
| Filtros globais | Dropdown/MultiSelect quando adequado | 4 | Alto | shell |
| Home | cards, ranking, charts e estados | 4 | Médio-alto | charts |
| KPIs | charts, status e tabelas | 4 | Médio-alto | charts |
| Supervisores | tabela/cards/detail e status | 4 | Médio | DataTable |
| Depositantes | tabela/cards/detail/FCA contextual | 4 | Médio-alto | DataTable |
| Financeiro | tabela, cards e semântica de valores | 3 | Alto funcional | DataTable |
| FCA lista | DataTable + record cards + status | 4 | Alto | primitives |
| FCA novo/editar | formulários, dropdowns, stepper | 5 | Muito alto | forms |
| FCA detalhe | hero, ações, status, dialogs | 4 | Alto | dialogs |
| Admin fotos | DataTable/form/avatar | 3 | Médio | DataTable |
| Admin substituições | tabela/form/regras de vigência | 4 | Alto funcional | forms |
| Admin acessos | tabela, governança e dialogs | 4 | Muito alto | auth/governança |
| SimpleLineChart | migrar SVG manual para Chart.js | 3 | Médio | chart foundation |
| Outros charts artesanais | ranking/evolução/comparativos quando aplicável | 4 | Médio | chart foundation |
| Mobile record cards | preservar/melhorar tabelas extensas | 4 | Médio | telas migradas |
| CSS legado | remover apenas consumidores comprovadamente extintos | 4 | Alto | auditoria |
| Auditoria final | 12+ superfícies, 4 breakpoints, estados async | 5 | Alto | todas as frentes |

## 12. Matriz de migração por superfície

| Tela/fluxo | Padrão Extra Cost aplicável | Ação no BI | Esforço |
| --- | --- | --- | ---: |
| Login | InputText, Password, Button, shell de marca | manter lógica Supabase; alinhar visual | 2 |
| Recovery/SetPassword | Password + Message + layout login | manter callback/session | 2 |
| MFA | Password/InputText/Message | somente apresentação | 3 |
| Visão Geral | Card + Chart + SummaryMetrics | migrar visual e charts adequados | 4 |
| KPIs | cards semânticos + Chart | padronizar chart stage/status | 4 |
| Supervisores | DataTable desktop + cards mobile | migrar tabela sem alterar escopo | 4 |
| Depositantes | DataTable + detalhe + badges | preservar seleção/contexto FCA | 4 |
| Financeiro | cards/tabela/labels monetários | preservar regra de despesa sem escopo | 3 |
| FCA lista | DataTable/Paginator/Tag | preservar deriveFcaDisplayStatus | 4 |
| FCA novo | Dropdown/Input/Textarea/Button | preservar RPC/regras | 5 |
| FCA editar | idem + contexto histórico | preservar ações canceladas e snapshots | 5 |
| FCA detalhe | Card/Tag/Dialog | preservar permissões e workflow | 4 |
| Admin supervisores | DataTable/Avatar/Dialog | preservar upload/escopo | 3 |
| Admin substituições | DataTable/Dialog/forms | preservar vigência e RLS | 4 |
| Admin acessos | DataTable/Tag/Dialog | preservar OWNER-only | 4 |

## 13. Benefícios esperados

### Produto

- BI e Extra Cost passam a parecer produtos da mesma plataforma Unilog;
- menor carga cognitiva para usuários que transitam entre sistemas;
- shell, cards, filtros, tabelas e dialogs coerentes;
- status mais fáceis de interpretar;
- melhor experiência em notebook e mobile.

### Engenharia

- reduz componentes artesanais repetidos;
- centraliza visual em wrappers e tokens;
- Chart.js remove manutenção manual de SVG, escala e tooltip em gráficos comuns;
- DataTable padroniza interação de tabelas desktop;
- wrappers reduzem acoplamento direto à biblioteca;
- CSS legado pode ser removido progressivamente com critério;
- design system documentado diminui regressão visual futura.

### Gráficos

- tooltips consistentes;
- labels longos tratados corretamente;
- melhor responsividade;
- múltiplos eixos quando realmente necessários;
- barras horizontais para rankings;
- menos lógica gráfica manual;
- visual alinhado ao Extra Cost.

## 14. Riscos e mitigação

### 14.1 Pipeline npm/Cloudflare

**Risco:** preview não compila antes mesmo do build.  
**Impacto:** bloqueia validação real.  
**Mitigação:** gate zero obrigatório; instalação determinística antes de ampliar o diff.

### 14.2 Cascade CSS do PrimeReact

**Risco:** tema Lara reintroduzir azul/índigo, radius ou spacing diferentes.  
**Mitigação:** design system Unilog carregado por último; tokens canônicos; auditoria visual por componente.

### 14.3 Acúmulo de overrides

**Risco:** repetir no BI a fase histórica do Extra Cost em que vários CSS de transição coexistem.  
**Mitigação:** definir um bridge temporário único e remover regras à medida que o componente migra.

### 14.4 Tabelas

**Risco:** trocar markup pode alterar sort, paginação, seleção, ações ou leitura mobile.  
**Mitigação:** dados e callbacks permanecem no domínio atual; migração primeiro visual; record cards mantidos no mobile.

### 14.5 Charts

**Risco:** alterar escala, agregação ou leitura do indicador durante a troca do renderer.  
**Mitigação:** reutilizar exatamente as séries calculadas hoje; nenhuma fórmula migra para o componente Chart.

### 14.6 Shell e filtros globais

**Risco:** regressão de escopo de supervisor/módulo/período.  
**Mitigação:** não alterar a semântica de `DashboardFilters`; PrimeReact substitui apenas o controle visual.

### 14.7 Auth/MFA

**Risco:** componente visual interferir em recovery, sessão ou AAL2.  
**Mitigação:** congelar `src/lib/supabase.ts` e lógica do `MfaGate`; alterar apenas composição visual.

### 14.8 FCA

**Risco:** é a área de maior densidade funcional e histórica.  
**Mitigação:** migrar por tela; preservar `src/lib/fca.ts`, RPCs, status derivados, snapshots e permissões.

### 14.9 Merge = release

**Risco:** merge em `main` dispara Cloudflare Production automaticamente.  
**Mitigação:** PR permanece Draft até o head final passar em build, testes, preview, smoke funcional e auditoria visual.

## 15. Por que não migrar para Next.js agora

### Benefícios reais de Next

- stack igual ao Extra Cost;
- App Router e convenções modernas;
- futura possibilidade de compartilhamento mais direto de estrutura entre projetos;
- code splitting e carregamento por rota se a arquitetura fosse redesenhada para isso.

### Custos/riscos no BI

- rotas dinâmicas de FCA não encaixam naturalmente no static export;
- Supabase recovery e sessão precisam ser revalidados em outra fronteira de routing;
- App Router exigiria providers/client boundaries para HUB, filtros e auth globais;
- SSR/Workers mudaria infraestrutura sem necessidade de negócio;
- aumenta dependências e superfície do build no momento em que o pipeline já está instável;
- não melhora badges, cards, charts ou responsividade por si só.

### Decisão

Next.js fica **deferido**, não proibido.

Só deve ser reaberto se surgir uma necessidade concreta como:

- SSR;
- Server Actions;
- middleware server-side;
- Route Handlers Next que tragam ganho real;
- compartilhamento de plataforma que justifique mudar o roteamento/deploy;
- decisão de migrar o runtime do BI para Workers/SSR.

Até lá, a escolha mais eficiente é modernizar a camada de apresentação mantendo Vite/React Router.

## 16. Escopo exato do PR #69

### Incluído

- correção/hardening do pipeline necessário para preview confiável;
- PrimeReact, PrimeIcons e Chart.js;
- design system alinhado ao Extra Cost;
- wrappers e primitives compartilhados;
- login/recovery/MFA visual;
- shell/sidebar/drawer/topbar;
- filtros visuais;
- cards e badges;
- DataTable onde apropriado;
- forms/dialogs onde apropriado;
- charts Chart.js onde apropriado;
- responsividade real;
- auditoria de todas as telas;
- remoção gradual do legado somente quando sem consumidores;
- documentação final.

### Fora do escopo

- mudança de regras de negócio;
- mudança de cálculos;
- mudança de contratos API;
- mudança de Supabase/RLS;
- migração de banco;
- reescrita Apps Script/HUB;
- alteração de escopos/perfis;
- mudança das regras FCA;
- mudança das regras financeiras;
- migração obrigatória para Next.js;
- migração Pages → Workers apenas por estética.

## 17. Ordem recomendada dentro do mesmo PR

1. Gate de build/Cloudflare.
2. Consolidar design system com referência Extra Cost.
3. Primitives/wrappers.
4. Login + recovery + MFA visual.
5. Shell + navegação + filtros.
6. Visão Geral.
7. KPIs e charts compartilhados.
8. Supervisores.
9. Depositantes.
10. Financeiro.
11. FCA lista/detalhe.
12. FCA novo/editar.
13. Administração.
14. Mobile/table record cards.
15. Auditoria completa.
16. Remoção de legado comprovadamente órfão.
17. Build + testes + preview no head final.
18. Smoke funcional.
19. Tirar de Draft somente após tudo concluído.
20. Pedir autorização explícita para merge.

## 18. Critérios de merge/release

O PR #69 só pode ser mergeado quando, no mesmo head:

- instalação de dependências passar;
- build passar;
- testes passarem;
- Cloudflare Preview estiver verde;
- login funcionar;
- recovery funcionar;
- MFA funcionar para perfis aplicáveis;
- HUB bootstrap funcionar;
- filtros globais preservarem escopo;
- todas as rotas atuais funcionarem;
- FCA criar/editar/listar/detalhar sem regressão;
- áreas administrativas respeitarem autorização;
- charts não tiverem labels sobrepostos;
- tabelas mobile estiverem legíveis;
- não houver overflow horizontal indevido;
- nenhum segredo tiver sido exposto;
- auditoria de todas as telas estiver fechada;
- usuário autorizar explicitamente o merge.

## 19. Arquivos de referência

Extra Cost Control:

- `src/app/layout.tsx`;
- `src/app/page.tsx`;
- `src/app/prime-design-system.css`;
- `src/components/ui/Primitives.tsx`;
- `src/components/ui/Modal.tsx`;
- `src/components/DashboardPage.tsx`;
- `src/components/AdvancedAnalytics.tsx`;
- `docs/PRIMEREACT_DESIGN_SYSTEM.md`;
- `docs/CLOUDFLARE_GATEWAY.md`;
- `next.config.ts`.

BI Logístico V2:

- `src/App.tsx`;
- `src/components/AppShell.tsx`;
- `src/components/SimpleLineChart.tsx`;
- `src/components/ui/*`;
- `src/design-system.css`;
- `src/ui-foundations.css`;
- `src/lib/dashboard.ts`;
- `src/lib/fca.ts`;
- `src/lib/governance.ts`;
- `src/lib/substitutions.ts`;
- `functions/`;
- `MEMORIA_PROJETO.md`;
- `docs/PRIMEREACT_DESIGN_SYSTEM.md`.

## 20. Decisão final

Para o PR #69, o Extra Cost Control é a **referência de arquitetura de apresentação**, não um template para cópia literal de infraestrutura.

A modernização recomendada é:

> preservar o BI funcional atual e substituir progressivamente a camada de interface por uma linguagem compartilhada Unilog baseada em PrimeReact + PrimeIcons + Chart.js, mantendo Vite/React Router e os backends existentes.

Isso entrega a maior parte do benefício visual e de manutenção do Extra Cost com um raio de risco muito menor do que uma migração simultânea de framework, roteamento, interface e deploy.
