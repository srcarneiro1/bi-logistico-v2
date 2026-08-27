# BI Logístico V2 — Decisão de layout da Home

Data: 2026-08-27

## Contexto

Na versão web da Home, a soma dos painéis secundários `Receita do período` + `Resumo da seleção` estava visualmente mais alta do que o painel principal `Evolução dos KPIs`.

O painel de evolução é a superfície analítica dominante da linha. Os painéis de receita e escopo são conteúdo de apoio.

## Decisão

Não aumentar artificialmente a altura do gráfico para acompanhar a coluna secundária.

A correção deve ocorrer na coluna de apoio e apenas no desktop largo, reduzindo densidade interna onde houver excesso de padding/altura, sem alterar os primitives globais.

Regra:

- `Evolução dos KPIs` permanece como painel visual dominante;
- `Receita do período` e `Resumo da seleção` devem ser compactos no desktop;
- não alterar `Panel` ou `PanelHeader` global para resolver esta página;
- não criar `min-height` artificial no gráfico;
- não esticar o SVG/chart apenas para preencher espaço;
- tablet e mobile mantêm a composição responsiva já validada;
- ajustes locais devem ficar em `home-dashboard.css`, owner da Home.

## Implementação

Em viewport acima de 1020 px:

- reduz padding vertical da `finance-summary` apenas dentro de `.home-side-stack`;
- reduz margens locais de progress bar e nota financeira;
- reduz min-height/padding dos quatro itens de `.home-scope-grid`;
- mantém o mesmo `PanelHeader`, tipografia, borda, radius, chips e primitives compartilhados.

## Guardrail

Nunca corrigir desequilíbrio entre superfícies aumentando um componente primário sem necessidade funcional. Primeiro identificar se o excesso vem de conteúdo secundário, padding, min-height ou ownership incorreto.

Esta decisão não altera dados, KPIs, filtros, receita, cálculo, Supabase, HUB ou regras de negócio.
