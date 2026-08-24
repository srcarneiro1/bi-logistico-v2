# BI Logístico V2 — Estado Vivo do Projeto

> Fonte operacional de continuidade entre chats. Antes de propor alterações relevantes, ler este arquivo e confirmar o estado atual da `main` e dos PRs abertos no GitHub.

## Comando de retomada

Comando combinado com o usuário: **`retomar BI Logístico`**.

Ao receber esse comando em um chat novo, seguir obrigatoriamente esta sequência:
1. Ler este arquivo (`PROJECT_STATE.md`).
2. Consultar a `main` atual e os PRs abertos.
3. Identificar o bloco atual, o último feedback validado e a próxima ação.
4. Validar o arquivo diretamente relacionado ao próximo bloco.
5. Só então implementar ou recomendar mudanças.
6. Atualizar este arquivo quando uma decisão arquitetural, guardrail, feedback de validação ou etapa do roadmap mudar.

Não depender do histórico de uma conversa para reconstruir decisões. O GitHub é a fonte persistente do projeto.

## Stack e fronteiras

- React + TypeScript + Vite.
- Cloudflare Pages.
- Supabase: autenticação, FCA, auditoria e substituições.
- Google Sheets/HUB revisada: cadastros operacionais, KPIs e financeiro.
- Forecast Planner e Preline podem ser usados como benchmarks visuais, nunca como dependência de runtime sem decisão explícita.
- O projeto não deve ser convertido para Next.js/Tailwind apenas para reproduzir padrões de outra biblioteca.
- Preline é o benchmark principal de UI/UX para shell/offcanvas, densidade de dashboard, tabelas responsivas, estados interativos, hierarquia visual e acessibilidade. Não instalar Preline neste estágio.

## Guardrails funcionais

- HUB original permanece intocada.
- FCA e novas substituições não escrevem na planilha.
- Período analítico e período FCA são independentes.
- Cobertura de substituição é autorizada pelo par exato Supervisor titular + Módulo.
- Despesas consolidadas não podem ser aplicadas a Supervisor/Módulo quando a fonte não possui essas dimensões.
- Não alterar o comportamento de “Limpar filtros” sem decisão explícita.
- Mudanças pequenas, isoladas e validáveis; evitar grandes patches multifuncionais.

## Segurança de acesso — P0 EM VALIDAÇÃO

Motivação: o usuário solicitou garantia de que BI Logístico e Forecast Planner não possam expor dados apenas porque o frontend foi contornado. O artifact externo citado não pôde ser lido sem autenticação; a auditoria foi feita diretamente no código e nos bancos dos dois projetos.

### BI Logístico

Auditoria confirmada:
- frontend usa somente URL + publishable key;
- `SUPABASE_SECRET_KEY` permanece server-side nas Cloudflare Pages Functions;
- bootstrap da HUB valida bearer token no servidor antes de devolver dados;
- uma conta Auth isolada não ganha acesso operacional sem profile/HUB/cobertura;
- todas as tabelas de aplicação usam RLS;
- FCA continua restrito por profile ativo, titularidade/substituição/creator e cobertura exata Supervisor + Módulo;
- `private.has_active_supervisor_coverage` é SECURITY DEFINER com escopo controlado e checa profile ativo, e-mail, datas e par exato.

Hardening aplicado diretamente no Supabase em 23/08/2026:
- removidos todos os privilégios de `anon` nas tabelas da aplicação;
- removidos `TRUNCATE`, `REFERENCES` e `TRIGGER` de `authenticated` (TRUNCATE não passa pelo RLS);
- default privileges do papel `postgres` em `public` alterados para deny-by-default para tabelas, sequences e functions; grants futuros precisam ser explícitos.

Migrations versionadas na branch `security/auth-hardening-p0`:
- `supabase/migrations/20260823_tighten_bi_table_privileges.sql`;
- `supabase/migrations/20260823_secure_postgres_default_privileges.sql`.

### Forecast Planner

Auditoria encontrou risco maior porque o cliente consulta Supabase diretamente e as leituras mestres eram `TO authenticated USING (true)`, enquanto o frontend oferecia signup público.

Hardening aplicado diretamente no Supabase em 23/08/2026:
- `profiles.ativo boolean not null default false`;
- profiles existentes preservados como ativos;
- novos usuários de Auth passam a nascer `usuario` e `ativo=false`;
- cliente não pode mais auto-inserir/alterar/promover profile;
- dados mestres exigem profile ativo;
- escritas administrativas exigem profile ativo + `perfil='admin'`;
- simulações permanecem owner-only e agora também exigem profile ativo;
- `anon` sem privilégios nas tabelas auditadas;
- `authenticated` sem `TRUNCATE`, `REFERENCES` ou `TRIGGER`;
- default privileges do papel `postgres` em `public` seguem deny-by-default.

As migrations estão versionadas no Forecast na branch `security/harden-auth-access`.

### Configurações manuais ainda obrigatórias nos DOIS projetos

A integração disponível não expõe mutação das configurações hospedadas do Supabase Auth. No Dashboard do Supabase ainda é necessário:
1. desabilitar `Allow new users to sign up`;
2. revisar providers e manter somente os necessários;
3. configurar senha forte (mínimo recomendado 12 caracteres);
4. ativar leaked-password protection quando o plano permitir — o Security Advisor acusa essa proteção como desabilitada nos dois projetos;
5. revisar Site URL + Redirect URLs;
6. próximo bloco: implementar MFA/TOTP e enforcement AAL2, inicialmente para administradores.

Regra permanente: uma tela de login nunca é considerada fronteira de segurança. Toda leitura/escrita deve continuar negada quando chamada diretamente por REST/RPC/Functions sem a autorização de aplicação correta.

## Roadmap UI/UX — objetivo 10/10

Benchmark principal: Preline como referência de arquitetura visual e padrões de aplicação, sem instalar a biblioteca neste estágio.

### Bloco 1 — UI Foundations — CONCLUÍDO
PR #21 — `Cria UI Foundations e migra FCA como piloto`
Merge na main: `511fb33a1a8fb8bd0691ee54e4904467bbc99fd9`

Entregue:
- `Panel` / `PanelHeader`;
- `Badge` / `StatusBadge`;
- `SearchField`;
- `EmptyState`;
- `Skeleton`;
- `src/ui-foundations.css`;
- FCA usada como tela-piloto;
- toolbar corrigida após feedback visual do usuário;
- `aria-pressed` nos filtros de status;
- `scope="col"` nos cabeçalhos da tabela.

### Bloco 2 — Shell UX — CONCLUÍDO
PR #22 — `Corrige shell mobile e tabelas responsivas`
Merge: `bf379ae90380df147981d13f5a89c7b0b4fb4d66`

Complementos de topbar/filtros e correções finais incorporados pelo PR #26.

Entregue:
- drawer acessível com Escape, focus trap, retorno de foco e bloqueio de scroll;
- drawer mobile/tablet com navegação vertical;
- breakpoint do drawer em até 1100px;
- tabelas responsivas em cards abaixo de 760px;
- `Gestão à vista / Pontos de atenção` com layout mobile próprio;
- controle de menu inspirado no Forecast Planner (`menu_open` expandido / `menu` recolhido);
- sidebar recolhida mantém logo e controle totalmente dentro dos 68px;
- drawer mobile/tablet usa X de fechamento explicitamente visível;
- topbar contém página atual, escopo ativo e status HUB;
- filtros em `filter-toolbar` dedicada e sticky;
- desktop horizontal, tablet em grade e mobile empilhado;
- regras de período, supervisor, módulo e reset preservadas.

### Bloco 3 — Data visualization — PARCIALMENTE CONCLUÍDO
Legenda interativa incorporada pelo PR #26.

Entregue:
- legenda do `SimpleLineChart` clicável e acessível;
- clicar oculta/exibe linha e pontos;
- eixo Y recalcula pelas séries visíveis;
- eixo X preserva períodos;
- tooltip permanece;
- última série visível não pode ser ocultada.

Pendente para próximo ciclo:
- hierarquia Primary KPI vs Supporting KPI;
- refinamento amplo do Dashboard;
- headers e responsividade adicional de gráficos;
- revisão de redundâncias e densidade da Home.

### Bloco 4 — Supervisor 360º — CONCLUÍDO
Incorporado pelo PR #26.

Entregue:
- selecionar supervisor expande uma superfície integrada 360º;
- visão expandida aparece acima da grade, logo após o PageHeader, seguindo a experiência de Depositantes;
- hero com foto/avatar, nome, módulos, quantidade de depositantes, FCAs e status;
- KPIs de Produção, Recebimento, Inventário e FCAs pendentes;
- carteira por depositante e FCAs integrados na mesma visão;
- carteira mantém tabela desktop e cards responsivos no mobile;
- navegação para Depositantes preservada;
- `aria-expanded` e `aria-controls` nos cards;
- filtros e cálculos preservados.

### Bloco 5 — Redução da dívida CSS — ÚLTIMO
O `main.tsx` ainda carrega várias folhas globais legadas. Não consolidar em massa. Remover regras somente depois de migrar responsabilidades para primitives e validar regressões.

## Integração deste ciclo

- PR #22 mergeado diretamente na main: `bf379ae90380df147981d13f5a89c7b0b4fb4d66`.
- PRs empilhados #23, #24 e #25 apresentaram conflito de histórico após squash do #22; não foram forçados.
- Foi criado o PR limpo #26 — `Integra shell, gráficos e Supervisor 360`, contendo o estado final validado dos três blocos mais as correções finais.
- PR #26 mergeado na main: `db58089359367848cc7ee7dcbad3c5c743345611`.
- #23, #24 e #25 foram fechados como incorporados pelo #26.

## Últimas entregas consolidadas

- PR #17: correções isoladas da auditoria de UI.
- PR #18: correção de cobertura/autenticação de substitutos.
- PR #19: regressão mínima para filtros e coberturas.
- PR #20: tooltip nos pontos dos gráficos + quantidade de FCA nos cards de supervisores.
- PR #21: UI Foundations + FCA piloto + protocolo de continuidade entre chats.
- PR #22: shell mobile/tablet + tabelas responsivas.
- PR #26: topbar/filter toolbar + legenda interativa + Supervisor 360º + correções finais da sidebar.

## Próximo ciclo

Ao receber **`retomar BI Logístico`**:
1. confirmar a `main` e eventuais PRs abertos;
2. concluir/validar o bloco de segurança P0 antes de voltar ao UI/UX;
3. executar o bloco P1 de segurança: MFA/TOTP + AAL2, começando por administradores;
4. depois retomar refinamento amplo do Dashboard usando Preline como benchmark;
5. priorizar hierarquia Primary KPI vs Supporting KPI, headers de gráficos, densidade da Home e estados/feedback;
6. continuar migração progressiva para primitives reutilizáveis;
7. deixar redução/consolidação das folhas CSS globais para o final, após estabilidade funcional.
