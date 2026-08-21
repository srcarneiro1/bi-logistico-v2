# Auditoria UI/UX, Filtros e Escopo — 21/08/2026

## Decisões vigentes

- Períodos analíticos são normalizados internamente para `AAAA-MM`.
- Período analítico inicial: mês atual se disponível; senão último mês anterior; senão período mais recente disponível.
- Supervisor e Módulo formam o escopo compartilhado das páginas operacionais e analíticas.
- A FCA mantém período próprio (`fcaPeriodo`) e pode consultar `Todos os meses` sem alterar o período analítico do restante do BI.
- A FCA não duplica filtros de Supervisor/Módulo: esses dois campos continuam seguindo o escopo compartilhado do cabeçalho.
- Contadores de status da FCA são calculados antes do filtro local de status; selecionar um status não recalcula os demais contadores.
- Históricos visuais terminam no período analítico selecionado, evitando mostrar meses posteriores ao contexto.
- Supervisores mostra FCAs pendentes do responsável (aberto, em andamento ou vencido) no período/módulo selecionado.
- Depositante 360 usa o período analítico para KPIs, receita e FCAs relacionados ao cliente.
- Despesas são exibidas apenas no consolidado sem Supervisor/Módulo porque `fDespesa` não possui essas dimensões.
- Substituições são administradas em `Administração > Substituições`.
- Cobertura vigente concede acesso temporário exclusivamente ao par `Supervisor titular + Módulo`, nunca ao módulo isoladamente.
- A autorização de FCA também valida `Supervisor titular + Módulo + vigência` por RLS no Supabase.
- Supervisor que também atua como substituto mantém seu escopo próprio e soma apenas os pares titular/módulo de suas coberturas vigentes.
- Primeiro acesso e recuperação de senha aceitam Supervisor autorizado pela HUB ou substituto ativo com cobertura vigente.
- Formulários e páginas de detalhe não exibem filtros analíticos globais para reduzir ruído e conflito de contexto.

## Independência do projeto

O BI Logístico V2 é uma aplicação independente. O Forecast Planner pode ser usado apenas como referência visual/de design. Assets, componentes e padrões necessários ao BI devem existir dentro do próprio repositório; não devem ser consumidos do Forecast Planner em runtime.

Branding aprovado deve ser replicado em `public/brand` do BI. Logo e favicon utilizados pelo runtime devem apontar para arquivos locais do projeto.

## Fonte de verdade de substituições

Novos substitutos e coberturas são gerenciados no Supabase. `fSubstituicaoSupervisor` permanece somente como legado/fallback e não deve receber novos cadastros.

Coberturas legadas migradas para o Supabase mantêm `legacy_substituicao_id` para rastreabilidade.

## Guardrails de manutenção

- Não alterar o comportamento de `Limpar filtros` sem decisão explícita de produto.
- Não consolidar as camadas CSS enquanto os fluxos funcionais ainda estiverem em estabilização.
- Mudanças de autorização devem preservar o par Supervisor + Módulo de ponta a ponta.
- Alterações pequenas devem permanecer isoladas para facilitar auditoria e reversão.
- Antes de merge, executar `npm test` e `npm run build` quando o ambiente de CI/execução estiver disponível.

## Testes de regressão mínimos

A suíte inicial deve proteger, no mínimo:

1. normalização de competência e seleção do período padrão;
2. independência entre `periodo` analítico e `fcaPeriodo`;
3. cobertura por par Supervisor + Módulo quando módulos homônimos existem em supervisões diferentes;
4. manutenção do escopo próprio quando um supervisor também atua como substituto;
5. autorização de primeiro acesso de substituto somente durante cobertura vigente.
