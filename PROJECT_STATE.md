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
- Preline — especialmente os templates Analytics Dashboard e Admin Dashboard — é benchmark principal de UI/UX, não dependência.

## Guardrails funcionais

- HUB original permanece intocada.
- FCA e novas substituições não escrevem na planilha.
- Período analítico e período FCA são independentes.
- Cobertura de substituição é autorizada pelo par exato Supervisor titular + Módulo.
- Despesas consolidadas não podem ser aplicadas a Supervisor/Módulo quando a fonte não possui essas dimensões.
- Não alterar o comportamento de “Limpar filtros” sem decisão explícita.
- Mudanças pequenas, isoladas e validáveis; evitar grandes patches multifuncionais.
- Não fazer merge sem autorização explícita do usuário.
- **Responsividade é requisito de aceite:** cada bloco visual deve ser construído e validado para desktop, tablet e mobile, e não adaptado apenas no final.
- Em mobile, preferir composição específica (cards, toolbars compactas, progressive disclosure e alvos de toque adequados) em vez de apenas comprimir layouts desktop.

## Segurança de acesso — CONCLUÍDA NESTA FASE

Concluído e mergeado:
- PR #27 — hardening P0.
- PR #28 — governança `OWNER | ADMIN | USER`.
- PR #29 — MFA/TOTP para Owner/Admin.
- PR #30 — enforcement AAL2 + hardening final de governança.
- RLS e autorização server-side preservados.
- `AAL2` obrigatório para autoridade Owner/Admin no banco.
- helpers privilegiados no schema `private`.
- RPCs públicos de governança com `SECURITY INVOKER` + RLS.
- Security Advisor sem alertas de RLS/função privilegiada; `Leaked Password Protection Disabled` permanece apenas quando indisponível no plano.

## Roadmap UI/UX — objetivo 10/10

Benchmark principal: Preline Analytics/Admin como referência de hierarquia, densidade, cards, tabelas, filtros, estados de feedback e responsividade, sem instalar a biblioteca.

### Foundations e Shell — CONCLUÍDOS

PRs #21, #22 e #26.

Entregue:
- primitives compartilhados (`Panel`, `Badge`, `SearchField`, `EmptyState`, `Skeleton`);
- drawer/sidebar/topbar/filter toolbar responsivos;
- tabelas responsivas;
- Supervisor 360º;
- acessibilidade básica e regras funcionais preservadas.

### Ciclo visual #31–#38 — CONCLUÍDO E MERGEADO

- Home: hierarquia Primary vs Supporting KPI, histórico dominante e pontos de atenção.
- Gráficos/feedback: rótulos temporais, tooltip/legenda, empty/loading/error e retry.
- KPIs: densidade e hierarquia de Lead Times/Inventário.
- Supervisores: saúde da carteira governada pela maior severidade, cards simplificados.
- Depositantes: busca/priorização/status e cards mobile dedicados.
- Financeiro: headline metrics, escala correta acima de 100%, cores semânticas e rails de severidade.
- FCA: responsividade inicial em lista/detalhe/novo/editar.
- PR #38: compactação final dos filtros globais no mobile e correção definitiva dos cards mobile de Depositantes.

### FCA — REDESENHO PRELINE EM VALIDAÇÃO

Branch atual: `ui/fca-preline-redesign`.

Objetivo: elevar o FCA de “funcional e responsivo” para uma experiência administrativa/analítica mais próxima dos padrões visuais do Preline Admin/Analytics, sem alterar lógica, permissões, dados ou segurança.

Em implementação/validação:
- listagem com summary cards semânticos e workspace único para busca, filtro e registros;
- tabela com identidade primária mais forte e CTA explícito de abertura;
- detalhe com hero do registro, metadados agrupados, causa em superfície principal e resumo executivo das ações;
- plano de ação em timeline visual;
- auditoria em timeline separada;
- Novo/Editar com stepper de três etapas e seções numeradas;
- nova camada `fca-workspace.css` sobre `fca-mobile.css`, preservando o comportamento responsivo já validado;
- desktop, tablet e mobile fazem parte do aceite.

Não fazer merge deste bloco sem nova autorização explícita após validação do Preview.

### Próximos blocos após FCA

1. Administração/Acessos/Substituições — revisar densidade e responsividade sem alterar governança.
2. Passe final de consistência entre páginas: headers, toolbars, estados de feedback e acessibilidade.
3. Revisão mobile transversal das páginas restantes.
4. Redução da dívida CSS somente no final, após validar regressões.

## Próximo ciclo ao retomar

Ao receber **`retomar BI Logístico`**:
1. confirmar `main` e PRs abertos;
2. não reabrir segurança salvo novo incidente;
3. verificar o estado do redesenho FCA/Preview;
4. se FCA já validado/mergeado, seguir para Administração/Acessos/Substituições;
5. validar sempre desktop + tablet + mobile;
6. manter Preline Analytics/Admin como benchmark, sem adicionar dependência;
7. deixar limpeza ampla de CSS por último.
