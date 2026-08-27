# BI Logístico V2 — Revisão da seleção de Depositante

Data: 2026-08-27

## Motivo

Na aba Depositantes, ao abrir a visão 360 de um cliente, a linha selecionada ficava visualmente pesada: fundo de seleção + `box-shadow` interno contínuo produziam uma caixa marcada em toda a largura da tabela.

## Diagnóstico

A classe `selected-row` era estilizada em `record-lists.css`, embora apenas Depositantes usasse esse estado. Portanto, a camada compartilhada de tabelas estava assumindo uma semântica que não era transversal.

Além disso, `record-lists.css` usava `tr:focus-within` para realçar a linha inteira. Após um clique comum no botão do depositante, o foco permanecia no botão e a linha ganhava novamente uma caixa interna. Portanto, apenas mover `selected-row` para o owner local não resolveria completamente a causa visual.

Isso contrariava dois princípios do projeto:

> anatomia de tabela é compartilhada; seleção de uma entidade pertence ao domínio que possui essa seleção.

> foco estrutural da linha deve acompanhar navegação por teclado/foco visível, não qualquer foco residual de clique por ponteiro.

## Decisão

- `record-lists.css` continua sendo owner apenas da anatomia desktop/mobile das tabelas;
- `selected-row` é removido da camada compartilhada;
- Depositantes passa a usar o estado explícito `depositor-row-selected`;
- a aparência selecionada vive em `depositors-discovery.css`;
- desktop usa somente uma superfície neutra suave, sem rail, outline decorativo ou box-shadow interno;
- mobile mantém seleção perceptível por superfície + borda neutra do record card;
- o realce estrutural compartilhado da linha passa de `:focus-within` para `:has(:focus-visible)`, preservando orientação por teclado sem desenhar uma caixa após clique comum;
- `forced-colors` continua garantindo percepção do estado por outline específico em alta acessibilidade;
- o botão do depositante expõe `aria-expanded` e `aria-controls` para relacionar a seleção à visão 360.

## Regra permanente

Não promover um estado visual para a foundation/owner compartilhado apenas porque ele aparece dentro de um primitive compartilhado.

Antes de colocar um estado em `record-lists.css`, `ui-foundations.css` ou outra camada transversal, verificar:

1. a mesma semântica existe em mais de uma superfície?
2. o comportamento é realmente idêntico?
3. o estado pertence ao primitive ou ao domínio que o utiliza?
4. algum pseudoestado compartilhado (`focus-within`, `hover`, `active`) está criando aparência persistente que deveria existir apenas em `focus-visible`?

Se a resposta for domínio específico, o owner local deve controlar somente esse estado, sem reimplementar a anatomia do primitive.

A correção não altera dados, filtros, métricas, badges, DetailHero, DetailMetrics ou comportamento de abertura/fechamento da visão 360.
