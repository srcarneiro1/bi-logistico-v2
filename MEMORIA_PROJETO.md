# MEMÓRIA DO PROJETO — BI LOGÍSTICO V2

Última atualização: 2026-09-15

## 1. Objetivo desta memória

Este arquivo é a fonte de verdade da modernização do frontend do BI Logístico V2. Deve ser atualizado ao longo da migração e usado para evitar decisões contraditórias entre etapas, chats e pull requests.

Documentos complementares:
- `docs/PRIMEREACT_DESIGN_SYSTEM.md` — referência visual;
- `docs/EXTRA_COST_CONTROL_C4.puml` — C4 da referência Extra Cost e arquitetura alvo;
- `docs/EXTRA_COST_REFERENCE_AND_BI_MIGRATION_PLAN.md` — comparação, esforço, riscos, benefícios e gates.

## 2. Baseline e Git

Repositório: `srcarneiro1/bi-logistico-v2`

Baseline da migração:
- branch base: `main`;
- commit base: `b004e9c4e400dd289f713ca1464d90ce8b821410`;
- mensagem: `Exclui outras receitas da carteira de depositantes (#68)`.

Branch da modernização:
- `feature/frontend-modernization-primereact`.

Pull request:
- PR #69 — `Modernização frontend: PrimeReact, design system e responsividade`;
- permanece Draft;
- não pode ser mergeado parcialmente ou automaticamente;
- só pode sair de Draft após auditoria/homologação completa;
- merge somente após autorização explícita do usuário.

## 3. Decisão arquitetural aprovada

A modernização NÃO migra o BI para Next.js neste PR.

Arquitetura deste ciclo:
- React 19;
- TypeScript;
- Vite;
- React Router;
- PrimeReact 10.9.9;
- PrimeIcons 7;
- Chart.js 4.5.1 via PrimeReact Chart quando aplicável;
- Design System Unilog alinhado ao Extra Cost Control;
- Cloudflare Pages + Pages Functions preservados;
- Supabase preservado;
- Apps Script / HUB preservados.

O Extra Cost Control é a referência de família visual e de componentes. Isso significa usar PrimeReact como base real da interface, PrimeIcons como biblioteca de ícones e Chart.js/PrimeReact Chart para gráficos, aplicando depois a identidade Unilog. Não significa copiar Next.js ou reproduzir mecanicamente toda a dívida histórica de CSS do Extra Cost.

Uma eventual migração Vite → Next.js fica deferida para iniciativa independente.

## 4. Regra principal de preservação

Esta modernização é de frontend, UX, responsividade, componentes e visual.

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

Qualquer alteração funcional deverá ser tratada separadamente e explicitamente aprovada.

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
- substituições/cobertura;
- governança;
- storage de fotos quando aplicável.

### HUB / Apps Script / Google Sheets
Responsável pela camada operacional e analítica, incluindo supervisores, depositantes, indicadores, metas, KPIs, inventário, receita e despesa.

## 6. Segurança que não pode regredir

- autenticação não equivale a autorização;
- conta no Supabase Auth não concede acesso ao BI por si só;
- secrets de servidor nunca podem ir ao frontend;
- frontend não é fronteira de segurança;
- escopo continua aplicado por backend/RLS conforme o caso;
- substituição respeita titular, módulo e vigência;
- Owner/Admin não ganha escopo analítico indevido por efeito colateral visual;
- tabelas públicas permanecem sob RLS/grants existentes;
- nenhuma `service_role`/secret pode ir para variável pública;
- MFA Owner/Admin mantém AAL/TOTP e foi alterado somente na apresentação.

## 7. Rotas atuais

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

As permissões existentes por OWNER / ADMIN / usuário operacional permanecem.

## 8. Lógica de domínio congelada

Módulos reutilizados sem refatoração funcional:
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

A revisão de changed files do PR #69 em 15/09/2026 confirmou que nenhum desses diretórios/arquivos de domínio foi alterado pela modernização.

## 9. Base PrimeReact consolidada

O BI usa PrimeReact em modo styled, seguindo a mesma base técnica do Extra Cost:
- `lara-light-indigo/theme.css`;
- `primereact.min.css`;
- `primeicons.css`;
- identidade Unilog aplicada por tokens e overrides posteriores.

Não usar `unstyled: true` nesta arquitetura.

Componentes PrimeReact utilizados conforme a necessidade:
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

Componentes de domínio podem continuar customizados quando isso for semanticamente melhor, como cards de carteira, timelines, barras financeiras específicas e record cards mobile.

## 10. Primitives compartilhados atuais

Situação consolidada:
- `Badge` → PrimeReact Tag;
- `Chip` → PrimeReact Tag;
- `SearchField` → PrimeReact InputText + PrimeIcon;
- `MetricCard` → PrimeReact Card;
- `Panel` → PrimeReact Card mantendo wrapper semântico do BI;
- `SummaryMetrics` → PrimeReact Card/Button;
- `PageHeader` → PrimeReact Toolbar;
- `EmptyState` → PrimeIcons;
- `Skeleton` → PrimeReact Skeleton;
- `ContextNotice` → PrimeIcons;
- `SimpleLineChart` → PrimeReact Chart + Chart.js;
- Login/SetPassword → InputText, Password, Button e Message;
- MFA → InputText e Button PrimeReact, sem mudança em AAL/TOTP;
- AppShell → Avatar, Tag, Dropdown, Button e PrimeIcons.

Material Symbols foi removido do runtime principal e a fonte externa deixou de ser carregada em `index.html`. Seletores CSS históricos remanescentes podem ser removidos gradualmente quando comprovadamente mortos, sem abrir novo risco visual.

## 11. Design System consolidado

Tokens alinhados ao Extra Cost:

### Marca
- `--brand-primary: #db0812`;
- `--brand-primary-hover: #b8070f`;
- `--brand-primary-soft: #fdecee`.

### Neutros
- `--ink: #171b24`;
- `--ink-2: #242a36`;
- `--graphite: #494a56`;
- `--graphite-2: #676d77`;
- `--muted: #8a9099`;
- `--border: #e2e5e9`;
- `--border-soft: #edf0f2`;
- `--canvas: #f5f6f8`;
- `--surface: #ffffff`;
- `--surface-soft: #f8f9fb`.

### Estados
- `--success: #3f7c59`;
- `--warning: #a87900`;
- `--danger: #c91a23`;
- info predominantemente neutro/grafite, sem azul decorativo arbitrário.

Geometria:
- controle 10px;
- card 14px;
- dialog 18px;
- sombras discretas;
- focus ring suave;
- controles principais ~42–46px.

O vermelho Unilog é cor de marca e não significa erro por padrão.

## 12. Cards executivos — decisão aprovada

Regra homologada pelo usuário em 15/09/2026:
- cards KPI mantêm cor semântica por status: verde, amarelo ou vermelho;
- não usar faixa vertical grossa à esquerda nos `MetricCard` executivos;
- variações em pontos percentuais (`p.p.`) têm cor própria e independente do card:
  - positivo = verde;
  - negativo = vermelho;
  - zero = neutro/cinza;
- cards de alerta/feedback podem manter tratamentos semânticos específicos quando sua função for explicitamente de estado/callout.

## 13. Filtros

Filtros globais mantêm a semântica original do BI, mas passaram a seguir a anatomia do Extra Cost:
- Card PrimeReact;
- heading da página antes do card de filtros;
- Dropdowns PrimeReact;
- grid responsivo `auto-fit`;
- labels visíveis;
- ação explícita para limpar dimensões;
- uma coluna no mobile quando necessário.

Regras preservadas:
- período normal x período FCA;
- supervisor conforme permissão;
- mudança de supervisor limpa módulo;
- módulo depende do escopo;
- rotas contextuais que não exibem filtros continuam respeitadas.

## 14. Tabelas

Padrão canônico:
- PrimeReact DataTable/Column;
- classe `nx-prime-table`;
- wrapper sem borda/raio próprio dentro dos painéis;
- header de 42px, corpo de 46px e padding 12×14;
- header claro, compacto e uppercase;
- hover e estados de ordenação padronizados;
- Tags/Badges de 24px;
- record cards explícitos no mobile quando superiores ao scroll horizontal.

Telas já migradas:
- KPIs — Performance por depositante;
- Supervisores — carteira da visão 360º;
- Depositantes — base principal;
- Financeiro — despesas consolidadas;
- FCA — listagem principal;
- Administração > Acessos.

Não forçar DataTable em superfícies onde o card é semanticamente melhor, como cartões de supervisores, fotos e coberturas.

## 15. Gráficos

PrimeReact Chart + Chart.js é o padrão para dados com semântica de gráfico.

`SimpleLineChart` foi migrado do SVG artesanal e mantém interface pública/dados dos consumidores. É o único wrapper PrimeReact Chart do BI neste ciclo e atende Home, KPIs e visão 360º de Depositantes.

Padrão consolidado:
- `responsive: true`;
- `maintainAspectRatio: false`;
- stage final de 248px no desktop, 238px em telas intermediárias e 224px no mobile;
- o próprio chart stage é owner do padding, sem padding externo duplicado;
- tooltip grafite/ink com texto branco;
- ticks/grid discretos;
- vermelho/grafite e cores semânticas;
- pontos 2.5px e hover 4px, linha 2px;
- legendas limpas;
- labels longos tratados sem colisão;
- mobile fluido.

Heatmaps/matrizes e visualizações de domínio podem permanecer customizadas quando Chart.js não agregar valor.

## 16. Responsividade

Faixas de referência:
- 1440+;
- 1024–1366;
- 768–1024;
- 320–767.

Padrões implementados:
- sidebar vira drawer em `<=1180px`, alinhado ao breakpoint canônico do Extra Cost;
- `100dvh`/safe areas na autenticação;
- filtros reorganizados;
- grids KPI 4/3/2/1 conforme superfície;
- DataTables extensas viram record cards nas principais telas;
- charts fluidos;
- ações PrimeReact ocupam largura útil no mobile quando necessário, inclusive PageToolbar, EmptyState e DetailHero;
- FCA forms e Admin forms viram uma coluna;
- MFA adapta largura e CTA;
- shell mantém focus trap, Escape, bloqueio de scroll, retorno de foco e fechamento por navegação.

Ainda é obrigatória homologação visual manual em dispositivos/larguras reais antes de sair de Draft.

## 17. Fluxos FCA preservados

Lista, detalhe, novo e edição foram migrados visualmente para PrimeReact.

Controles principais:
- Dropdown;
- InputText;
- InputTextarea;
- Button;
- DataTable;
- PrimeIcons.

Preservado integralmente:
- `deriveFcaDisplayStatus` como fonte de status visual;
- período FCA independente;
- cobertura/substituição;
- snapshot histórico de supervisor/módulo/depositante/indicador;
- criação/edição via funções existentes;
- validações de contexto;
- ações 1:N;
- auditoria;
- rotas e retorno contextual.

Campos que eram `required` em selects nativos foram mantidos obrigatórios nos Dropdowns PrimeReact e continuam protegidos por validações do submit.

## 18. Administração preservada

### Acessos
- filtro → Dropdown;
- tabela → DataTable;
- ações/confirmação → Button + PrimeIcons;
- Owner protegido e regra de governança inalterada;
- mobile → record cards.

### Fotos de supervisores
- cards com avatar preservados;
- upload/remover → Button + PrimeIcons;
- input de arquivo permanece oculto porque é o controle nativo apropriado;
- lógica de Supabase/HUB intacta.

### Substituições
- forms → InputText, Dropdown, Checkbox, Button;
- cards de cobertura preservados;
- `saveSubstitute` / `saveCoverage` inalterados;
- titular, substituto, módulo e período continuam obrigatórios;
- regras de vigência/escopo inalteradas.

## 19. CSS legado

Não remover CSS em massa.

Fluxo:
1. identificar owner/consumidores;
2. migrar componente;
3. design system assume o controle;
4. confirmar consumidores restantes;
5. remover regra morta.

Arquivos de consolidação criados no PR incluem:
- `extra-cost-alignment.css`;
- `extra-cost-final-polish.css`;
- `fca-prime-list.css`;
- `fca-prime-controls.css`;
- `admin-prime.css`;
- `table-final-polish.css`;
- `chart-final-polish.css`;
- `responsive-final-polish.css`.

`src/primereact.css` continua como bridge de compatibilidade. A limpeza final deve ser conservadora e não é motivo para reabrir componentes já homologados visualmente.

## 20. Build/deploy e checkpoints

O projeto não possui `package-lock.json` oficial. O Cloudflare chegou a falhar no `npm install` por erro do Arborist (`Cannot read properties of null (reading 'edgesOut')`) inclusive no baseline.

Mitigação versionada em `.npmrc`:

```ini
legacy-peer-deps=true
fund=false
audit=false
```

Não criar lockfile manualmente. Somente aceitar lockfile gerado por npm real em ambiente confiável.

Checkpoints relevantes comprovadamente verdes durante o PR #69:
- `9227adf` — estabilização da instalação;
- `e382a76` — shell/tokens;
- `8154324` — Chart.js/PrimeReact Chart;
- `6f0ea13594870716c775652e056b858117c832fb` — Home/KPIs com tabela e gráficos padronizados;
- `6209d2bee1b39a170521750a70ea5a1bf0078b49` — Supervisores/Depositantes;
- `94c20411d1665b1bec569fa252802d78b59ed169` — Financeiro/listagem FCA;
- `d7f867517e1b2bc3f940f777e7b6d5c3bc658b0b` — FCA/Admin/MFA;
- `fd9dbd4588c887e55eb50ec92e5108cbf6bc64ee` — auditoria de resíduos, validação obrigatória e feedback global;
- `348ba2d859008704f30761586b635371fc8d4b08` — tabelas e gráficos finais, com GitHub Actions e Cloudflare Pages verdes;
- `c9f08bc75ac2b2690fc6d1737827c7e56c9c8599` — reconciliação responsiva final, com GitHub Actions e Cloudflare Pages verdes.

Preview verde do checkpoint responsivo `c9f08bc`:
- `https://8d6ca432.bi-logistico-v2.pages.dev`
- branch preview: `https://feature-frontend-modernizati.bi-logistico-v2.pages.dev`

O workflow GitHub Actions `test-and-build` está ativo e foi comprovadamente executado nos checkpoints finais. Ele instala dependências, executa `npm test` e depois `npm run build`. O Vitest foi efetivamente executado com sucesso, incluindo os testes de filtros de dashboard e cobertura/HUB existentes no repositório. O Cloudflare Pages também executa o build e permanece como gate adicional de deploy/preview.

Nunca inferir sucesso futuro desses resultados: build/test/deploy devem ser revalidados no head exato após qualquer novo commit.

## 21. Estado atual da modernização

Concluído tecnicamente no branch:
1. diagnóstico/C4/plano;
2. Gate 0 npm/Cloudflare;
3. PrimeReact styled + PrimeIcons + Chart.js;
4. design tokens e shell;
5. Login / primeiro acesso / redefinição;
6. filtros globais;
7. Home;
8. KPIs;
9. Supervisores;
10. Depositantes;
11. Financeiro;
12. FCA lista/detalhe/novo/edição;
13. Administração (Acessos, Fotos, Substituições);
14. MFA visual;
15. estados globais/loading/error;
16. tabelas principais + record cards mobile;
17. gráficos comuns;
18. remoção da dependência runtime de Material Symbols;
19. auditoria de changed files sem backend/domínio;
20. padronização final de tabelas e gráficos;
21. reconciliação responsiva final de shell e ações PrimeReact;
22. execução comprovada de Vitest/build no GitHub Actions e deploy no Cloudflare.

Pendente antes de sair de Draft:
- homologação visual/funcional manual do preview atual em desktop/notebook/tablet/mobile;
- smoke funcional manual dos fluxos principais, especialmente FCA e Administração;
- checar mergeabilidade real contra `main` no head final e resolver apenas conflitos reais;
- reconciliar documentação apenas se novas correções de homologação forem necessárias;
- autorização explícita do usuário para tirar o PR de Draft;
- autorização explícita separada para merge.

## 22. Matriz de homologação final

Validar no preview, sem alterar regra:

| Superfície | O que verificar |
|---|---|
| Login/SetPassword | alinhamento de ícones, responsividade, primeiro acesso, recuperação |
| Shell | sidebar desktop/mobile, topbar, focus/ESC, logout |
| Filtros | Período/Supervisor/Módulo, limpar dimensões, FCA período próprio |
| Home | cards sem rail, cores semânticas, p.p. por sinal, chart, financeiro |
| KPIs | cards, inventário, Chart.js, DataTable, mobile records |
| Supervisores | cards de carteira, visão 360º, DataTable, FCA pendentes |
| Depositantes | busca, DataTable/mobile, 360º, chart, financeiro/FCA |
| Financeiro | consolidado, outras receitas, exceção de despesas, DataTable |
| FCA lista | busca/status/período, DataTable/mobile, navegação |
| FCA novo/edição | required, histórico, ações 1:N, cobertura, salvar/cancelar |
| FCA detalhe | status derivado, ações, auditoria, retorno contextual |
| Admin Acessos | Owner/Admin, filtro, confirmação, DataTable/mobile |
| Admin Fotos | upload/substituição/remoção e fallback HUB |
| Admin Substituições | cadastro, cobertura, módulo, vigência, edição |
| MFA | setup/challenge AAL2 sem regressão |

## 23. Git e merge

Regras obrigatórias:
- nunca desenvolver diretamente em `main`;
- usar `feature/frontend-modernization-primereact`;
- commits pequenos e auditáveis;
- PR #69 permanece Draft durante homologação;
- NÃO fazer merge parcial;
- NÃO fazer merge automático;
- só sair de Draft após auditoria e autorização explícita;
- merge somente após nova autorização explícita;
- nunca afirmar build/test/deploy verde sem validar o head exato.

Preview não é produção. O merge em `main` é ação de release.