# MEMÓRIA DO PROJETO — BI LOGÍSTICO V2

Última atualização: 2026-09-14

## 1. Objetivo desta memória

Este arquivo é a fonte de verdade da modernização do frontend do BI Logístico V2. Ele deve ser atualizado ao longo da migração e usado para evitar decisões contraditórias entre etapas, chats e pull requests.

## 2. Baseline confirmado

Repositório: `srcarneiro1/bi-logistico-v2`

Baseline da migração:
- branch base: `main`
- commit base: `b004e9c4e400dd289f713ca1464d90ce8b821410`
- mensagem do commit base: `Exclui outras receitas da carteira de depositantes (#68)`

Branch da modernização:
- `feature/frontend-modernization-primereact`

## 3. Decisão arquitetural aprovada

A modernização NÃO migrará o projeto para Next.js.

Arquitetura alvo:
- React
- TypeScript
- Vite
- React Router
- PrimeReact
- PrimeIcons
- Chart.js, preferencialmente via PrimeReact Chart
- Design System próprio Unilog
- Cloudflare Pages + Pages Functions mantidos nesta migração
- Supabase mantido
- Apps Script / HUB mantidos

Motivo: o BI é uma aplicação autenticada e operacional. A migração para Next.js não resolve uma necessidade funcional atual e ampliaria o raio de risco envolvendo roteamento, build e deploy sem benefício proporcional.

## 4. Regra principal de preservação

Esta modernização é prioritariamente de frontend, UX, responsividade, componentes e visual.

Não alterar silenciosamente:
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
- regras de escopo de supervisores, módulos e substituições;
- comportamento histórico validado;
- lógica FCA;
- regras financeiras;
- semântica dos filtros globais;
- política de secrets.

Qualquer alteração funcional necessária deverá ser tratada como mudança separada e explicitamente aprovada.

## 5. Arquitetura funcional atual preservada

### Frontend
- React + TypeScript + Vite
- React Router
- Supabase client com chave publicável no browser

### Backend/BFF
- Cloudflare Pages Functions
- validação de JWT
- autorização e escopo server-side
- HUB bootstrap
- funções administrativas
- secrets somente no servidor

### Supabase
Responsável por:
- autenticação;
- perfis;
- FCA;
- ações FCA;
- auditoria;
- substituições/cobertura;
- governança;
- storage de fotos quando aplicável.

### HUB / Apps Script / Google Sheets
Responsável pela camada operacional e analítica hoje existente, incluindo supervisores, depositantes, indicadores, metas, KPIs, inventário, receita e despesa.

## 6. Regras de segurança que não podem regredir

- autenticação não equivale a autorização;
- conta existente no Supabase Auth não concede acesso ao BI por si só;
- secrets de servidor nunca podem ser expostos ao frontend;
- o frontend não é fronteira de segurança;
- regras de escopo continuam sendo aplicadas pelo backend/RLS conforme o caso;
- substituição deve respeitar titular, módulo e intervalo de vigência;
- owner/admin não devem ganhar escopo analítico indevido por efeito colateral visual;
- todas as tabelas públicas continuam sob RLS/grants existentes;
- nenhuma chave `service_role`/secret deve ir para variáveis públicas.

## 7. Telas e rotas protegidas atuais

### Autenticação
- Login
- Primeiro acesso
- Recuperação/redefinição de senha
- MFA para perfis que exigem AAL2

### Aplicação
- `/` — Visão Geral
- `/kpis` — KPIs
- `/supervisores` — Supervisores
- `/depositantes` — Depositantes
- `/financeiro` — Financeiro
- `/fca` — Lista FCA
- `/fca/novo` — Novo FCA
- `/fca/:id/editar` — Editar FCA
- `/fca/:id` — Detalhe FCA

### Administração
- `/administracao/supervisores`
- `/administracao/substituicoes`
- `/administracao/acessos`

As permissões existentes por OWNER / ADMIN / usuário operacional devem ser mantidas.

## 8. Lógica de domínio congelada durante a modernização visual

Os seguintes módulos devem ser reutilizados antes de qualquer hipótese de refatoração funcional:
- `src/lib/dashboard.ts`
- `src/lib/fca.ts`
- `src/lib/governance.ts`
- `src/lib/substitutions.ts`
- `src/lib/api.ts`
- `src/lib/supabase.ts`, salvo adaptação estritamente visual/organizacional sem alterar comportamento de sessão

Também ficam fora do escopo visual inicial:
- `functions/`
- `apps-script/`
- `supabase/migrations/`

## 9. Estratégia PrimeReact

PrimeReact será usado como camada estrutural de componentes, sem impor visual genérico.

Preferências:
- Button
- Card
- DataTable / Column
- Dialog / ConfirmDialog
- Dropdown
- MultiSelect
- InputText
- InputTextarea
- Password
- Calendar/DatePicker quando necessário
- Checkbox
- InputSwitch
- SelectButton
- TabMenu
- Paginator
- Tag
- Message
- Toast
- Skeleton
- Tooltip
- Avatar
- Menu
- Sidebar/Drawer
- Chart

A identidade visual continuará sendo Unilog, controlada por tokens e wrappers do projeto.

## 10. Estratégia de componentes

Não espalhar PrimeReact diretamente sem critério por todas as telas.

Preferir wrappers semânticos do projeto para funções reutilizáveis, permitindo:
- consistência visual;
- preservação de comportamento;
- menor acoplamento à biblioteca;
- evolução futura sem reescrever telas.

Exemplos de camadas alvo:
- `components/ui`
- `components/layout`
- `components/forms`
- `components/data-display`
- `components/charts`
- `features/*`

## 11. Design System alvo

Tokens mínimos obrigatórios:

### Marca
- `--brand-primary`
- `--brand-primary-hover`
- `--brand-primary-soft`

### Neutros
- `--ink`
- `--graphite`
- `--muted`
- `--border`
- `--border-soft`
- `--canvas`
- `--surface`
- `--surface-soft`

### Estados
- `--success`
- `--warning`
- `--danger`
- `--info`

Também devem ser padronizados:
- tipografia;
- espaçamento;
- radius;
- sombras;
- tamanhos de controle;
- foco;
- hover;
- disabled;
- selected;
- estados de loading/empty/error.

O vermelho Unilog é cor de marca e não deve significar erro por padrão.

## 12. Responsividade obrigatória

Faixas de referência:
- 1440+;
- 1024–1366;
- 768–1024;
- 320–767.

No mobile:
- sidebar vira drawer;
- respeitar `100dvh` e safe areas;
- touch targets adequados;
- filtros reorganizados;
- tabelas extensas podem virar record cards;
- evitar scroll horizontal essencial;
- dialogs devem adaptar largura/altura;
- charts devem ser fluidos;
- labels não podem sair da viewport;
- ações importantes devem permanecer acessíveis.

## 13. Tabelas

PrimeReact DataTable será adotado onde fizer sentido, com padronização de:
- cabeçalho;
- hover;
- ordenação;
- paginação;
- busca;
- status;
- loading;
- empty state;
- ações.

No mobile, preservar ou melhorar o padrão de cards verticais quando ele for superior a uma tabela horizontalmente rolável.

## 14. Gráficos

Preferir PrimeReact Chart + Chart.js quando o dado tiver semântica de gráfico.

Migrar progressivamente implementações SVG/CSS/canvas manuais quando houver ganho claro.

Regras:
- nenhuma sobreposição de labels;
- nomes longos podem exigir gráfico horizontal;
- tooltip deve carregar texto completo quando houver truncamento;
- usar `autoSkip`, rotação, padding e altura dinâmica quando necessário;
- mobile prioriza legibilidade;
- não usar cores aleatórias sem semântica.

## 15. CSS legado

Não remover CSS em massa.

Fluxo obrigatório:
1. identificar proprietário e consumidores;
2. migrar componente;
3. fazer design system assumir o controle;
4. confirmar que não há consumidores restantes;
5. remover CSS legado.

Pode existir uma folha de transição carregada por último durante a migração, mas ela não pode se transformar em uma coleção permanente de overrides.

## 16. Sequência de execução

1. baseline e documentação;
2. PrimeReact / PrimeIcons / Chart.js;
3. tokens e providers;
4. login / recuperação / MFA;
5. shell, sidebar/drawer, topbar e navegação;
6. componentes compartilhados;
7. Visão Geral;
8. KPIs;
9. Supervisores;
10. Depositantes;
11. Financeiro;
12. FCA;
13. Administração;
14. tabelas e comportamento mobile;
15. gráficos;
16. auditoria completa;
17. remoção gradual de legado;
18. homologação final.

## 17. Matriz de auditoria obrigatória

Antes de concluir a migração, revisar cada tela com as colunas:
- tela;
- status da migração;
- componentes PrimeReact;
- componentes legados;
- CSS legado;
- problemas visuais;
- problemas mobile;
- problemas desktop/notebook;
- ação necessária.

Nenhuma tela é considerada concluída sem essa revisão.

## 18. Critério de tela concluída

Uma tela somente pode ser marcada como concluída quando:
- funcionalidade original estiver preservada;
- regras de negócio não tiverem sido alteradas;
- componentes principais estiverem padronizados;
- desktop/notebook/tablet/mobile estiverem corretos;
- não houver overflow inadequado;
- loading/empty/error estiverem corretos;
- tokens forem usados;
- labels de gráficos não se sobrepuserem;
- não houver visual legado injustificado;
- build e testes passarem no head exato validado;
- preview estiver disponível quando aplicável.

## 19. Git e merge

Regras obrigatórias desta modernização:
- nunca desenvolver diretamente em `main`;
- usar a branch `feature/frontend-modernization-primereact`;
- commits pequenos e descritivos;
- manter um Draft PR durante toda a modernização;
- NÃO fazer merge parcial;
- NÃO fazer merge automático;
- só sair de Draft quando toda a modernização estiver concluída e auditada;
- merge somente após autorização explícita do usuário;
- nunca afirmar que build/test/deploy está verde sem validar o head exato.

## 20. Pendências iniciais

- criar `docs/PRIMEREACT_DESIGN_SYSTEM.md`;
- adicionar dependências PrimeReact, PrimeIcons e Chart.js;
- definir wrappers e provider raiz;
- mapear tokens atuais para os novos nomes sem quebrar consumidores existentes;
- criar estratégia de transição CSS;
- migrar primeiro uma superfície controlada para validar o padrão antes de escalar para todas as telas;
- manter `PROJECT_STATE.md` apenas como documento histórico até sua eventual reconciliação; esta memória passa a ser a fonte de verdade da modernização.
