# BI Logístico V2 — Revisão de status FCA e selector boundaries

Data: 2026-08-27

## 1. Motivo da revisão

No Supervisor 360, o badge `Vencido` exibido em `FCAs abertos no período` aparecia visualmente mais apagado do que o padrão FCA já adotado na listagem e no detalhe.

O `StatusBadge` estava correto. A regressão vinha do owner local de Supervisores:

```css
.supervisor-fca-list span { ... }
```

Esse seletor alcançava também o `<span class="ui-badge ui-badge-danger ui-status-badge">` produzido pelo primitive `StatusBadge`.

O mesmo defeito existia em Depositantes:

```css
.fca-mini-list span { ... }
```

Portanto, o problema era um vazamento de seletor descendente para dentro de um primitive compartilhado, não uma falha do primitive.

## 2. Regra nova de consistência

Um owner de página/domínio **não pode** usar um seletor genérico de descendência (`span`, `strong`, `small`, `button`, etc.) quando o container pode hospedar um primitive compartilhado.

Preferências, em ordem:

1. classe semântica explícita do conteúdo;
2. filho direto (`>`), quando a estrutura é fechada e deliberada;
3. primitive compartilhado com owner próprio;
4. seletor explícito do primitive apenas quando o contexto precisa ajustar geometria/densidade sem redefinir semântica.

Exemplo permitido:

```css
.responsive-data-table .ui-status-badge {
  min-height: 24px;
  padding: 4px 8px;
  font-size: 9px;
}
```

Esse caso apenas compacta o badge em tabela. Não troca `danger`, `warning`, `success` ou `neutral`.

Exemplo proibido:

```css
.algum-container span {
  color: var(--text-muted);
}
```

quando `.algum-container` pode conter `Badge`, `Chip`, Material Symbols ou outro primitive baseado em `span`.

Não corrigir esse tipo de problema aumentando especificidade do primitive ou adicionando `!important`. Isso apenas mascara a origem.

## 3. Status FCA — fonte única

Antes desta revisão, quatro superfícies repetiam localmente a regra:

```ts
isFcaOverdue(fca) ? 'VENCIDO' : deriveFcaStatus(fca)
```

Superfícies afetadas:

- FCA — Lista;
- FCA — Detalhe;
- Supervisor 360;
- Depositante 360.

Além de duplicar comportamento, a Lista FCA tinha uma inconsistência: o contador de `Vencidos` separava vencimentos, mas o filtro `Aberto` comparava apenas `deriveFcaStatus()`. Assim um FCA vencido com workflow base `ABERTO` podia ser tratado como vencido na contagem e ainda entrar no filtro de abertos.

A regra passa a ser centralizada em:

```ts
deriveFcaDisplayStatus(fca)
```

Estados exibidos:

- `ABERTO`;
- `EM_ANDAMENTO`;
- `VENCIDO`;
- `CONCLUIDO`;
- `CANCELADO`.

`VENCIDO` é estado de apresentação/prioridade derivado do prazo. `deriveFcaStatus()` continua representando o workflow base do registro.

Contagem, filtro, listagem, detalhe e cards compactos devem usar `deriveFcaDisplayStatus()` quando a pergunta for: **qual status o usuário deve ver?**

## 4. FCA compacto compartilhado

Supervisor e Depositante possuíam duas implementações quase idênticas de mini-lista FCA:

- `.supervisor-fca-list`;
- `.fca-mini-list`.

Ambas foram substituídas pelo componente compartilhado:

`src/components/FcaCompactList.tsx`

Owner visual:

`src/record-lists.css`

Classes explícitas:

- `.fca-compact-list`;
- `.fca-compact-copy`;
- `.fca-compact-meta`.

O `StatusBadge` permanece um primitive independente dentro do item e não é estilizado por seletores genéricos do conteúdo.

No Supervisor, o título do painel passa de `FCAs abertos no período` para `FCAs pendentes no período`, porque o conjunto contém `ABERTO`, `EM_ANDAMENTO` e `VENCIDO`.

## 5. Vazamentos adicionais encontrados no scanner

### Shell — perfil do usuário

Antes:

```css
.sidebar-user span { ... }
```

O botão de sair contém um `<span class="material-symbols-rounded">`, portanto o seletor também podia atingir o ícone.

Direção corrigida:

```css
.sidebar-user-copy > span { ... }
.sidebar-user-copy > strong { ... }
.sidebar-user > button { ... }
```

### Analytics warning

Antes:

```css
.analytics-warning span { ... }
```

O ícone informativo também é um `span.material-symbols-rounded`. O resultado visual ficava correto por uma regra mais específica do ícone, mas isso era uma dependência de cascata desnecessária.

Direção corrigida:

```css
.analytics-warning > div > strong { ... }
.analytics-warning > div > span { ... }
```

### FCA — metadados e stepper

Seletores internos foram restringidos para filhos diretos onde a estrutura é fechada, evitando alcançar Material Symbols ou futuros componentes aninhados sem intenção.

## 6. Scanner — classificação das principais camadas

| Camada | Resultado |
|---|---|
| `ui-foundations.css` | Descendência pertence aos próprios primitives; válida. |
| `detail-primitives.css` | Descendência interna de `DetailHero/DetailMetrics`; válida. |
| `SimpleLineChart.css` | Owner único do chart; descendência interna válida. |
| `accessibility-interactions.css` | Global por definição e explicitamente direcionada a estados/controles; válida. |
| `record-lists.css` | Ajuste contextual explícito de `ui-status-badge` permitido somente para densidade; tones continuam no primitive. |
| `supervisors-discovery.css` | Vazamento FCA removido; conteúdo de cards restrito com filhos diretos onde aplicável. |
| `depositors-discovery.css` | Vazamento FCA removido; mini-lista local eliminada. |
| `planner-shell.css` | Vazamento do perfil para Material Symbols removido. |
| `sections-feedback.css` | Vazamento do texto de `analytics-warning` para o ícone removido. |
| `fca-workspace.css` | Seletores de metadados/stepper restringidos para a estrutura que realmente controlam. |

Não foram identificadas, nesta revisão, novas sobreposições de página alterando os tones de `Badge`, `Chip`, `DetailHero`, `DetailMetrics`, `EmptyState`, `ContextNotice` ou `SimpleLineChart` fora dos casos corrigidos acima.

## 7. Regra permanente para futuras revisões

A auditoria UI/UX deve verificar não só:

- aliases mortos;
- `!important`;
- owners duplicados;
- primitives paralelos;

mas também **selector boundaries**.

Checklist obrigatório:

1. o container hospeda algum primitive compartilhado?
2. existe seletor genérico de descendência abaixo dele?
3. esse seletor pode atingir tags internas do primitive?
4. o resultado está correto porque a cascata realmente é correta, ou porque outra regra mais específica está vencendo por acaso?
5. a correção pode ser feita no conteúdo/owner em vez de blindar o primitive?

Princípio final:

> Primitive não deve precisar se defender de CSS impreciso da página. O owner local deve respeitar a fronteira do primitive.
