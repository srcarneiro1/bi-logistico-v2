# Auditoria UI/UX e Filtros — 20/08/2026

## Decisões implementadas

- Períodos são normalizados internamente para `AAAA-MM`.
- Período inicial: mês atual se disponível; senão último mês anterior; senão período mais recente disponível.
- Filtros globais de Período, Supervisor e Módulo são o escopo das páginas analíticas.
- FCA não mantém filtros duplicados de Supervisor/Módulo; usa o cabeçalho global.
- Histórico visual termina no período selecionado, evitando mostrar meses posteriores ao contexto.
- Supervisores mostra FCAs pendentes do responsável (aberto, em andamento ou vencido) no período/módulo selecionado.
- Depositante 360 usa o mesmo período para KPIs, receita e FCA relacionados.
- Despesas são exibidas apenas no consolidado sem Supervisor/Módulo porque `fDespesa` não possui essas dimensões.
- Substituições saem da tela operacional de Supervisores e passam para `Administração > Substituições`.
- Cobertura vigente concede acesso temporário ao titular/módulo pelo e-mail do substituto e é validada também por RLS no Supabase.
- Favicon usa o mesmo asset `unilog-favicon-red.svg` do Forecast Planner.
- Formulários e páginas de detalhe não exibem filtros analíticos globais para reduzir ruído e conflito de contexto.

## Fonte de verdade de substituições

Novos substitutos e coberturas são gerenciados no Supabase. `fSubstituicaoSupervisor` permanece somente como legado/fallback e não deve receber novos cadastros.
