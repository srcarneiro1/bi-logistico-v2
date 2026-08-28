# BI Logístico V2 — Incidente de permissão ao editar ações FCA

Data: 2026-08-28

## Sintoma

Ao editar um FCA e concluir uma ação, o usuário recebia:

`permission denied for table fca_acoes`

O erro apareceu após a correção de contexto histórico do FCA, quando o formulário finalmente conseguiu chegar à RPC `editar_fca_com_acoes()`.

## Causa raiz

A RPC `public.editar_fca_com_acoes` é `SECURITY INVOKER`, portanto executa com os privilégios SQL do usuário autenticado e continua sujeita às policies RLS.

O hardening do banco já usa privilégios de `UPDATE` por coluna. Em `public.fca_acoes`, `authenticated` podia atualizar:

- `acao`;
- `responsavel`;
- `prazo`;
- `status`;
- `alterado_em`;
- `alterado_por`.

Porém a RPC também reordena as ações durante a edição:

```sql
update public.fca_acoes
set ordem = ordem + 20000
where fca_id = p_fca_id;
```

E posteriormente grava a nova sequência em `ordem`.

A coluna `ordem` não estava incluída nos grants de `UPDATE` do papel `authenticated`. O PostgreSQL bloqueava a instrução antes da avaliação da policy RLS e retornava a mensagem genérica `permission denied for table fca_acoes`.

## Correção

Foi aplicada a migration:

`grant_fca_action_order_update`

Com apenas:

```sql
grant update (ordem) on table public.fca_acoes to authenticated;
```

A migration correspondente no repositório é:

`supabase/migrations/20260828_grant_fca_action_order_update.sql`

## Segurança preservada

Não foi concedido `UPDATE` geral em `public.fca_acoes`.

Validação pós-migration:

- `authenticated` pode `UPDATE(ordem)`;
- `authenticated` continua sem `UPDATE` de tabela inteira;
- `SELECT` e `INSERT` permanecem como antes;
- RLS continua decidindo quais linhas de `fca_acoes` podem ser alteradas;
- `editar_fca_com_acoes` permanece `SECURITY INVOKER`.

Não transformar essa RPC em `SECURITY DEFINER` sem uma revisão explícita da autorização interna da função. No desenho atual, a RLS é parte da autorização fina do fluxo FCA.

## Regra permanente

Ao usar grants de `UPDATE` por coluna com RPCs `SECURITY INVOKER`, toda coluna escrita internamente pela função deve estar explicitamente incluída nos privilégios necessários. A revisão deve considerar não apenas os campos visíveis no formulário, mas também colunas técnicas manipuladas pela RPC, como `ordem`.
