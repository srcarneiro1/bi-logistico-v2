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
- Preline Analytics/Admin é benchmark principal de UI/UX, não dependência.
- Flowbite React passa a ser benchmark complementar de componentes/interações React (drawer, modal, tabs, table, sidebar, feedback), mas **não deve ser instalado neste estágio**.
- O projeto atual não usa Tailwind; uma eventual adoção real de Flowbite/Tailwind exige POC/ADR isolado e decisão arquitetural explícita.
- Não converter o projeto para Next.js/Tailwind apenas para reproduzir padrões de outra biblioteca.

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
- PR #38: compactação final dos filtros globais no mobile e correção dos cards mobile de Depositantes.

### FCA — REDESENHO PRELINE EM VALIDAÇÃO

PR draft #39 — branch `ui/fca-preline-redesign`.

Objetivo: elevar o FCA de “funcional e responsivo” para uma experiência administrativa/analítica mais próxima de Preline Admin/Analytics, sem alterar lógica, permissões, dados ou segurança.

Em validação:
- summary cards semânticos e workspace único para busca/filtro/listagem;
- tabela com identidade primária e CTA explícito;
- detalhe com hero, metadados agrupados, causa em superfície principal e resumo das ações;
- plano de ação e auditoria em timelines;
- Novo/Editar com fluxo visual de três etapas e seções numeradas;
- stepper mobile sem carrossel/arraste obrigatório;
- Depositantes mobile com summary 2x2 e sem rail de severidade redundante ao lado do nome;
- retorno contextual de FCA para o mesmo Supervisor ou Depositante de origem;
- contexto de retorno consumido para evitar navegação obsoleta;
- desktop, tablet e mobile fazem parte do aceite.

Não fazer merge deste bloco sem nova autorização explícita após validação do Preview.

## Auditoria UX/UI transversal — ACHADOS

1. **Administração/Acessos é o principal gap restante.** A tela atual é funcional, mas pouco rica em exploração e gestão. O backend hoje suporta com segurança listar usuários e conceder/revogar Admin; não criar ações fictícias além disso.
2. Próximo redesign de Acessos deve incluir busca/filtros, summary stats, melhor distinção entre governança e perfil operacional, detalhe contextual (drawer/modal), confirmações próprias e mobile em cards.
3. Substituições deve receber o mesmo padrão de workspace, filtros, status e detalhe progressivo.
4. Criar padrão transversal de navegação contextual/breadcrumb para telas de detalhe onde fizer sentido.
5. Revisar drawers/modais/tabs como primitives do design system, inspirados em Preline/Flowbite, sem introduzir Tailwind neste ciclo.
6. Revisar acessibilidade transversal: foco, navegação por teclado, touch targets, contraste e estados de confirmação.
7. Consolidar CSS somente depois de estabilizar esses padrões; não fazer limpeza ampla agora.

### Próximos blocos após FCA

1. Administração/Acessos — redesign de gestão dentro das capacidades reais do backend.
2. Administração/Substituições — workspace e mobile.
3. Navegação contextual + drawers/modais/tabs reutilizáveis.
4. Passe final de consistência entre páginas e acessibilidade.
5. Redução da dívida CSS no final.

## Próximo ciclo ao retomar

Ao receber **`retomar BI Logístico`**:
1. confirmar `main` e PRs abertos;
2. não reabrir segurança salvo novo incidente;
3. verificar PR #39 e feedback do Preview;
4. se FCA já validado/mergeado, seguir para Administração/Acessos;
5. validar sempre desktop + tablet + mobile;
6. manter Preline Analytics/Admin + Flowbite React como benchmarks, sem adicionar dependências de styling neste estágio;
7. deixar limpeza ampla de CSS por último.
