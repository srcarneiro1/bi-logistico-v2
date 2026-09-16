# MEMÓRIA DO PROJETO — BI LOGÍSTICO V2

Última atualização: 2026-09-16
Estado: **modernização frontend concluída, homologada e mergeada em produção**.

## 1. Objetivo desta memória

Este arquivo é a fonte de verdade do estado consolidado do BI Logístico V2 após a modernização do frontend concluída no PR #69.

Usar esta memória para:
- evitar reabrir decisões já homologadas;
- preservar regras de negócio e segurança durante futuras evoluções;
- manter consistência visual com o Extra Cost Control;
- retomar o projeto em novos chats sem depender do histórico completo da migração.

Documentos complementares:
- `docs/PRIMEREACT_DESIGN_SYSTEM.md` — referência visual;
- `docs/EXTRA_COST_CONTROL_C4.puml` — C4 da referência Extra Cost e arquitetura alvo;
- `docs/EXTRA_COST_REFERENCE_AND_BI_MIGRATION_PLAN.md` — comparação, esforço, riscos, benefícios e gates da modernização.

## 2. Estado final do PR #69

Repositório:
- `srcarneiro1/bi-logistico-v2`

Baseline original da modernização:
- `main` em `b004e9c4e400dd289f713ca1464d90ce8b821410`;
- mensagem: `Exclui outras receitas da carteira de depositantes (#68)`.

Branch utilizada:
- `feature/frontend-modernization-primereact`.

PR:
- #69 — `Modernização frontend: PrimeReact, design system e responsividade`;
- homologado visualmente de forma iterativa;
- retirado de Draft somente após autorização explícita;
- merge autorizado explicitamente pela usuária;
- estado final: `merged`.

Head final homologado antes do merge:
- `3d7fd5bacc966ab7e28359416e58dd9ff1b4b01c`.

Merge commit em `main`:
- `249676abfdff39aa0857be28cf4f2e956897d067`.

Deploy Cloudflare Pages do merge commit:
- concluído com sucesso em 16/09/2026;
- deployment URL do commit: `https://df28121c.bi-logistico-v2.pages.dev`.

O PR #69 teve 160 commits e 71 arquivos alterados. A modernização foi entregue sem mudança deliberada de backend, Apps Script, migrações Supabase ou regras de domínio.

## 3. Decisão arquitetural definitiva deste ciclo

A modernização **não migrou o BI para Next.js**.

Arquitetura preservada:
- React 19;
- TypeScript;
- Vite;
- React Router;
- PrimeReact 10.9.9;
- PrimeIcons 7;
- Chart.js 4.5.1 via PrimeReact Chart;
- Design System Unilog alinhado ao Extra Cost Control;
- Cloudflare Pages + Pages Functions;
- Supabase;
- HUB / Apps Script.

Uma eventual migração Vite → Next.js deve ser tratada como iniciativa independente, nunca como continuação automática desta modernização.

## 4. Regra principal de preservação

O PR #69 foi uma modernização de frontend, UX, responsividade e componentes.

Continuam congelados salvo demanda funcional explícita:
- regras de negócio;
- fórmulas e cálculos;
- contratos de API;
- autenticação;
- autorização;
- perfis e permissões;
- RLS;
- banco de dados;
- migrações Supabase;
- integrações;
- Apps Script;
- escopo de supervisores, módulos e substituições;
- comportamento histórico validado;
- lógica FCA;
- regras financeiras;
- semântica dos filtros globais;
- política de secrets.

Não usar uma demanda visual como justificativa para alterar lógica de domínio.

## 5. Arquitetura funcional preservada

### Frontend
- React + TypeScript + Vite;
- React Router;
- Supabase client com chave publicável no browser.

### Backend/BFF
- Cloudflare Pages Functions;
- validação de JWT;
- autorização e escopo server-side;
- HUB bootstrap;
- funções administrativas;
- secrets somente no servidor.

### Supabase
Responsável por:
- autenticação;
- perfis;
- FCA;
- ações FCA;
- auditoria;
- substituições/coberturas;
- governança;
- storage de fotos quando aplicável.

### HUB / Apps Script / Google Sheets
Responsável pela camada operacional e analítica, incluindo:
- supervisores;
- depositantes;
- indicadores;
- metas;
- KPIs;
- inventário;
- receita;
- despesa.

## 6. Segurança — invariantes obrigatórias

- autenticação não equivale a autorização;
- conta no Supabase Auth não concede acesso ao BI por si só;
- secrets de servidor nunca podem ir ao frontend;
- frontend não é fronteira de segurança;
- escopo continua aplicado por backend/RLS conforme o caso;
- substituição respeita titular, módulo e vigência;
- Owner/Admin não ganha escopo analítico indevido por efeito colateral visual;
- tabelas públicas permanecem sob RLS/grants existentes;
- nenhuma `service_role`/secret pode ir para variável pública;
- MFA Owner/Admin mantém AAL/TOTP;
- modernização de MFA foi somente de apresentação.

Fluxo de autenticação preservado:
1. Supabase Auth;
2. frontend chama `/api/hub/bootstrap` com JWT;
3. Function valida JWT;
4. servidor resolve HUB + cobertura gerenciada;
5. escopo é aplicado server-side;
6. frontend recebe apenas o que pode apresentar.

## 7. Rotas consolidadas

### Autenticação
- Login;
- Primeiro acesso;
- Recuperação/redefinição de senha;
- MFA para perfis que exigem AAL2.

### Aplicação
- `/` — Visão Geral;
- `/kpis` — KPIs;
- `/supervisores` — Supervisores;
- `/depositantes` — Depositantes;
- `/financeiro` — Financeiro;
- `/fca` — Lista FCA;
- `/fca/novo` — Novo FCA;
- `/fca/:id/editar` — Editar FCA;
- `/fca/:id` — Detalhe FCA.

### Administração
- `/administracao/supervisores`;
- `/administracao/substituicoes`;
- `/administracao/acessos`.

Permissões OWNER / ADMIN / usuário operacional permanecem conforme regras anteriores.

## 8. Domínio congelado

Módulos reutilizados sem refatoração funcional deliberada:
- `src/lib/dashboard.ts`;
- `src/lib/fca.ts`;
- `src/lib/governance.ts`;
- `src/lib/substitutions.ts`;
- `src/lib/api.ts`;
- `src/lib/supabase.ts`.

Fora do escopo visual:
- `functions/`;
- `apps-script/`;
- `supabase/migrations/`.

Exceção de frontend criada durante a modernização:
- `src/lib/navigationContext.ts` foi ampliado para preservar contexto de retorno entre telas. Isso é navegação/UI, não alteração de domínio.

## 9. Base PrimeReact consolidada

O BI usa PrimeReact em modo styled:
- `lara-light-indigo/theme.css`;
- `primereact.min.css`;
- `primeicons.css`;
- identidade Unilog aplicada por tokens e overrides posteriores.

Não migrar para `unstyled: true` sem projeto específico.

Componentes PrimeReact utilizados:
- Button;
- Card;
- DataTable / Column;
- Dropdown;
- InputText;
- InputTextarea;
- Password;
- Checkbox;
- Tag;
- Message;
- Skeleton;
- Avatar;
- Toolbar;
- ProgressBar;
- Chart.

Primitives consolidados:
- `Badge` → PrimeReact Tag;
- `Chip` → PrimeReact Tag;
- `SearchField` → PrimeReact InputText + PrimeIcon;
- `MetricCard` → PrimeReact Card;
- `Panel` → PrimeReact Card;
- `SummaryMetrics` → PrimeReact Card/Button;
- `PageHeader` → PrimeReact Toolbar;
- `EmptyState` → PrimeIcons;
- `Skeleton` → PrimeReact Skeleton;
- `ContextNotice` → PrimeIcons;
- `SimpleLineChart` → PrimeReact Chart + Chart.js;
- Login/SetPassword → PrimeReact controls;
- MFA → PrimeReact Card + InputText + Button;
- AppShell → Avatar, Tag, Dropdown, Button e PrimeIcons.

Material Symbols foi removido do runtime principal.

## 10. Design System final

Referência principal: Extra Cost Control.

Tokens principais:

### Marca
- `#db0812` — vermelho Unilog;
- `#b8070f` — vermelho escuro;
- `#fdecee` — vermelho suave.

### Neutros
- `#171b24` — ink;
- `#242a36` — ink 2;
- `#494a56` — graphite;
- `#676d77` — graphite 2;
- `#8a9099` — muted;
- `#e2e5e9` — border;
- `#edf0f2` — border soft;
- `#f5f6f8` — canvas;
- `#ffffff` — surface;
- `#f8f9fb` — surface soft.

### Estados
- sucesso `#3f7c59`;
- atenção `#a87900`;
- perigo `#c91a23`.

Geometria:
- controle: 10px;
- card: 14px;
- dialog/editor: ~18px;
- controles principais: ~42–46px;
- sombras discretas;
- focus ring suave;
- tipografia Roboto.

O vermelho Unilog é cor de marca e não significa erro automaticamente.

## 11. Cards — padrão homologado

### KPI / métrica
- PrimeReact Card;
- sem faixa vertical grossa;
- superfície semântica verde/amarela/vermelha quando aplicável;
- variação em p.p. independente do tom do card:
  - positivo = verde;
  - negativo = vermelho;
  - zero = neutro.

### Cards selecionáveis FCA
- usam PrimeReact Button/Card anatomy;
- fundo semântico é preservado;
- selecionado = borda vermelha + ring vermelho;
- seleção permanece visível em hover/active;
- hover atua somente em card não selecionado;
- mobile: 2 colunas em largura intermediária e 1 coluna abaixo de 480px.

### Entity/content cards
- PrimeReact Card quando a superfície representa uma entidade ou resumo relevante;
- exemplos: carteira de supervisor, fotos administrativas, coberturas, resumo financeiro.

## 12. Filtros — padrão final Extra Cost

Filtros globais mantêm a semântica original, mas seguem a anatomia do Extra Cost:
- PrimeReact Card;
- Dropdowns PrimeReact;
- uma única moldura por campo;
- `p-dropdown-label` interno não desenha borda própria;
- valor com peso regular;
- labels compactos;
- foco vermelho somente na moldura externa;
- grid responsivo;
- 1 coluna no mobile;
- ação explícita `Limpar dimensões`.

Regras preservadas:
- período normal x período FCA;
- supervisor conforme permissão;
- mudança de supervisor limpa módulo;
- módulo depende do escopo;
- rotas contextuais continuam respeitadas.

## 13. Tabelas e listas — padrão final

Padrão canônico `nx-prime-table`:
- PrimeReact DataTable/Column;
- wrapper sem borda/raio próprio;
- header ~42px;
- linha ~46px;
- padding 12×14;
- cabeçalho claro e uppercase;
- hover discreto;
- Tags/Badges compactos;
- record cards explícitos no mobile quando superiores ao scroll horizontal.

Telas com DataTable padronizada:
- KPIs;
- Supervisores 360º;
- Depositantes;
- Financeiro — despesas;
- FCA;
- Administração > Acessos.

Listas operacionais também seguem a mesma densidade visual quando DataTable não é adequada.

### Regra de interação com depositantes
Quando uma linha/card representa um depositante, **a linha/card inteira é navegável para a visão 360º**, não apenas o nome.

Aplicado em:
- Home > Pontos de atenção;
- KPIs;
- Supervisores;
- Depositantes;
- Financeiro, somente quando a linha de receita pode ser vinculada inequivocamente a um depositante cadastrado.

O nome do depositante não deve ter moldura/caixa visual de botão. Focus visível permanece para navegação por teclado.

FCA não segue essa regra porque a linha representa um FCA, não um depositante.

## 14. Navegação contextual

Ao abrir um depositante a partir de outra tela, o BI preserva a origem em `navigationContext`.

Fluxos consolidados:
- Home → Depositante → `Voltar para Visão geral`;
- KPIs → Depositante → `Voltar para KPIs`;
- Supervisores → Depositante → `Voltar para Supervisores`, reabrindo o mesmo supervisor;
- Financeiro → Depositante → `Voltar para Financeiro`;
- Depositante → FCA → Depositante preserva o contexto anterior;
- entrada direta pelo menu em Depositantes não inventa origem e mantém apenas `Fechar visão`.

Não substituir esse mecanismo por `history.back()` como solução principal.

## 15. Gráficos — padrão final

`SimpleLineChart` é o wrapper comum PrimeReact Chart + Chart.js.

Consumidores principais:
- Home;
- KPIs;
- Depositante 360º.

Configuração homologada:
- `responsive: true`;
- `maintainAspectRatio: false`;
- `animation: false`;
- `interaction: { mode: 'index', intersect: false }`;
- tooltip grafite/ink;
- ao passar o mouse em um período, o tooltip apresenta todas as séries disponíveis naquele eixo X;
- pontos ~2.5px;
- hover ~4px;
- linha ~2–2.5px;
- grid/ticks discretos;
- Roboto;
- paleta Unilog/semântica;
- legendas interativas;
- stage responsivo próximo de 248px desktop, 238px intermediário e 224px mobile.

Não voltar ao comportamento `nearest` que exige acertar ponto por ponto.

## 16. Home — decisões finais

- resumo executivo refinado e compactado;
- cards/valores contextuais com hierarquia mais clara;
- blocos vizinhos equalizados no desktop quando possível;
- gráfico e coluna lateral trabalham com composição de altura coerente;
- `Pontos de atenção` é realmente clicável e abre o Depositante 360º;
- indicador superior usa ponto verde + texto **Base conectada**, alinhado ao Extra Cost.

## 17. Supervisores — decisões finais

- cartões de supervisores usam superfície PrimeReact Card;
- seleção visual preservada;
- carteira 360º em DataTable + record cards mobile;
- linha/card de depositante inteiro é clicável;
- nome não possui moldura de botão;
- depositantes sem qualquer dado operacional ou inventário no período/escopo atual não aparecem na carteira do supervisor;
- o filtro é feito na apresentação a partir dos CNPJs realmente presentes nos fatos filtrados, sem alterar cadastro/base.

## 18. Depositantes — decisões finais

- tabela principal padronizada;
- linha/card inteiro clicável;
- nome do depositante é ação textual sem borda;
- 360º preserva KPIs, inventário, financeiro, FCA e histórico;
- retorno contextual implementado;
- gráficos seguem tooltip agregado por período.

## 19. Financeiro — invariantes e UX

Regra crítica preservada:

`hub.profile.perfil === 'ADMIN' && !filters.supervisorId && !filters.moduloId`

Somente nesse cenário a despesa consolidada pode ser apresentada, porque `fDespesa` não possui as dimensões necessárias para combinar despesa consolidada com receita filtrada.

Também preservado:
- diferença negativa de despesa mantém `text-crit`;
- diferença não negativa mantém `text-ok`;
- `OUTRAS RECEITAS OPERACIONAIS` não entra como carteira operacional de depositante.

Linhas de receita só viram navegação para 360º quando existe correspondência inequívoca com depositante cadastrado.

## 20. FCA — estado final

Lista, detalhe, novo e edição foram modernizados visualmente.

Preservado:
- `deriveFcaDisplayStatus` como fonte do status visual;
- período FCA independente;
- snapshot histórico;
- ações 1:N;
- auditoria;
- criação/edição via funções existentes;
- validações;
- cobertura/substituição;
- retorno contextual.

Cards de status da lista são selecionáveis e seguem o padrão de seleção vermelho homologado.

## 21. Administração — estado final

### Acessos
- filtro PrimeReact Dropdown;
- DataTable desktop;
- record cards mobile;
- Owner protegido;
- regra de governança inalterada.

### Fotos de supervisores
- PrimeReact Cards;
- Avatar/ações PrimeReact;
- upload/remover preservados;
- input nativo de arquivo permanece oculto;
- lógica Supabase/HUB intacta.

### Substituições
A tela foi reorganizada no fechamento da homologação:
- não abre mais com dois formulários grandes expandidos;
- conteúdo principal é consulta de pessoas + coberturas;
- ações explícitas `Novo substituto` e `Nova cobertura`;
- um único editor por vez;
- edição usa o mesmo editor;
- lista compacta de substitutos com status;
- cards de cobertura mostram Titular → Substituto, módulo, período, status e motivo;
- mobile em coluna única;
- `saveSubstitute`, `saveCoverage` e `coverageToForm` preservados;
- titular, substituto, módulo e período continuam obrigatórios;
- regras de vigência/escopo não foram alteradas.

## 22. Loading / boot — estado final

O carregamento inicial foi redesenhado e homologado.

Regras finais:
- tela ocupa exatamente o viewport;
- `position: fixed` + `100dvh`;
- `overflow: hidden`;
- `overscroll-behavior: none`;
- sem rolagem vertical/rubber-band desnecessário no mobile;
- safe areas respeitadas;
- identidade simplificada para evitar redundância.

Branding final:
- logo UNILOG Express;
- texto `BI LOGÍSTICO` apenas uma vez;
- não repetir `UNILOG EXPRESS` em texto separado;
- não usar `Carregando BI Logístico` abaixo do branding.

Mensagens finais:
- autenticação inicial: `ACESSO SEGURO` / `Validando seu acesso`;
- carga da HUB: `SINCRONIZANDO DADOS` / `Preparando seu ambiente`.

## 23. MFA — estado final

MFA Owner/Admin continua usando Supabase AAL/TOTP.

Chamadas de segurança preservadas:
- `getAuthenticatorAssuranceLevel()`;
- `listFactors()`;
- `enroll()`;
- `unenroll()` para fatores pendentes;
- `challengeAndVerify()`.

Somente apresentação foi refinada:
- PrimeReact Card;
- ícone/bloco de segurança;
- hierarquia mais compacta;
- título `Confirme sua identidade` no challenge;
- OTP centralizado;
- CTA principal dominante;
- `Sair da conta` secundário;
- nota de segurança mantida.

## 24. Responsividade final

Breakpoints e comportamento homologados:
- sidebar vira drawer em `<=1180px`;
- drawer mantém focus trap, Escape, scroll lock, retorno de foco e fechamento por navegação;
- filtros viram uma coluna no mobile;
- DataTables extensas viram record cards nas principais telas;
- gráficos são fluidos;
- ações PrimeReact ocupam largura útil no mobile quando necessário;
- FCA forms e Admin forms passam para uma coluna;
- MFA e loading usam viewport/safe-area corretamente;
- cards selecionáveis FCA passam para 1 coluna abaixo de 480px.

## 25. CSS e ownership visual

Não remover CSS em massa.

Fluxo seguro:
1. identificar owner e consumidores;
2. migrar estrutura/componente;
3. aplicar camada final específica;
4. validar cascata real;
5. remover CSS morto apenas quando comprovado.

Camadas relevantes criadas/consolidadas no PR #69:
- `extra-cost-alignment.css`;
- `extra-cost-final-polish.css`;
- `table-final-polish.css`;
- `chart-final-polish.css`;
- `responsive-final-polish.css`;
- `final-parity.css`;
- `filter-parity.css`;
- `depositor-interactions.css`;
- `fca-card-selection.css`;
- `substitutions-final.css`;
- além dos owners específicos por página.

`src/primereact.css` continua como bridge de compatibilidade.

Dívida semântica conhecida e não bloqueante:
- `Panel.tsx` aceita prop `as`, mas o wrapper real continua sendo PrimeReact Card/div. Não reabrir isso apenas por semântica HTML sem necessidade funcional.

## 26. CI, testes e deploy

`.npmrc` versionado:

```ini
legacy-peer-deps=true
fund=false
audit=false
```

Não criar lockfile manualmente. Somente aceitar lockfile produzido por npm em ambiente confiável.

Workflow GitHub Actions `test-and-build`:
- checkout;
- Node 22;
- `npm install --no-audit --no-fund`;
- `npm test`;
- `npm run build`.

No head final homologado `3d7fd5b...`:
- GitHub Actions `test-and-build`: SUCCESS;
- testes Vitest: SUCCESS;
- build: SUCCESS;
- Cloudflare Pages preview: SUCCESS.

No merge commit `249676ab...`:
- deploy Cloudflare Pages em `main`: SUCCESS.

Importante: o workflow de CI é disparado por PR; portanto, não afirmar que o GitHub Actions rodou novamente no merge commit se não houver check correspondente. O que foi comprovado é CI verde no head homologado e deploy Cloudflare verde no merge commit.

## 27. Homologação concluída

A homologação visual/funcional foi realizada de forma iterativa pela usuária durante o PR, incluindo correções em:
- Login/autenticação;
- loading;
- MFA;
- shell/mobile;
- filtros;
- cards;
- tabelas/listas;
- gráficos/tooltips;
- Home;
- KPIs;
- Supervisores;
- Depositantes;
- Financeiro;
- FCA;
- Administração;
- Substituições;
- navegação contextual.

A versão final foi aprovada explicitamente e o merge foi autorizado pela usuária.

## 28. Regras para futuras evoluções

1. Não reabrir a modernização visual como projeto em andamento: ela está concluída.
2. Novas demandas devem ser tratadas como evolução incremental a partir de `main` pós-PR #69.
3. Criar branch própria para cada mudança relevante; evitar desenvolvimento direto em `main`.
4. Preservar o padrão visual Extra Cost já homologado.
5. Antes de alterar domínio/backend, confirmar que existe uma demanda funcional explícita.
6. Manter navegação contextual ao criar novos atalhos para Depositantes/FCA.
7. Linhas/cards que representam depositantes devem seguir o padrão de clique integral.
8. Novos gráficos devem usar Chart.js/PrimeReact Chart e tooltip por índice quando houver múltiplas séries comparáveis.
9. Manter DataTable + record cards mobile como padrão para listas tabulares extensas.
10. Validar sempre o head exato em CI + Cloudflare antes de merge.
11. Mudanças em autenticação, autorização, RLS, Functions, Supabase, Apps Script ou regras financeiras exigem revisão funcional específica.

## 29. Referência de retomada

Ao retomar o BI Logístico V2 em outro chat, considerar como estado base:

- `main` pós-PR #69;
- merge commit `249676abfdff39aa0857be28cf4f2e956897d067`;
- frontend PrimeReact/PrimeIcons/Chart.js consolidado;
- visual alinhado ao Extra Cost Control;
- domínio/backend preservados;
- navegação contextual implementada;
- responsividade mobile homologada;
- CI existente;
- deploy Cloudflare do merge confirmado;
- modernização V1 encerrada.

Qualquer nova alteração começa a partir deste estado.
