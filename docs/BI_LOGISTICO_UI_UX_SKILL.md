---
name: bi-logistico-ui-ux
description: Padrão obrigatório de UI/UX do BI Logístico V2. Use antes de criar, revisar ou alterar qualquer tela, componente, fluxo, tabela, formulário, dashboard, modal, drawer, filtro ou experiência mobile do projeto. Consolida identidade Unilog, design system existente, benchmarks Preline/Flowbite e critérios de responsividade/acessibilidade.
---

# BI Logístico V2 — UI/UX Skill

Este documento é a **fonte de verdade visual e de interação** do BI Logístico V2.

Ele existe para impedir que cada página crie sua própria linguagem. Home, KPIs, Supervisores, Depositantes, Financeiro, FCA e Administração devem parecer partes do **mesmo produto**, ainda que tenham objetivos diferentes.

Antes de alterar qualquer interface, ler este documento e verificar os primitives/tokens já existentes no código.

---

## 1. Princípio central

O BI deve transmitir:

- confiança;
- clareza operacional;
- velocidade de leitura;
- controle;
- consistência;
- baixa carga cognitiva.

O produto deve parecer um **dashboard administrativo/analítico moderno da Unilog**, não um conjunto de páginas independentes.

A interface deve priorizar informação e tomada de decisão. Efeito visual sem função não é prioridade.

### Regra de ouro

> O usuário deve aprender um padrão de interação uma vez e reconhecê-lo em todas as telas.

Se dois componentes cumprem a mesma função, devem ter a mesma anatomia, comportamento e linguagem visual.

---

## 2. Fontes de referência e ordem de precedência

Quando houver dúvida, usar esta ordem:

1. **Regras funcionais e de segurança do BI** — nunca podem ser quebradas por decisão visual.
2. **Esta UI/UX Skill** — define a gramática visual e de interação do produto.
3. **Design system implementado no repositório** — `src/design-system.css` e primitives compartilhados.
4. **Identidade visual Unilog** — skill `unilog-brand` fornecida ao projeto.
5. **Preline Analytics Dashboard** — benchmark principal para dashboards, KPIs, gráficos e reporting.
6. **Preline Admin Dashboard** — benchmark para usuários, administração, tabelas e gestão.
7. **Flowbite React** — benchmark complementar de comportamento React para Drawer, Modal, Sidebar, Tabs, Tables e Forms.

Preline e Flowbite são **referências**, não dependências obrigatórias.

Não instalar Tailwind/Flowbite/Preline apenas para reproduzir um componente visual sem uma decisão arquitetural explícita.

---

## 3. Identidade Unilog aplicada ao produto

A UI deve respeitar a identidade Unilog como camada de marca.

### Paleta base

| Token | Cor | Uso |
|---|---|---|
| Cinza Unilog | `#494a56` | identidade, navegação, texto forte, superfícies escuras |
| Vermelho Unilog | `#db0812` | CTA principal, acento de marca, foco selecionado |
| Cinza escuro | `#3a3b45` | apoio em superfícies escuras |
| Cinza claro | `#e8e8ea` | apoio, superfícies secundárias |
| Branco | `#ffffff` | superfície principal |
| Cinza texto | `#5a5b66` | texto secundário |

### Regra do vermelho

O vermelho é **acento de marca**, não cor universal de alerta.

Usar vermelho Unilog para:

- CTA principal;
- item selecionado quando fizer sentido;
- detalhe de identidade;
- foco/ênfase pontual.

Não usar vermelho de marca para representar automaticamente erro, atraso ou criticidade. Estados semânticos usam os tokens próprios de sucesso, atenção, perigo e neutro.

### Tipografia

- Fonte preferencial digital: **Roboto**.
- Títulos: Bold/Black.
- Corpo: Regular.
- Labels: Bold, pequenos, com tracking controlado.
- Evitar excesso de caixa alta em textos longos.

---

## 4. Design tokens obrigatórios

Antes de criar valor CSS novo, verificar os tokens existentes em `src/design-system.css`.

### Cores semânticas

```css
--brand-primary: #db0812;
--brand-primary-hover: #b8070f;
--brand-primary-soft: #fdecee;

--status-success: #3f7c59;
--status-success-soft: #edf6f0;
--status-warning: #a87900;
--status-warning-soft: #fff6d8;
--status-danger: #c91a23;
--status-danger-soft: #fff0f1;
--status-neutral: #6f747d;
--status-neutral-soft: #f1f2f4;
```

### Superfícies

```css
--surface-canvas: #f5f6f8;
--surface-primary: #fff;
--surface-secondary: #f8f9fa;
--surface-tertiary: #f2f3f5;
--text-primary: #2f3136;
--text-secondary: #5f636b;
--text-muted: #858a93;
--border-default: #e2e4e8;
--border-strong: #cdd0d5;
```

### Espaçamento

Escala obrigatória:

```text
4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 px
```

Evitar valores arbitrários como `17px`, `23px`, `37px` sem justificativa de componente específico.

### Radius

- controle: `8px`;
- card/painel: `11px`;
- pill/badge: `999px`.

### Sombra

Sombras devem ser discretas. Priorizar borda + contraste de superfície antes de adicionar sombra.

---

## 5. Anatomia padrão de página

Toda página principal deve seguir a mesma sequência visual, salvo exceção funcional explícita.

```text
SHELL GLOBAL
↓
PAGE HEADER
↓
SUMMARY / HEADLINE METRICS (quando aplicável)
↓
TOOLBAR / FILTROS LOCAIS (quando aplicável)
↓
CONTEÚDO PRINCIPAL
↓
DETALHAMENTO / TABELA / TIMELINE
↓
ESTADOS / AÇÕES SECUNDÁRIAS
```

### Page Header

Obrigatório usar o mesmo padrão:

- eyebrow;
- título;
- descrição curta;
- ações à direita no desktop;
- ações abaixo e largura adequada no mobile.

Não criar headers próprios por página sem necessidade real.

### Eyebrow

Serve como categoria, não como segundo título.

Exemplos:

- `VISÃO EXECUTIVA`
- `CARTEIRA`
- `CONTROLE DE DESVIOS`
- `ADMINISTRAÇÃO`

---

## 6. Hierarquia de métricas

Nem todos os KPIs devem ter o mesmo peso.

### Três níveis

#### Primary metric
Resultado que responde a principal pergunta da página.

Exemplos:

- Receita realizada;
- Atingimento;
- Produção;
- Pontuação de inventário.

#### Supporting metric
Explica ou contextualiza o principal.

Exemplos:

- planejado;
- saldo;
- prazo;
- endereço;
- unidade;
- SKU.

#### Context metric
Informação operacional auxiliar, normalmente menor e sem card dominante.

Exemplos:

- quantidade de registros;
- módulo;
- data;
- escopo;
- auditorias.

### Regra

Uma página não deve começar com 6–8 cards visualmente equivalentes se apenas 2–3 são realmente decisivos.

---

## 7. Cards

Cards devem ter função clara.

### Tipos permitidos

1. KPI primary.
2. KPI supporting.
3. Summary/status.
4. Entity card (Supervisor/Depositante/Usuário).
5. Action/record card (FCA, cobertura, pendência).
6. Informational card.

Não criar um novo tipo de card apenas para variar o visual.

### Anatomia de entity card

```text
IDENTIDADE
nome / avatar / código

STATUS PRINCIPAL
um único diagnóstico semântico

MÉTRICAS DE APOIO
2–4 valores

METADADOS
módulo / contagem / escopo
```

### Evitar

- status duplicado em duas áreas do mesmo card;
- rail colorido + badge + texto colorido dizendo a mesma coisa;
- cards clicáveis sem affordance;
- excesso de bordas coloridas.

---

## 8. Status e severidade

### Regra funcional visual

O estado mais severo governa a superfície de status quando o componente representa um conjunto.

```text
CRÍTICO > ATENÇÃO > NEUTRO > OK
```

Exemplo: se um Supervisor possui qualquer Depositante crítico, a saúde da carteira é crítica, mesmo que a média agregada esteja em atenção.

### Cor semântica

- sucesso = verde;
- atenção = amarelo;
- crítico/erro = vermelho semântico;
- neutro/sem dados = cinza.

Não usar somente cor para transmitir estado. Sempre combinar com label, badge, ícone ou texto.

---

## 9. Tabelas e listas

### Desktop

Tabelas devem seguir:

- header discreto;
- identidade primária na primeira coluna;
- números alinhados de forma consistente;
- status em badge;
- hover leve;
- CTA explícito quando a linha não for inteira clicável.

### Mobile

**Não comprimir tabela desktop.**

A tabela deve se transformar em card/lista quando houver múltiplas colunas relevantes.

Anatomia recomendada:

```text
HEADER
Identidade principal          Status
Metadado secundário

META
Supervisor | Módulo

KPIs
Produção | Recebimento | Inventário

RODAPÉ
CNPJ / data / CTA
```

### Regra de overflow

Nenhuma informação essencial pode exigir arraste horizontal no mobile.

Scroll horizontal só é permitido quando o próprio conteúdo é intrinsecamente horizontal e não existe alternativa sem perda de significado — caso raro no BI.

Cards de resumo, filtros e steps **não podem ser carrossel obrigatório**.

---

## 10. Toolbars e filtros

### Filtro global

Período, Supervisor e Módulo pertencem ao shell global e devem manter comportamento consistente.

### Filtro local

Busca/status/opções da página devem ficar em toolbar própria.

### Desktop

- busca ocupa área flexível;
- selects à direita ou em sequência previsível;
- altura padrão de controle;
- reset/ação auxiliar em botão iconográfico quando adequado.

### Mobile

- empilhar sem criar rolagem horizontal;
- labels podem ser ocultadas se o placeholder/aria-label continuar claro;
- touch target mínimo prático de ~40–44 px quando possível;
- filtros avançados podem usar progressive disclosure.

---

## 11. Forms

Formulários devem parecer fluxo de trabalho, não uma pilha de inputs.

### Estrutura

```text
PAGE HEADER
↓
ORIENTAÇÃO / STEPS (se útil)
↓
SEÇÃO 1 — contexto
↓
SEÇÃO 2 — análise
↓
SEÇÃO 3 — ações
↓
AÇÕES DO FORM
```

### Steps

Stepper serve para orientação.

Não deve exigir swipe/arraste horizontal.

No mobile:

- usar grid compacto quando couber;
- ou lista vertical em telas estreitas.

### Inputs

- label sempre visível quando o significado não for óbvio;
- erro próximo ao campo/bloco;
- foco visível;
- selects e inputs com a mesma altura/radius;
- uma coluna real no mobile.

---

## 12. Modais, drawers e progressive disclosure

Usar padrões semelhantes aos benchmarks Preline/Flowbite.

### Modal

Usar quando:

- confirmação requer contexto;
- ação é curta e bloqueante;
- mudança é sensível.

Evitar `window.confirm` em fluxos importantes.

### Drawer

Usar quando:

- usuário precisa consultar/editar detalhe sem perder a lista;
- contexto lateral melhora produtividade;
- Administração/Acessos precisar mostrar perfil de usuário, permissões ou auditoria.

### Accordion / disclosure

Usar para conteúdo secundário como:

- auditoria;
- histórico técnico;
- detalhes avançados;
- explicações longas.

Não dar o mesmo peso visual a conteúdo primário e auditoria.

---

## 13. Navegação contextual

Ao entrar em um detalhe a partir de uma entidade, o usuário deve retornar à origem real.

Exemplos:

```text
Supervisor 360 → FCA → Voltar → mesmo Supervisor 360
Depositante 360 → FCA → Voltar → mesmo Depositante 360
Lista FCA → FCA → Voltar → Lista FCA
```

Evitar sempre mandar `Voltar` para uma rota fixa quando a origem é conhecida.

---

## 14. Estados de feedback

Toda superfície assíncrona deve prever:

- loading;
- empty;
- error;
- success quando aplicável.

Usar primitives compartilhados (`Skeleton`, `EmptyState`, notices), não criar textos soltos diferentes por página.

### Empty state útil

Deve explicar:

1. o que não existe;
2. por que pode não existir;
3. o que o usuário pode fazer.

---

## 15. Gráficos

### Regras

- título e contexto no panel header;
- legenda consistente;
- tooltip discreto;
- evitar colisão de rótulos;
- sem cores aleatórias;
- séries com semântica estável entre páginas;
- empty state no lugar de SVG vazio.

Não usar vermelho como série padrão se isso fizer o usuário interpretar criticidade quando é apenas identidade visual.

---

## 16. Mobile-first obrigatório

Responsividade é requisito de aceite, não etapa final.

Toda alteração deve ser pensada em três faixas:

```text
Desktop
Tablet
Mobile
```

E, quando necessário, mobile estreito.

### Mobile não é desktop espremido

Priorizar:

- ordem de leitura;
- cards em vez de tabelas largas;
- grids 2x2 / 1 coluna;
- menos metadados simultâneos;
- CTA claros;
- touch targets adequados;
- progressive disclosure;
- ausência de overflow horizontal obrigatório.

### Checklist mobile mínimo

- nenhum card essencial cortado;
- nenhum resumo exige swipe lateral;
- nenhum stepper exige swipe lateral;
- texto não encosta em rails/status;
- botões não ficam pequenos demais;
- ações principais continuam visíveis;
- nomes longos quebram corretamente;
- tabelas viram cards quando necessário;
- modais/drawers cabem na viewport.

---

## 17. Administração e Acessos

Administração deve seguir padrão de produto administrativo real, não tela utilitária isolada.

### Estrutura recomendada

```text
PAGE HEADER
↓
SUMMARY
Owner | Admins | Usuários | Inativos
↓
TOOLBAR
Busca | perfil | status
↓
LISTA/TABELA
Identidade | Governança | Perfil operacional | Status | Ações
↓
DRAWER DE DETALHE
Dados | permissões | escopo | auditoria | ações permitidas
```

### Regra de segurança

Nunca criar botão ou ação visual sem capacidade backend segura correspondente.

Se backend só permite listar e promover/revogar Admin, a UI pode enriquecer consulta, filtros, detalhe e auditoria, mas não deve simular capacidades inexistentes.

Separar visualmente:

- **Governança:** OWNER / ADMIN / USER;
- **Perfil operacional:** ADMIN / USUARIO / escopo correspondente.

Não misturar os dois conceitos em um único badge.

---

## 18. Padrão por página do BI

### Home

Objetivo: visão executiva.

- poucos primary KPIs;
- supporting metrics abaixo/ao lado;
- histórico dominante;
- pontos de atenção claros.

### KPIs

Objetivo: aprofundamento analítico.

- métricas mais densas que Home;
- comparação entre dimensões;
- inventário com principal + supporting metrics.

### Supervisores

Objetivo: priorização de carteira.

- ordenar por severidade;
- entity cards consistentes;
- um único status de saúde;
- abrir 360 sem perder contexto.

### Depositantes

Objetivo: seleção + visão 360.

- summary;
- busca;
- lista/tabela;
- status explícito;
- card mobile sem rail redundante.

### Financeiro

Objetivo: resultado vs plano.

- headline metrics primeiro;
- planned/realized na mesma escala;
- cores semânticas coerentes;
- guardrails de dimensão preservados.

### FCA

Objetivo: registro + acompanhamento.

- summary por status;
- workspace de busca/filtro/lista;
- detalhe com causa, plano, progresso e histórico;
- formulários por etapas;
- navegação contextual;
- mobile sem carrossel obrigatório.

### Administração

Objetivo: governança e operação administrativa.

- resumo de usuários/roles;
- busca/filtros;
- lista consistente;
- drawer/modal para detalhes e ações;
- confirmações seguras;
- auditoria progressivamente revelada.

---

## 19. Componentes que devem ser compartilhados

Antes de criar novo componente, verificar se já existe ou se deve virar primitive.

Prioridade de compartilhamento:

- Button;
- Panel;
- PageHeader;
- Badge/StatusBadge;
- SearchField;
- EmptyState;
- Skeleton;
- Toolbar;
- Modal;
- Drawer;
- SummaryCard;
- EntityCard;
- DataList/Table;
- FormSection;
- Timeline;
- ConfirmDialog.

Evitar CSS exclusivo de página para algo que aparece em três ou mais telas.

---

## 20. Anti-padrões proibidos

Não introduzir sem decisão explícita:

- tabela desktop simplesmente comprimida no mobile;
- carrossel horizontal obrigatório para summary cards;
- stepper horizontal obrigatório no mobile;
- status repetido em várias áreas do mesmo card;
- vermelho de marca usado como alerta universal;
- valores CSS arbitrários quando existe token;
- `window.confirm` para operação relevante;
- nova linguagem de card por página;
- botões sem capacidade backend real;
- voltar sempre para rota fixa quando existe contexto;
- conteúdo de auditoria competindo com conteúdo operacional principal;
- dependência Preline/Flowbite/Tailwind adicionada só por estética.

---

## 21. Acessibilidade mínima

Toda mudança deve respeitar:

- contraste adequado;
- `focus-visible`;
- labels/aria-label em controles;
- navegação por teclado;
- status não comunicado apenas por cor;
- headings em ordem lógica;
- área clicável adequada;
- texto alternativo quando houver imagem informativa;
- modal/drawer com foco e fechamento previsíveis quando forem implementados.

---

## 22. Checklist obrigatório antes de PR

### Consistência

- [ ] Usei componentes/tokens existentes antes de criar novos?
- [ ] A página segue a anatomia padrão?
- [ ] O mesmo tipo de informação tem o mesmo componente que nas outras telas?
- [ ] Status e severidade seguem a mesma regra semântica?
- [ ] Não dupliquei informação visual?

### Marca

- [ ] Vermelho Unilog está sendo usado como acento, não como ruído?
- [ ] Tipografia e densidade estão coerentes com o restante do produto?
- [ ] Superfícies permanecem limpas e corporativas?

### UX

- [ ] O CTA principal está evidente?
- [ ] A hierarquia visual corresponde à importância da informação?
- [ ] Há loading/empty/error adequados?
- [ ] A navegação de volta preserva contexto?
- [ ] Ações perigosas possuem confirmação apropriada?

### Mobile

- [ ] Testei desktop, tablet e mobile?
- [ ] Nenhum conteúdo essencial exige scroll horizontal?
- [ ] Tabelas complexas viraram cards/listas?
- [ ] Summary cards estão integralmente visíveis?
- [ ] Steps não exigem arraste?
- [ ] Touch targets estão adequados?
- [ ] Nomes e textos longos quebram sem sobreposição?

### Engenharia

- [ ] Não alterei regra funcional para resolver problema visual?
- [ ] Não criei dependência nova sem decisão arquitetural?
- [ ] CSS específico ficou restrito ao que realmente é específico?
- [ ] Algo repetido em 3+ páginas deveria virar primitive?

---

## 23. Processo para revisar uma página existente

Usar sempre esta sequência:

1. Identificar objetivo principal da página.
2. Listar informação primária, supporting e contextual.
3. Comparar anatomia com esta skill.
4. Identificar componentes exclusivos que deveriam ser compartilhados.
5. Validar desktop.
6. Validar tablet.
7. Validar mobile.
8. Corrigir navegação/contexto.
9. Corrigir loading/empty/error.
10. Só depois fazer micro-polish visual.

Nunca começar por sombra, cor ou radius antes de resolver hierarquia e fluxo.

---

## 24. Regra para evolução do design system

Quando uma solução visual se repetir em três ou mais superfícies:

> parar de replicar CSS e promover o padrão para primitive/tokens compartilhados.

O objetivo final é reduzir progressivamente CSS específico de página e aumentar a reutilização do design system.

Essa consolidação deve acontecer de forma incremental e somente após validar que o padrão é funcional.

---

## 25. Definição de pronto — UI/UX

Uma tela só está visualmente pronta quando:

- parece pertencer ao mesmo produto das demais;
- sua hierarquia é compreensível sem treinamento;
- estados são semânticos e consistentes;
- ações principais são claras;
- desktop, tablet e mobile funcionam sem gestos inesperados;
- não há overflow horizontal obrigatório de informação essencial;
- componentes repetidos seguem a mesma anatomia;
- navegação preserva contexto;
- acessibilidade básica está atendida;
- regras funcionais e segurança permaneceram intactas.

Se qualquer item acima falhar, a tela ainda não está pronta, mesmo que esteja visualmente bonita.
