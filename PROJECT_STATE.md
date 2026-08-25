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

Princípio permanente: uma tela de login nunca é considerada fronteira de segurança. Toda leitura/escrita deve continuar negada quando chamada diretamente por REST/RPC/Functions sem autorização de aplicação correta.

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
- `Panel`, `PanelHeader`, `Badge`, `StatusBadge`, `SearchField`, `EmptyState`, `Skeleton`;
- drawer acessível e responsivo;
- sidebar desktop recolhível;
- topbar e filter toolbar;
- tabelas responsivas;
- Supervisor 360º;
- acessibilidade básica e regras funcionais preservadas.

### Ciclo visual #31–#37 — CONCLUÍDO / CONSOLIDAÇÃO AUTORIZADA

PR #31 — Home:
- hierarquia Primary KPI vs Supporting KPI;
- gráfico histórico dominante;
- financeiro/escopo como apoio;
- pontos de atenção em largura total.

PR #32 — gráficos e feedback:
- rótulos temporais com amostragem inteligente;
- tooltip/legenda refinados;
- `EmptyState` compartilhado;
- estados globais de loading/error e retry.

PR #33 — KPIs:
- cards compactos;
- Lead Times com maior peso;
- Inventário com pontuação principal e dimensões de apoio;
- histórico usando largura útil.

PR #34 — Supervisores:
- resumo por criticidade;
- cards com hierarquia mais clara;
- saúde da carteira governada pela maior severidade dos depositantes;
- status duplicado removido.

PR #35 — Depositantes:
- busca com primitive compartilhado;
- resumo de críticos/atenção/estáveis;
- ordenação por severidade;
- status explícito.
- mobile refinado posteriormente no head final: cards próprios com identidade + status, supervisor/módulo como metadados, KPIs compactos, CNPJ no rodapé e 360º em uma coluna real.

PR #36 — Financeiro:
- Receita realizada e Atingimento como headline;
- planejado/saldo como supporting metrics;
- barras Planejado x Realizado com escala relativa para valores >100%;
- cor semântica da barra realizada;
- rail de severidade separado do conteúdo para preservar legibilidade.

PR #37 — FCA + mobile final:
- listagem de FCA em cards no mobile;
- resumo de status compacto e horizontal em telas pequenas;
- detalhe responsivo;
- Novo/Editar FCA em grids adequados a tablet/mobile;
- botões e ações com touch targets adequados;
- tratamento específico para 980px, 760px, 480px e casos estreitos.

O head final do ciclo inclui também o refinamento mobile de Depositantes e deve ser consolidado em `main` como uma única entrega final.

### Próximo bloco

Após consolidar o ciclo #31–#37:
1. Administração/Acessos/Substituições — revisar densidade e responsividade sem alterar governança;
2. passe final de consistência entre páginas: headers, toolbars, empty/loading/error states e acessibilidade;
3. revisão mobile transversal das páginas restantes;
4. redução da dívida CSS somente no final, sem consolidação ampla antes de validar regressões.

## Próximo ciclo ao retomar

Ao receber **`retomar BI Logístico`**:
1. confirmar `main` e PRs abertos;
2. não reabrir segurança salvo novo incidente;
3. confirmar que o ciclo visual #31–#37 já está consolidado;
4. seguir para Administração/Acessos/Substituições e consistência final;
5. validar sempre desktop + tablet + mobile;
6. manter Preline Analytics/Admin como benchmark, sem adicionar dependência;
7. deixar limpeza ampla de CSS por último.
