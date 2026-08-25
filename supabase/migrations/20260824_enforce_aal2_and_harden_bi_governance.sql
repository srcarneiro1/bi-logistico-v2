create or replace function private.is_bi_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    and exists (
      select 1
      from public.app_governance g
      join public.profiles p on p.id = g.user_id
      where g.user_id = (select auth.uid())
        and g.governance_role = 'OWNER'
        and p.ativo = true
    );
$function$;

create or replace function private.is_bi_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    and exists (
      select 1
      from public.app_governance g
      join public.profiles p on p.id = g.user_id
      where g.user_id = (select auth.uid())
        and g.governance_role in ('OWNER','ADMIN')
        and p.ativo = true
    );
$function$;

revoke all on function private.is_bi_owner() from public, anon;
revoke all on function private.is_bi_admin() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_bi_owner() to authenticated;
grant execute on function private.is_bi_admin() to authenticated;

revoke all on table public.app_governance from authenticated;
revoke all on table public.access_governance_audit from authenticated;
grant select, insert, update, delete on table public.app_governance to authenticated;
grant select, insert on table public.access_governance_audit to authenticated;
grant usage, select on sequence public.access_governance_audit_id_seq to authenticated;

drop policy if exists profiles_select_owner_aal2 on public.profiles;
create policy profiles_select_owner_aal2
  on public.profiles for select to authenticated
  using ((select private.is_bi_owner()));

drop policy if exists app_governance_select_self_or_owner on public.app_governance;
create policy app_governance_select_self_or_owner
  on public.app_governance for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_bi_owner()));

drop policy if exists app_governance_owner_insert_admin on public.app_governance;
create policy app_governance_owner_insert_admin
  on public.app_governance for insert to authenticated
  with check ((select private.is_bi_owner()) and governance_role = 'ADMIN' and user_id <> (select auth.uid()));

drop policy if exists app_governance_owner_update_admin on public.app_governance;
create policy app_governance_owner_update_admin
  on public.app_governance for update to authenticated
  using ((select private.is_bi_owner()) and governance_role = 'ADMIN')
  with check ((select private.is_bi_owner()) and governance_role = 'ADMIN');

drop policy if exists app_governance_owner_delete_admin on public.app_governance;
create policy app_governance_owner_delete_admin
  on public.app_governance for delete to authenticated
  using ((select private.is_bi_owner()) and governance_role = 'ADMIN');

drop policy if exists access_governance_audit_owner_select on public.access_governance_audit;
create policy access_governance_audit_owner_select
  on public.access_governance_audit for select to authenticated
  using ((select private.is_bi_owner()));

drop policy if exists access_governance_audit_owner_insert on public.access_governance_audit;
create policy access_governance_audit_owner_insert
  on public.access_governance_audit for insert to authenticated
  with check ((select private.is_bi_owner()) and actor_id = (select auth.uid()));

drop policy if exists supervisor_substituicao_auditoria_admin_select on public.supervisor_substituicao_auditoria;
create policy supervisor_substituicao_auditoria_admin_select
  on public.supervisor_substituicao_auditoria for select to authenticated
  using ((select private.is_bi_admin()));

drop policy if exists supervisor_substituicao_auditoria_trigger_insert on public.supervisor_substituicao_auditoria;
create policy supervisor_substituicao_auditoria_trigger_insert
  on public.supervisor_substituicao_auditoria for insert to authenticated
  with check ((select private.is_bi_admin()) and current_setting('bi.audit_context', true) = 'trigger');

drop policy if exists supervisor_substituicoes_admin_insert on public.supervisor_substituicoes;
create policy supervisor_substituicoes_admin_insert
  on public.supervisor_substituicoes for insert to authenticated
  with check ((select private.is_bi_admin()));

drop policy if exists supervisor_substituicoes_admin_select on public.supervisor_substituicoes;
create policy supervisor_substituicoes_admin_select
  on public.supervisor_substituicoes for select to authenticated
  using ((select private.is_bi_admin()));

drop policy if exists supervisor_substituicoes_admin_update on public.supervisor_substituicoes;
create policy supervisor_substituicoes_admin_update
  on public.supervisor_substituicoes for update to authenticated
  using ((select private.is_bi_admin()))
  with check ((select private.is_bi_admin()));

drop policy if exists supervisor_substitutos_admin_insert on public.supervisor_substitutos;
create policy supervisor_substitutos_admin_insert
  on public.supervisor_substitutos for insert to authenticated
  with check ((select private.is_bi_admin()));

drop policy if exists supervisor_substitutos_admin_select on public.supervisor_substitutos;
create policy supervisor_substitutos_admin_select
  on public.supervisor_substitutos for select to authenticated
  using ((select private.is_bi_admin()));

drop policy if exists supervisor_substitutos_admin_update on public.supervisor_substitutos;
create policy supervisor_substitutos_admin_update
  on public.supervisor_substitutos for update to authenticated
  using ((select private.is_bi_admin()))
  with check ((select private.is_bi_admin()));

create or replace function public.list_bi_access_users()
returns table (
  user_id uuid,
  email text,
  nome text,
  ativo boolean,
  perfil_operacional text,
  governance_role text
)
language sql
stable
security invoker
set search_path = ''
as $function$
  select
    p.id,
    p.email,
    p.nome,
    p.ativo,
    p.perfil,
    coalesce(g.governance_role, 'USER')
  from public.profiles p
  left join public.app_governance g on g.user_id = p.id
  where (select private.is_bi_owner())
  order by case coalesce(g.governance_role,'USER') when 'OWNER' then 0 when 'ADMIN' then 1 else 2 end, p.nome;
$function$;

create or replace function public.set_bi_admin_role(p_target_id uuid, p_make_admin boolean)
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_actor_email text;
  v_previous_role text;
  v_target_exists boolean;
begin
  if not (select private.is_bi_owner()) then
    raise exception 'OWNER_REQUIRED';
  end if;

  select email into v_actor_email from public.profiles where id = (select auth.uid());
  select exists(select 1 from public.profiles where id = p_target_id) into v_target_exists;
  if not v_target_exists then
    raise exception 'TARGET_NOT_FOUND';
  end if;

  select governance_role into v_previous_role
  from public.app_governance
  where user_id = p_target_id;

  if v_previous_role = 'OWNER' then
    raise exception 'OWNER_IMMUTABLE';
  end if;

  if p_make_admin then
    insert into public.app_governance(user_id, governance_role, created_by, updated_at)
    values (p_target_id, 'ADMIN', (select auth.uid()), now())
    on conflict (user_id) do update
      set governance_role = 'ADMIN', updated_at = now();
  else
    delete from public.app_governance
    where user_id = p_target_id and governance_role = 'ADMIN';
  end if;

  insert into public.access_governance_audit(
    actor_id, actor_email, target_id, action, previous_role, new_role
  ) values (
    (select auth.uid()),
    v_actor_email,
    p_target_id,
    case when p_make_admin then 'GRANT_ADMIN' else 'REVOKE_ADMIN' end,
    coalesce(v_previous_role,'USER'),
    case when p_make_admin then 'ADMIN' else 'USER' end
  );
end;
$function$;

revoke all on function public.list_bi_access_users() from public, anon;
revoke all on function public.set_bi_admin_role(uuid, boolean) from public, anon;
grant execute on function public.list_bi_access_users() to authenticated;
grant execute on function public.set_bi_admin_role(uuid, boolean) to authenticated;

drop function if exists public.is_bi_owner();
drop function if exists public.is_bi_admin();
