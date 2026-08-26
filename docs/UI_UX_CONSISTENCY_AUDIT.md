# BI Logístico V2 — Auditoria de Consistência UI/UX

> Auditoria operacional baseada em `docs/BI_LOGISTICO_UI_UX_SKILL.md`.
>
> Objetivo: identificar inconsistências transversais e corrigi-las por padrão compartilhado, não por página isolada.

## Escopo

Páginas auditadas:

- Visão Geral;
- KPIs;
- Supervisores;
- Depositantes;
- Financeiro;
- FCA — lista, detalhe, novo e editar;
- Administração — Acessos e Substituições;
- Shell global — sidebar, topbar e filtros globais.

## Critério de severidade

- **P0 — funcional/UX crítico:** quebra navegação, leitura ou uso mobile.
- **P1 — consistência de produto:** mesmo padrão funcional aparece com anatomias diferentes.
- **P2 — refinamento visual:** diferença de densidade, spacing ou acabamento sem quebra de fluxo.
- **P3 — dívida técnica:** CSS/componente duplicado que ainda não afeta diretamente o usuário.

## Achados transversais

### P1 — Toolbars locais não seguem uma anatomia única

Situação atual:

- FCA possui toolbar local separada para busca + status;
- Depositantes usa busca como `actions` do `PageHeader`;
- telas administrativas ainda não possuem um workspace/toolbars coerentes entre si;
- parte do CSS de toolbar está em `ui-foundations.css`, parte em CSS específico de página.

Padrão obrigatório:

```text
PAGE HEADER
- contexto/título/descrição
- CTA primário da página

PAGE TOOLBAR
- busca
- filtros locais
- ações secundárias
```

A busca não deve competir visualmente com CTA do header.

**Ação:** criar primitive compartilhado `PageToolbar` e migrar FCA/Depositantes primeiro.

---

### P1 — Summary metrics possuem múltiplas anatomias

Situação atual:

- Home usa Primary/Supporting KPI;
- KPIs usa composição própria;
- Supervisores/Depositantes usam summaries próprios;
- FCA possui status summary próprio;
- Administração/Substituições usa `admin-summary-card`.

A diferença funcional é válida, mas spacing, label, contagem e comportamento mobile devem obedecer uma anatomia compartilhada.

**Ação futura:** criar primitives/variants de `SummaryMetric` e `SummaryStrip`.

---

### P1 — Tabelas/listas ainda dependem de exceções por página

A base `responsive-data-table` já resolve grande parte do mobile, porém Depositantes, FCA e Administração possuem overrides específicos.

Padrão obrigatório:

- desktop: tabela quando comparação entre colunas é importante;
- mobile: card/lista com identidade, status, metadados, KPIs e CTA;
- nenhuma informação essencial deve depender de scroll horizontal.

**Ação futura:** consolidar anatomia de `ResponsiveRecordList`/table-card somente após estabilizar as páginas administrativas.

---

### P1 — Detail/360 views têm padrões diferentes

Hoje Supervisor 360, Depositante 360 e FCA Detail usam composições diferentes para:

- hero;
- owner/context;
- metadata;
- actions;
- secondary content.

A informação pode variar, mas a gramática deveria ser:

```text
DETAIL HERO
identity + semantic status + actions

DETAIL METRICS
primary/supporting

DETAIL WORKSPACE
main content + supporting context

SECONDARY DISCLOSURE
history/audit/technical context
```

**Ação futura:** definir `EntityHero`/`DetailHero` e padrões de disclosure.

---

### P1 — Administração/Acessos é o maior gap visual restante

A página já usa primitives (`Panel`, `Badge`, `EmptyState`), porém ainda se comporta como uma tabela administrativa simples.

O backend disponível permite com segurança:

- listar usuários provisionados;
- distinguir Owner/Admin/User;
- visualizar perfil operacional/status;
- conceder Admin;
- revogar Admin.

Não criar ações sem backend.

Melhorias de UX possíveis sem alterar governança:

- summary stats;
- busca e filtros;
- detalhe de usuário em drawer;
- distinção visual entre governança e perfil operacional;
- confirmação própria em modal em vez de `window.confirm`;
- cards mobile;
- acesso à auditoria quando a fonte disponível suportar.

---

### P1 — Administração/Substituições precisa adotar o mesmo workspace

A página possui summary + guidance + `SubstitutionManager`, mas a composição não segue ainda o mesmo modelo de listagem/gestão do restante do produto.

**Ação futura:** workspace com toolbar, lista/coberturas, status, progressive disclosure e formulário/contexto em painel coerente.

---

### P2 — PageHeader está bem adotado, mas ações precisam de regra única

A maioria das páginas usa `PageHeader`, o que é positivo.

Regra consolidada:

- header contém CTA primário e ações de navegação do contexto;
- busca, status e filtros locais não pertencem ao header;
- mobile empilha ações sem reduzir touch target;
- descrições curtas e com função.

---

### P2 — Shell está funcionalmente consistente

Pontos positivos atuais:

- sidebar desktop recolhível;
- drawer mobile com focus trap e Escape;
- navegação administrativa separada;
- topbar com escopo ativo;
- filtro global separado do conteúdo;
- filtros contextuais ocultos em detalhe/edição quando apropriado.

O shell não precisa de redesign estrutural neste momento. Ajustes futuros devem ser de tokens/densidade/acessibilidade, não de arquitetura.

---

### P2 — Feedback states ainda precisam de passe transversal

Já existem `Skeleton`, `EmptyState`, notices e retry em partes do BI.

Falta garantir cobertura consistente em:

- Administração;
- Substituições;
- detalhes assíncronos;
- erros de mutação;
- confirmações sensíveis.

---

### P3 — CSS específico cresceu demais

Arquivos de página cumprem função de estabilização, mas há padrões repetidos entre:

- Home;
- KPIs;
- Supervisores;
- Depositantes;
- Financeiro;
- FCA;
- Administração.

Não consolidar tudo agora.

Regra: promover para foundation somente quando a anatomia compartilhada estiver validada em três ou mais superfícies.

## Roadmap de normalização

### Bloco 1 — Shell + PageHeader + Toolbars

- manter shell atual;
- criar `PageToolbar` primitive;
- migrar FCA List;
- migrar Depositantes;
- fixar spacing e comportamento mobile em foundation.

### Bloco 2 — Summary metrics/cards

- inventariar summaries;
- criar variants compartilhadas;
- migrar FCA, Supervisores, Depositantes e Administração.

### Bloco 3 — Tabelas/listas

- consolidar desktop table anatomy;
- consolidar mobile record-card anatomy;
- remover overrides redundantes progressivamente.

### Bloco 4 — Detail/360 views

- criar padrão hero + metrics + workspace + disclosure;
- alinhar Supervisor, Depositante e FCA.

### Bloco 5 — Forms

- consolidar seção, ajuda, error state, actions e steps;
- aplicar a FCA e Substituições.

### Bloco 6 — Administração/Acessos/Substituições

- redesign dentro das capacidades reais do backend;
- drawer/modal/tabs quando agregarem produtividade;
- mobile dedicado.

### Bloco 7 — Acessibilidade + feedback

- foco;
- teclado;
- contraste;
- aria;
- loading/empty/error/success;
- confirmação própria.

### Bloco 8 — Consolidação CSS

Somente após validação visual/funcional dos blocos anteriores.

## Definição de concluído da auditoria

A auditoria não termina quando todas as páginas ficam visualmente iguais.

Ela termina quando:

- a mesma função usa a mesma anatomia;
- padrões novos começam em primitives, não em CSS de página;
- mobile não exige gestos horizontais para conteúdo essencial;
- status tem uma única semântica;
- ações aparecem em posições previsíveis;
- detalhes preservam contexto de origem;
- novas telas podem ser construídas consultando a skill sem inventar uma linguagem nova.
