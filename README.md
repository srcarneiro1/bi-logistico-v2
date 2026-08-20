# BI Logístico V2 — Unilog

Aplicação construída em paralelo ao BI/FCA legado. O projeto não altera a HUB oficial antiga nem o deployment legado.

## Arquitetura

- React + TypeScript + Vite: frontend
- Cloudflare Pages + Pages Functions: hospedagem e backend
- Supabase Auth: autenticação por e-mail e senha
- Supabase PostgreSQL: perfis, FCA, ações, auditoria e gestão de substituições
- `HUB_Dados_Unilog_REVISAO_PROPOSTA`: fonte de verdade dos cadastros operacionais e fatos analíticos
- Apps Script `apps-script/HubApi.gs`: ponte somente leitura entre Cloudflare e a HUB revisada

A ponte Apps Script substitui a necessidade de Google Cloud / Service Account.

## Fontes de verdade

### Google Sheets / HUB revisada

Continua sendo a fonte de:

- supervisores;
- supervisor x módulo;
- depositantes;
- indicadores e metas;
- KPI geral;
- KPI de inventário;
- KPI operacional por depositante;
- inventário por depositante;
- receita;
- despesa.

### Supabase

É a fonte de:

- autenticação e perfil técnico;
- FCA e ações;
- auditoria;
- cadastro de substitutos;
- coberturas/substituições de supervisor.

`fSubstituicaoSupervisor` permanece apenas como histórico legado/fallback de compatibilidade. Novos cadastros e alterações de substituição devem ser feitos pelo BI V2 em **Administração > Substituições**. Não manter duas fontes de escrita para cobertura.

## Fluxo de autenticação e autorização

1. O usuário entra com e-mail e senha pelo Supabase Auth.
2. O frontend chama `/api/hub/bootstrap` com o JWT.
3. A Pages Function valida o JWT.
4. O backend consulta a HUB e os dados gerenciados de substituição no Supabase.
5. Usuário cadastrado em `dSupervisores` recebe seu perfil `ADMIN` ou `USUARIO`.
6. Um substituto que não esteja em `dSupervisores` também pode entrar quando seu e-mail estiver associado a uma cobertura vigente.
7. A cobertura libera apenas o supervisor titular/módulo autorizado e somente entre `DataInicio` e `DataFim`.
8. O backend sincroniza o registro técnico em `public.profiles`.

`Ativo` em `dSupervisores` representa situação operacional; a autorização do BI é `PerfilAcesso`.

## Estrutura FCA

- `fca`: cabeçalho e fotografia do contexto no momento do lançamento.
- `fca_acoes`: ações 1:N, sem limite fixo.
- `auditoria`: histórico automático de alterações.
- RPC `criar_fca_com_acoes`: grava FCA + ações em uma transação.
- RPC `editar_fca_com_acoes`: atualiza FCA + ações em uma transação; ações removidas são canceladas, não apagadas.

Os FCAs legados foram migrados preservando `legacy_fca_id` para rastreabilidade.

## Filtros globais

Período, Supervisor e Módulo compõem o escopo analítico compartilhado entre Visão Geral, KPIs, Supervisores, Depositantes, Financeiro e FCA.

A abertura padrão usa:

1. mês atual, se existir na base;
2. caso contrário, o mês mais recente anterior ao atual;
3. por último, o período mais recente disponível.

O período é normalizado internamente para `AAAA-MM` para evitar divergência entre formatos como `ago 2026` e `ago/2026`.

Despesas são uma exceção conhecida: `fDespesa` não possui Supervisor/Módulo. Por isso o BI não combina despesas consolidadas com receita filtrada por essas dimensões.

## Publicação no Cloudflare Pages

- Branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: vazio

No Cloudflare, em **Settings > Variables and Secrets**, configure para Production e Preview:

- `SUPABASE_SECRET_KEY` — Secret
- `HUB_API_URL` — URL `/exec` do Apps Script
- `HUB_API_TOKEN` — Secret

Nunca coloque `SUPABASE_SECRET_KEY` ou `HUB_API_TOKEN` no frontend ou no GitHub.

## Ponte da HUB

A implantação do Apps Script é somente leitura, usa cache e expõe os cadastros/fatos necessários ao BI. A gestão de FCA e substituições não escreve na planilha.

## Desenvolvimento local

```bash
npm install
npm run build
npm run dev
```
