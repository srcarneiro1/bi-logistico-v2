# BI Logístico V2 — Regra de agregação do Inventário

## Decisão confirmada em 2026-08-27

A seção `KPIs > Composição do indicador` deve distinguir o consolidado oficial do inventário da média granular por depositante.

### Fonte oficial global

Quando o usuário é `ADMIN` e não existe filtro de Supervisor nem de Módulo, usar `fKPI_Inventario` para:

- Prazo;
- Endereço;
- Unidade;
- SKU;
- Pontuação Total.

A `fKPI_Geral` permanece a fonte oficial do KPI principal `Inventário` no consolidado global.

Exemplo confirmado para `ago./2026`:

| Indicador | Valor oficial |
| --- | ---: |
| Prazo | 76,38% |
| Endereço | 91,59% |
| Unidade | 99,81% |
| SKU | 58,97% |
| Pontuação Total | 84,45% |
| fKPI_Geral / Inventário | 84,45% |

A pontuação oficial fecha com a regra ponderada normalizada pelas metas:

```text
30% × (Prazo / 95%)
+ 30% × (Endereço / 99%)
+ 20% × (Unidade / 99%)
+ 20% × (SKU / 95%)
```

Para agosto/2026, o resultado é aproximadamente 84,45%.

## Por que a média por depositante não pode substituir o consolidado oficial

`fKPI_InventarioDepositante` traz percentuais por cliente e um `Total_Pct` já calculado por linha. A média simples dessas linhas em agosto/2026 resultava em aproximadamente:

- Prazo: 74,55%;
- Endereço: 94,82%;
- Unidade: 99,44%;
- SKU: 91,16%;
- média de `Total_Pct`: 91,53%.

Esses valores são matematicamente válidos como **média de percentuais dos depositantes**, mas não representam o KPI consolidado oficial. Um cliente pequeno e um cliente grande recebem o mesmo peso em uma média simples, enquanto a fonte oficial consolida o indicador segundo a regra operacional de origem.

Portanto, 91,53% não deve ser exibido como `Pontuação do período` no escopo global.

## Regra no código

`inventoryAggregate(hub, filters)` passa a operar em dois modos:

### `official`

Condições:

- perfil HUB `ADMIN`;
- sem filtro de Supervisor;
- sem filtro de Módulo;
- `fKPI_Inventario` disponível.

Resultado:

- dimensões e Pontuação Total vêm de `fKPI_Inventario` no período selecionado;
- se `Pontuação Total` não estiver disponível, o total pode cair para o KPI global `Inventário` de `fKPI_Geral` no mesmo período.

### `depositante-average`

Usado quando existe recorte por Supervisor/Módulo ou quando o consolidado oficial não está disponível.

Resultado:

- mantém temporariamente a média granular de `fKPI_InventarioDepositante`;
- a interface identifica explicitamente esse modo como `Média do escopo`.

## Limitação conhecida

A média granular por Supervisor/Módulo **não deve ser tratada como equivalente metodológico ao consolidado oficial**.

Para reproduzir o KPI oficial em qualquer escopo, a fonte granular precisa disponibilizar os numeradores/denominadores (ou outra granularidade de cálculo oficial) usados em Prazo, Endereço, Unidade e SKU. Sem esses componentes, não é seguro inferir um consolidado oficial apenas pela média de percentuais dos depositantes.

Não inventar pesos adicionais nem recalcular o KPI por Supervisor/Módulo sem essa base.

## Regra histórica de alocação

Para análises por mês, `fKPI_InventarioDepositante` deve preservar em cada linha o `SupervisorID` e `ModuloID` válidos naquele período. Mudanças futuras de supervisor no cadastro não devem reescrever o histórico.
