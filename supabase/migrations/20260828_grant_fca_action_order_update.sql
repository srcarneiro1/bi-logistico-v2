-- editar_fca_com_acoes() é SECURITY INVOKER e reordena fca_acoes durante a edição.
-- authenticated já possui UPDATE apenas nas colunas editáveis da ação, mas faltava
-- a coluna ordem, fazendo a RPC falhar antes da avaliação das policies RLS.
--
-- Mantemos o hardening por coluna: não conceder UPDATE geral na tabela.

grant update (ordem) on table public.fca_acoes to authenticated;
