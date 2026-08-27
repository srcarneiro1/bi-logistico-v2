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

## Fontes obrigatórias de UI/UX

Antes de qualquer criação ou alteração visual, ler nesta ordem:

1. **`docs/BI_LOGISTICO_UI_UX_SKILL.md`** — fonte de verdade da gramática visual e de interação.
2. **`docs/BI_LOGISTICO_DESIGN_LAYOUT_MEMORY.md`** — memória persistente de decisões, achados, referências externas pesquisadas e backlog visual ativo.

Esses documentos cobrem:
- anatomia de páginas;
- hierarquia de KPIs;
- cards;
- tabelas/listas;
- status/severidade;
- filtros/toolbars;
- formulários;
- modais/drawers;
- navegação contextual;
- feedback states;
- responsividade;
- acessibilidade;
- consistência entre Home, KPIs, Supervisores, Depositantes, Financeiro, FCA e Administração;
- decisões recentes de design/layout e anti-patterns já identificados.

Nenhuma tela nova ou revisão visual deve ser considerada concluída sem passar pelo checklist da skill e pelas decisões registradas na memória de design.

## Stack e fronteiras

- React + TypeScript + Vite.
- Cloudflare Pages.
- Supabase: autenticação, FCA, auditoria, governança, substituições e fotos internas de supervisores.
- Google Sheets/HUB revisada: cadastros operacionais, KPIs e financeiro.
- Preline Analytics/Admin é benchmark principal de UI/UX, não dependência.
- Flowbite React, shadcn/ui, Tremor, TailAdmin e Mosaic podem ser usados como benchmarks de composição/componentes.
- Radix Primitives e React Aria são candidatos incrementais para componentes comportamentais complexos quando houver justificativa técnica.
- O projeto atual não usa Tailwind; uma eventual adoção real de Tailwind/Flowbite/shadcn/Tremor exige POC/ADR isolado e decisão arquitetural explícita.
- Não converter o projeto para Next.js/Tailwind apenas para reproduzir padrões de outra biblioteca ou template.

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
- Em mobile, conteúdo essencial não deve depender de arraste horizontal; preferir grid, cards, progressive disclosure e alvos de toque adequados.
- Estados semânticos não devem ser repetidos por múltiplos sinais concorrentes sem ganho de informação.
- Navegação para detalhes deve preservar contexto de origem sempre que o usuário espera retornar ao mesmo item/visão.
- Em cards, evitar rails/faixas/bordas coloridas decorativas no topo. Semântica deve ser comunicada de forma localizada e consistente.

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

## Fotos de supervisores — CONCLUÍDO

PR #46 mergeado.

- Upload administrativo em **Administração → Fotos de supervisores**.
- Bucket Supabase `supervisor-fotos` privado.
- URLs assinadas por 24h.
- JPG/PNG/WEBP até 2 MB com validação real de assinatura binária.
- Escrita/remoção somente por backend Cloudflare com Owner/Admin + AAL2.
- `SupervisorID` validado contra a HUB.
- Foto interna tem prioridade; `FotoURL` da HUB/SharePoint permanece como fallback.
- `service_role` possui apenas as permissões necessárias para operar a tabela; `anon` e `authenticated` não possuem DML direto.

## Roadmap UI/UX — objetivo 10/10

### Foundations e Shell — CONCLUÍDOS

PRs #21, #22 e #26.

Entregue:
- primitives compartilhados (`Panel`, `Badge`, `SearchField`, `EmptyState`, `Skeleton`);
- drawer/sidebar/topbar/filter toolbar responsivos;
- tabelas responsivas;
- Supervisor 360º;
- acessibilidade básica e regras funcionais preservadas.

### Ciclo visual #31–#44 — CONCLUÍDO E MERGEADO

- Home: hierarquia Primary vs Supporting KPI, histórico dominante e pontos de atenção.
- Gráficos/feedback: rótulos temporais, tooltip/legenda, empty/loading/error e retry.
- KPIs: densidade e hierarquia de Lead Times/Inventário.
- Supervisores: saúde da carteira governada pela maior severidade, cards simplificados.
- Depositantes: busca/priorização/status e cards mobile dedicados.
- Financeiro: headline metrics, escala correta acima de 100%, cores semânticas e rails de severidade.
- FCA: redesign Preline, workspace de listagem, detalhe, timelines, formulários por etapas, navegação contextual e mobile sem carrossel obrigatório.
- SummaryMetrics, DetailHero/DetailMetrics, StatusBadge/MetricStatusBadge, tabelas/record-lists, sections/feedback e acessibilidade/interações foram normalizados em primitives/padrões compartilhados.

## Auditoria UX/UI transversal — ACHADOS ATUAIS

1. **FCA voltou a ser o principal gap visual percebido pelo usuário.** Os cards/botões de status e parte do workspace parecem mais grosseiros e diferentes das outras abas. Corrigir sem alterar regras de FCA.
2. **Depositantes:** a faixa colorida superior de `DetailMetrics` foi explicitamente considerada feia. Rever o primitive compartilhado, avaliando impacto em Supervisor 360 antes da mudança.
3. FCA ainda possui CSS legado de `.fca-status-summary` em `fca-workspace.css`, apesar de a tela já usar `SummaryMetrics`.
4. Depositantes ainda possui CSS legado de `.depositors-summary` e overrides mobile extensos. Não limpar junto do redesign; estabilizar primeiro.
5. Administração/Acessos e Substituições continuam candidatas a refinamento, mas feedback visual explícito de FCA/Depositantes tem prioridade.
6. Revisar drawers/modais/tabs como primitives quando necessário; preferir POC incremental com Radix/React Aria se comportamento acessível próprio estiver ficando frágil.
7. Revisar acessibilidade transversal: foco, navegação por teclado, touch targets, contraste e estados de confirmação.
8. Consolidar CSS somente depois de estabilizar os padrões; não fazer limpeza ampla simultânea a redesign.

### Próximos blocos

1. FCA — normalizar summaries/status filters, workspace e ações com o restante do BI.
2. Depositantes — remover/reformular rail superior dos DetailMetrics e validar impacto transversal.
3. Revisão visual FCA detalhe/formulários conforme screenshots do usuário.
4. Administração/Acessos e Substituições — refinamentos restantes.
5. Redução controlada da dívida CSS, por concern e com evidência de seletor substituído.

## Próximo ciclo ao retomar

Ao receber **`retomar BI Logístico`**:
1. confirmar `main` e PRs abertos;
2. ler `docs/BI_LOGISTICO_UI_UX_SKILL.md`;
3. ler `docs/BI_LOGISTICO_DESIGN_LAYOUT_MEMORY.md`;
4. não reabrir segurança salvo novo incidente;
5. priorizar o último feedback visual explícito do usuário — atualmente FCA e Depositantes;
6. validar sempre desktop + tablet + mobile;
7. manter Tailwind/shadcn/Preline/Flowbite/Tremor/TailAdmin como benchmarks enquanto não houver ADR de adoção;
8. deixar limpeza ampla de CSS por último.
