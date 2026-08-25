# BI Logístico V2 — Estado Vivo do Projeto

> Fonte operacional de continuidade entre chats. Antes de propor alterações relevantes, ler este arquivo e confirmar o estado atual da `main` e dos PRs abertos no GitHub.

## Comando de retomada

Comando combinado com o usuário: **`retomar BI Logístico`**.

Ao receber esse comando em um chat novo:
1. Ler este arquivo.
2. Consultar a `main` atual e os PRs abertos.
3. Identificar o bloco atual, o último feedback validado e a próxima ação.
4. Validar diretamente os arquivos relacionados ao próximo bloco.
5. Só então implementar ou recomendar mudanças.
6. Atualizar este arquivo quando uma decisão arquitetural, guardrail, feedback de validação ou etapa do roadmap mudar.

Não depender do histórico de uma conversa para reconstruir decisões. O GitHub é a fonte persistente do projeto.

## Stack e fronteiras

- React + TypeScript + Vite.
- Cloudflare Pages.
- Supabase: autenticação, FCA, auditoria, governança e substituições.
- Google Sheets/HUB revisada: cadastros operacionais, KPIs e financeiro.
- Forecast Planner e Preline podem ser usados como benchmarks visuais, nunca como dependência de runtime sem decisão explícita.
- Não converter o projeto para Next.js/Tailwind apenas para reproduzir padrões de outra biblioteca.
- Preline é benchmark de UI/UX, não dependência.

## Guardrails funcionais

- HUB original permanece intocada.
- FCA e novas substituições não escrevem na planilha.
- Período analítico e período FCA são independentes.
- Cobertura de substituição é autorizada pelo par exato Supervisor titular + Módulo.
- Despesas consolidadas não podem ser aplicadas a Supervisor/Módulo quando a fonte não possui essas dimensões.
- Não alterar o comportamento de “Limpar filtros” sem decisão explícita.
- Mudanças pequenas, isoladas e validáveis; evitar grandes patches multifuncionais.
- Não fazer merge sem autorização explícita do usuário.

## Segurança de acesso — CONCLUÍDA NESTA FASE

Princípio permanente: uma tela de login nunca é considerada fronteira de segurança. Toda leitura/escrita deve continuar negada quando chamada diretamente por REST/RPC/Functions sem autorização de aplicação correta.

### P0 — hardening de autenticação e privilégios

Concluído e mergeado:
- PR #27 — hardening P0 do BI.
- `anon` sem privilégios nas tabelas de aplicação.
- `authenticated` sem `TRUNCATE`, `REFERENCES` ou `TRIGGER`.
- default privileges do papel `postgres` em `public` em deny-by-default.
- frontend usa somente URL + publishable key.
- `SUPABASE_SECRET_KEY` permanece exclusivamente server-side.
- bootstrap HUB valida bearer token, perfil e escopo antes de devolver dados.
- RLS continua sendo a fronteira de autorização dos dados Supabase.

### P1A — governança Owner/Admin

Concluído e mergeado:
- PR #28 — governança `OWNER | ADMIN | USER` separada do perfil operacional.
- Owner único e protegido por identidade Supabase.
- somente Owner pode conceder/revogar Admin.
- Admin delegado não ganha automaticamente escopo analítico global.
- alterações de governança ficam auditadas.
- tela Admin > Acessos disponível ao Owner.

### P1B — MFA/TOTP + AAL2

Frontend concluído e mergeado:
- PR #29 — MFA/TOTP para Owner/Admin.
- cadastro TOTP via QR Code/secret.
- challenge de 6 dígitos.
- sessão privilegiada elevada para `aal2` após validação.
- usuários comuns permanecem em `aal1`.
- corrigidos flashes/reloads causados por renovação silenciosa de sessão.

Enforcement de banco aplicado em produção e versionado no PR #30:
- `AAL2` obrigatório para autoridade Owner/Admin.
- policies administrativas de substituições, auditoria e governança herdam a exigência central.
- helpers privilegiados de autoridade movidos para schema `private`.
- RPCs públicos de governança usam `SECURITY INVOKER` + RLS.
- antigos `SECURITY DEFINER` públicos removidos.

Security Advisor após o hardening:
- nenhum alerta de RLS ou função privilegiada exposta.
- único warning restante: `Leaked Password Protection Disabled`.
- esse recurso é Pro+ no Supabase; em plano sem suporte, registrar como limitação do plano, não como pendência técnica bloqueante.

Configurações hospedadas de Auth que continuam sendo responsabilidade operacional do ambiente:
- signup público desabilitado;
- providers restritos aos necessários;
- senha forte configurada;
- Site URL e Redirect URLs corretos;
- leaked-password protection habilitada quando o plano permitir.

## Roadmap UI/UX — objetivo 10/10

Benchmark principal: Preline como referência de arquitetura visual e padrões de aplicação, sem instalar a biblioteca neste estágio.

### Bloco 1 — UI Foundations — CONCLUÍDO
PR #21.

Entregue:
- `Panel` / `PanelHeader`;
- `Badge` / `StatusBadge`;
- `SearchField`;
- `EmptyState`;
- `Skeleton`;
- `src/ui-foundations.css`;
- FCA como tela-piloto;
- acessibilidade básica em filtros/tabelas.

### Bloco 2 — Shell UX — CONCLUÍDO
PR #22 + consolidação no PR #26.

Entregue:
- drawer acessível e responsivo;
- sidebar desktop recolhível;
- tabelas responsivas;
- topbar com página, escopo e status HUB;
- filter toolbar sticky e responsiva;
- regras funcionais de filtros preservadas.

### Bloco 3 — Data visualization — PARCIALMENTE CONCLUÍDO

Entregue:
- legenda interativa do `SimpleLineChart`;
- ocultar/exibir séries com acessibilidade;
- eixo Y recalculado pelas séries visíveis;
- tooltip preservado.

Próximo ciclo:
- hierarquia Primary KPI vs Supporting KPI;
- refinamento amplo do Dashboard/Home;
- headers e responsividade adicional dos gráficos;
- redução de redundâncias e densidade visual;
- estados de loading/error/empty;
- revisão de acessibilidade.

### Bloco 4 — Supervisor 360º — CONCLUÍDO
PR #26.

Entregue:
- superfície integrada 360º por supervisor;
- hero, módulos, depositantes, FCAs e status;
- KPIs Produção, Recebimento, Inventário e FCAs pendentes;
- carteira e FCA integrados;
- desktop e mobile responsivos.

### Bloco 5 — Redução da dívida CSS — ÚLTIMO

Não consolidar folhas globais em massa agora. Remover regras apenas depois de migrar responsabilidades para primitives e validar regressões.

## Últimas entregas consolidadas

- PR #17: correções isoladas da auditoria de UI.
- PR #18: cobertura/autenticação de substitutos.
- PR #19: regressão mínima para filtros e coberturas.
- PR #20: tooltip nos gráficos + quantidade de FCA em supervisores.
- PR #21: UI Foundations.
- PR #22: shell responsivo.
- PR #26: topbar/filter toolbar + legenda interativa + Supervisor 360º.
- PR #27: segurança P0.
- PR #28: governança Owner/Admin.
- PR #29: MFA/TOTP.
- PR #30: enforcement AAL2 + hardening final de governança — migration aplicada em produção; merge pendente de autorização explícita.

## Próximo ciclo

Após consolidar o PR #30, segurança deixa de ser bloqueador do roadmap.

Ao receber **`retomar BI Logístico`**:
1. confirmar `main` e PRs abertos;
2. não reabrir P0/P1 de segurança salvo novo achado ou incidente;
3. retomar **UI/UX pela Home / Visão geral**;
4. priorizar hierarquia Primary KPI vs Supporting KPI;
5. revisar densidade, redundâncias, headers de gráficos, responsividade e estados/feedback;
6. continuar migração progressiva para primitives reutilizáveis;
7. deixar consolidação ampla de CSS para o final.
