# BI Logístico V2 — Unilog

Aplicação nova construída em paralelo ao BI/FCA legado. O projeto não altera o deployment atual, a HUB oficial antiga nem o FCA legado.

## Arquitetura

- React + TypeScript + Vite: frontend
- Cloudflare Pages + Pages Functions: hospedagem e backend
- Supabase Auth: autenticação
- Supabase PostgreSQL: `profiles`, `fca`, `fca_acoes`, `auditoria`
- `HUB_Dados_Unilog_REVISAO_PROPOSTA`: fonte de supervisores, módulos, depositantes, indicadores e substituições
- Apps Script `apps-script/HubApi.gs`: ponte somente leitura entre Cloudflare e a nova HUB

A ponte Apps Script substitui a necessidade de Google Cloud / Service Account.

## Fluxo de autenticação

1. O usuário informa o e-mail no BI V2.
2. Supabase Auth envia o link de acesso.
3. Após autenticação, o frontend chama `/api/hub/bootstrap` com o JWT.
4. A Pages Function valida o JWT no Supabase Auth.
5. A Pages Function chama a ponte da HUB com um token secreto.
6. O backend procura o e-mail em `dSupervisores` e lê `PerfilAcesso`.
7. `ADMIN` recebe visão global; `USUARIO` recebe apenas seu escopo operacional/substituições.
8. O backend sincroniza o registro técnico em `public.profiles`.

`Ativo` em `dSupervisores` não é usado como permissão de acesso. A autorização do BI é `PerfilAcesso`.

## Estrutura FCA

- `fca`: cabeçalho e fotografia do contexto no momento do lançamento.
- `fca_acoes`: ações 1:N, sem limite fixo de P1/P2/P3.
- `auditoria`: histórico automático de alterações.
- RPC `criar_fca_com_acoes`: grava FCA + ações em uma única transação.

## Publicação no Cloudflare Pages

Configuração de build:

- Branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: vazio

Os valores públicos do Supabase estão em `.env.production`.

No Cloudflare, em **Settings > Variables and Secrets**, configure para Production e Preview:

- `SUPABASE_SECRET_KEY` — Secret
- `HUB_API_URL` — variável (URL `/exec` do Apps Script)
- `HUB_API_TOKEN` — Secret

Nunca coloque `SUPABASE_SECRET_KEY` ou `HUB_API_TOKEN` no frontend ou no GitHub.

## Configurar a ponte da HUB (sem GCP)

1. Abra `HUB_Dados_Unilog_REVISAO_PROPOSTA`.
2. Vá em **Extensões > Apps Script**.
3. Copie o conteúdo de `apps-script/HubApi.gs` para `Code.gs`.
4. Em **Configurações do projeto > Propriedades do script**, crie `HUB_API_TOKEN` com um token forte.
5. Vá em **Implantar > Nova implantação > Aplicativo da Web**.
6. Execute como **você** e permita acesso a **qualquer pessoa**.
7. Copie a URL terminada em `/exec` para `HUB_API_URL` no Cloudflare.
8. Cadastre o mesmo token no Cloudflare como `HUB_API_TOKEN`.

Essa ponte é somente leitura e usa cache de 120 segundos. Ela lê apenas:

- `dSupervisores`
- `dSupervisorModulo`
- `dDepositantes`
- `dIndicadores`
- `fSubstituicaoSupervisor`

## Supabase Auth

Depois do primeiro deploy do Cloudflare, inclua o domínio `*.pages.dev` efetivamente criado (e futuramente o domínio definitivo) em **Supabase > Authentication > URL Configuration > Redirect URLs**.

## Desenvolvimento local

```bash
npm install
npm run build
npm run dev
```

Para Pages Functions localmente, copie `.dev.vars.example` para `.dev.vars` e preencha os três valores privados.
