# BI Logístico V2 — Segurança de acesso

## Princípio

Autenticação e autorização são controles distintos. Uma sessão Supabase válida identifica o usuário, mas não libera HUB, FCA, substituições ou dados analíticos por si só.

## Modelo de acesso

- O frontend usa apenas URL + publishable key do Supabase.
- `SUPABASE_SECRET_KEY` é exclusivamente server-side em Cloudflare Pages Functions.
- O bootstrap da HUB exige bearer token válido e resolve o usuário no servidor antes de devolver qualquer dado.
- O acesso operacional é validado contra profile/HUB/cobertura; uma conta Auth isolada não recebe automaticamente acesso ao BI.
- Todas as tabelas de aplicação em `public` usam RLS.
- `anon` não recebe privilégios nas tabelas de aplicação.
- FCA respeita perfil ativo, titularidade, substituição e cobertura exata Supervisor + Módulo.
- Administração de substituições é restrita por policies administrativas/self-select específicas.
- `TRUNCATE`, `REFERENCES` e `TRIGGER` não são concedidos aos roles de aplicação.
- Novos objetos criados por migrations do papel `postgres` seguem deny-by-default; grants precisam ser explícitos e acompanhados da RLS correspondente.

## Configuração obrigatória no Supabase Auth

No projeto de produção:

1. Desabilitar criação pública de novos usuários (`Allow new users to sign up`).
2. Manter apenas providers realmente utilizados.
3. Configurar senha forte (mínimo recomendado: 12 caracteres).
4. Ativar proteção contra senhas vazadas quando o plano permitir.
5. Revisar Site URL e Redirect URLs; não permitir destinos desnecessários de desenvolvimento em produção.
6. Próxima camada: MFA/TOTP e enforcement de AAL2, inicialmente para administradores.

## Segredos

- Nunca publicar `SUPABASE_SECRET_KEY`, service-role, HUB token ou outros secrets no bundle Vite.
- Secrets do runtime devem permanecer em Cloudflare Variables and Secrets no ambiente correto (Production/Preview).
- Publishable keys podem existir no cliente; segurança não deve depender de escondê-las.

## Regra de desenvolvimento

Uma tela de login não é uma fronteira de segurança. Toda leitura/escrita precisa continuar segura se o usuário ignorar a UI e chamar diretamente REST/RPC/Functions.
