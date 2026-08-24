# Governança de acesso — BI Logístico

## Papéis

A aplicação separa duas dimensões de autorização:

1. **Perfil operacional da HUB** (`ADMIN | USUARIO`): define escopo analítico e operacional.
2. **Governança da aplicação** (`OWNER | ADMIN | USER`): define autoridade administrativa sobre recursos do BI.

Essas dimensões não devem ser inferidas uma da outra.

## Owner

- Existe exatamente um `OWNER` por ambiente.
- O Owner é permanente enquanto o ambiente estiver ativo.
- O Owner não pode ser rebaixado ou removido pela interface.
- O vínculo técnico é feito pelo UUID do usuário no Supabase, nunca por nome ou e-mail em regras de autorização.
- O bootstrap inicial do Owner é dado de ambiente e não fica hardcoded em migration.

## Administradores delegados

- Somente o Owner pode conceder ou revogar `ADMIN`.
- Um Admin delegado pode administrar recursos autorizados do BI, mas não pode promover/revogar outros administradores nem alterar o Owner.
- Tornar alguém `ADMIN` não altera seu `PerfilAcesso` da HUB nem amplia automaticamente seu escopo analítico.
- Usuário inativo não exerce autoridade administrativa, mesmo que exista registro de governança.

## Banco de dados

- `public.app_governance`: registra apenas `OWNER` e `ADMIN`; ausência de linha significa `USER`.
- `public.access_governance_audit`: registra promoções e revogações administrativas.
- `public.is_bi_owner()`: verifica Owner ativo.
- `public.is_bi_admin()`: verifica Owner/Admin ativo.
- `public.set_bi_admin_role(...)`: única operação cliente permitida para promoção/revogação e exige Owner.
- Clientes não recebem `INSERT`, `UPDATE` ou `DELETE` direto em `app_governance`.

## MFA

O P1A não exige AAL2 ainda. O enforcement de MFA/TOTP será ativado somente depois que o fluxo de cadastro e desafio estiver implementado e validado, para evitar lockout do Owner.
