-- Defense in depth: RLS governs row access, but TRUNCATE does not pass through RLS.
-- Anonymous sessions must not have any table privilege in the BI application schema.

revoke all on table
  public.auditoria,
  public.fca,
  public.fca_acoes,
  public.profiles,
  public.supervisor_substituicao_auditoria,
  public.supervisor_substituicoes,
  public.supervisor_substitutos
from anon;

-- Authenticated sessions keep only the DML explicitly required by the application
-- and governed by the existing RLS policies.
revoke truncate, references, trigger on table
  public.auditoria,
  public.fca,
  public.fca_acoes,
  public.profiles,
  public.supervisor_substituicao_auditoria,
  public.supervisor_substituicoes,
  public.supervisor_substitutos
from authenticated;
