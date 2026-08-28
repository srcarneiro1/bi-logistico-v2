# BI Logístico V2 — Incidente de escopo temporal inicial

Data: 2026-08-28

## Sintoma observado

Usuários operacionais relataram dados incoerentes logo após entrar no BI:

- Dimas via BAOBÁ B2B repetida em `Pontos de atenção`, com valores de competências diferentes;
- Alex, com o topo indicando `ago 2026`, via CELLERA FARMA com Produção/Recebimento de meses antigos;
- no caso de Alex, o chip já indicava `3 alertas`, mas a lista visual continha mais linhas e valores históricos.

## Verificação na HUB

A HUB revisada está coerente para agosto/2026.

### Dimas — SupervisorID 334294

`fKPI_Operacional` em ago./2026:

- BAOBÁ B2B: Produção 33,62%; Recebimento 100,00%;
- BAOBÁ B2C: Produção 99,73%; Recebimento 67,70%;
- BEAUTY HUB ES: Produção 70,72%; Recebimento 100,00%;
- BTC B2B: Produção 74,59%; Recebimento 100,00%;
- FOREVER: Produção 95,74%; Recebimento 100,00%;
- LOLA: Produção 91,86%; Recebimento 100,00%.

`dDepositantes` não contém BAOBÁ B2B duplicada.

### Alex — SupervisorID 300068

`fKPI_Operacional` em ago./2026:

- BIOCHIMICO: Produção 99,61%; Recebimento 100,00%;
- CELLERA CONSUMO: Produção 96,04%; Recebimento 100,00%;
- CELLERA FARMA: Produção 99,15%; Recebimento 100,00%;
- SERVIER DISTR: Produção 100,00%; Recebimento 100,00%;
- SERVIER IMPOR: Produção 100,00%; Recebimento 100,00%.

Os valores incorretos vistos no print pertencem ao histórico:

- CELLERA FARMA 67,55% = abr./2025;
- CELLERA FARMA 68,39% / Recebimento 96,43% = mai./2025.

Logo, a HUB não estava fornecendo agosto com esses valores; o frontend estava exibindo resíduos de competências anteriores.

## Causa raiz 1 — período visual antes do período real

O estado global era iniciado com:

```ts
periodo: ''
```

Depois que a HUB era carregada, `App` publicava `hub` para as páginas e somente em um `useEffect` posterior executava `defaultPeriod(hub)`.

Nesse primeiro render:

- `filters.periodo === ''`;
- `scoped()` interpreta período vazio como ausência de filtro temporal;
- as páginas podiam processar todo o histórico;
- o `<select>` de período não possui opção vazia, então o navegador já mostrava visualmente o primeiro `<option>` disponível (`ago 2026`).

Assim, o usuário via `ago 2026` no controle enquanto o estado efetivo ainda significava `todos os períodos`.

## Causa raiz 2 — chave React insuficiente em Pontos de atenção

A Home renderizava os alertas com:

```tsx
key={r.cnpj}
```

No estado transitório com vários meses, o mesmo CNPJ aparecia repetido. Isso produzia chaves React duplicadas.

Quando o `useEffect` finalmente aplicava agosto:

- o total/chip era recalculado corretamente;
- a reconciliação da lista podia manter/reaproveitar nós históricos de forma incorreta devido às chaves duplicadas;
- por isso foi possível observar `3 alertas` no cabeçalho e, ao mesmo tempo, mais de três linhas antigas na lista.

## Correção

### Estado temporal

`refreshHub()` passa a:

1. buscar `nextHub`;
2. resolver o período válido para esse payload com `resolvePeriodForHub()`;
3. atualizar `filters.periodo` antes de publicar `nextHub`;
4. somente então liberar a HUB para renderização.

O antigo `useEffect` que preenchia o período após o primeiro render foi removido.

`resolvePeriodForHub()` também valida um período já existente. Se ele não existir na nova HUB, usa `defaultPeriod(nextHub)`.

A regra fica centralizada em `App`, que é o owner do estado global de filtros. Não foi criado filtro corretivo dentro de Home, KPIs, Supervisores ou Depositantes.

### Identidade de alerta

A chave da linha passa a representar a identidade real da fact row:

```text
periodo + CNPJ + supervisorId + moduloId
```

Isso é hardening de reconciliação, não substituto do filtro temporal.

## Segurança / autorização

A investigação também validou:

- Dimas está cadastrado como `USUARIO`, SupervisorID `334294`;
- Alex está cadastrado como `USUARIO`, SupervisorID `300068`;
- a estrutura atual de `dSupervisores` mantém `FotoURL`, `Ativo` e `PerfilAcesso` nas posições esperadas;
- o backend `buildHubBootstrap()` filtra facts por `SupervisorID`/Módulo antes de responder ao usuário operacional;
- `/api/hub/bootstrap` não mantém cache de payload por usuário.

Não há evidência neste incidente de vazamento de autorização entre usuários.

## Critério de validação

Ao abrir o BI em uma nova sessão:

1. o período visual e o período efetivo devem ser iguais desde o primeiro render analítico;
2. nenhuma tela deve processar histórico como escopo corrente apenas porque o período ainda não foi inicializado;
3. Alex em ago./2026 não deve ver CELLERA FARMA com 67,55%, 68,39% ou Recebimento 96,43%;
4. Dimas em ago./2026 não deve ver múltiplas linhas de BAOBÁ B2B de competências anteriores;
5. o total de alertas deve corresponder às linhas efetivamente renderizadas;
6. mudar manualmente o período depois do carregamento continua funcionando normalmente.

## Regra permanente

Filtros globais obrigatórios não podem ser inicializados visualmente depois que as páginas analíticas já foram publicadas.

Se um valor é necessário para definir o escopo de dados, ele deve estar resolvido antes do primeiro render do conteúdo analítico. O UI control nunca pode mostrar implicitamente um valor diferente do estado que governa a consulta.