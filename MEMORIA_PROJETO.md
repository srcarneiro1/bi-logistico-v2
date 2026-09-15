# MEMÓRIA DO PROJETO — BI LOGÍSTICO V2

Última atualização: 2026-09-15

## 1. Objetivo desta memória

Este arquivo é a fonte de verdade da modernização do frontend do BI Logístico V2. Ele deve ser atualizado ao longo da migração e usado para evitar decisões contraditórias entre etapas, chats e pull requests.

Documentos complementares obrigatórios:
- `docs/PRIMEREACT_DESIGN_SYSTEM.md` — fonte de verdade visual;
- `docs/EXTRA_COST_CONTROL_C4.puml` — C4 da referência Extra Cost e arquitetura alvo;
- `docs/EXTRA_COST_REFERENCE_AND_BI_MIGRATION_PLAN.md` — comparação, esforço, riscos, benefícios e gates.

## 2. Baseline confirmado

Repositório: `srcarneiro1/bi-logistico-v2`

Baseline da migração:
- branch base: `main`
- commit base: `b004e9c4e400dd289f713ca1464d90ce8b821410`
- mensagem do commit base: `Exclui outras receitas da carteira de depositantes (#68)`

Branch da modernização:
- `feature/frontend-modernization-primereact`

Pull request:
- PR #69 — `Modernização frontend: PrimeReact, design system e responsividade`
- deve permanecer Draft até a conclusão integral da modernização;
- não pode ser mergeado parcialmente ou automaticamente.

## 3. Decisão arquitetural aprovada

A modernização NÃO migrará o BI para Next.js neste PR.

Arquitetura alvo deste ciclo:
- React
- TypeScript
- Vite
- React Router
- PrimeReact 10.9.9
- PrimeIcons 7
- Chart.js 4.5.1, preferencialmente via PrimeReact Chart
- Design System próprio Unilog, alinhado ao Extra Cost Control
- Cloudflare Pages + Pages Functions mantidos
- Supabase mantido
- Apps Script / HUB mantidos

O Extra Cost Control é a referência visual e estrutural para componentes, charts, densidade, shell e responsividade, mas não deve ser copiado mecanicamente. O ganho principal vem de PrimeReact + Chart.js + wrappers + design system. O Next.js no Extra Cost é uma decisão de framework independente e não justifica ampliar o raio de risco do BI, que possui malha de rotas reais e rotas dinâmicas de FCA.

Uma eventual migração Vite → Next.js fica deferida para iniciativa independente, após a camada de apresentação estar consolidada.

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
- Sidebar/Drawer quando trouxer ganho real
- Chart

A identidade visual continuará sendo Unilog, controlada por tokens e wrappers do projeto.

Não substituir um componente customizado apenas para aumentar a contagem de PrimeReact. Componentes executivos, heatmaps, matrizes, record cards e estruturas sem equivalente melhor podem continuar customizados.

## 10. Estratégia de componentes

Não espalhar PrimeReact diretamente sem critério por todas as telas.

Preferir wrappers semânticos do projeto para funções reutilizáveis, permitindo:
- consistência visual;
- preservação de comportamento;
- menor acoplamento à biblioteca;
- evolução futura sem reescrever telas.

Wrappers já em modernização:
- `Badge` → PrimeReact Tag mantendo API do BI;
- `Chip` → PrimeReact Tag mantendo API do BI;
- `SearchField` → PrimeReact InputText mantendo API do BI;
- autenticação → InputText, Password, Button e Message;
- shell → Avatar, Tag e Dropdown;
- `SimpleLineChart` → PrimeReact Chart + Chart.js mantendo props e consumidores.

`Panel` continua customizado neste momento porque o BI usa semântica HTML (`article`, `section`, `div`) e não há ganho em eliminar essa semântica apenas para usar `Card`. A decisão pode ser revista por superfície, sem reescrita indiscriminada.

## 11. Design System alvo

Tokens canônicos alinhados à referência Extra Cost:

### Marca
- `--brand-primary: #db0812`
- `--brand-primary-hover: #b8070f`
- `--brand-primary-soft: #fdecee`

### Neutros
- `--ink: #171b24`
- `--ink-2: #242a36`
- `--graphite: #494a56`
- `--graphite-2: #676d77`
- `--muted: #8a9099`
- `--border: #e2e5e9`
- `--border-soft: #edf0f2`
- `--canvas: #f5f6f8`
- `--surface: #ffffff`
- `--surface-soft: #f8f9fb`

### Estados
- `--success: #3f7c59`
- `--warning: #a87900`
- `--danger: #c91a23`
- `--info`: neutro/grafite, não azul decorativo

Também estão padronizados:
- radius de controle 10px;
- radius de card 14px;
- radius de dialog 18px;
- sombras discretas;
- focus ring vermelho suave;
- tamanhos de controle;
- spacing;
- aliases legados preservados durante a transição.

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

O shell já mantém focus trap, Escape, bloqueio de scroll do body, retorno de foco e fechamento por navegação existentes.

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

Não migrar tabelas em massa antes de definir a estratégia DataTable → record card para cada superfície.

## 14. Gráficos

Preferir PrimeReact Chart + Chart.js quando o dado tiver semântica de gráfico.

`SimpleLineChart` já foi migrado de SVG artesanal para PrimeReact Chart + Chart.js sem alterar sua interface pública nem os dados fornecidos por Home, KPIs e Depositantes.

Regras:
- nenhuma sobreposição de labels;
- nomes longos podem exigir gráfico horizontal;
- tooltip deve carregar texto completo quando houver truncamento;
- usar `autoSkip`, rotação, padding e altura dinâmica quando necessário;
- mobile prioriza legibilidade;
- não usar cores aleatórias sem semântica;
- heatmaps e matrizes podem continuar customizados;
- a antiga tonalidade `blue` da API legada do chart é renderizada como cinza intermediário para eliminar azul decorativo sem quebrar consumidores.

## 15. CSS legado

Não remover CSS em massa.

Fluxo obrigatório:
1. identificar proprietário e consumidores;
2. migrar componente;
3. fazer design system assumir o controle;
4. confirmar que não há consumidores restantes;
5. remover CSS legado.

`src/primereact.css` permanece como bridge carregada por último durante a transição. Ela não deve se transformar em coleção indefinida de exceções; regras devem ser consolidadas e removidas quando o owner final estiver estabelecido.

## 16. Build e deploy — Gate 0

O projeto não possuía `package-lock.json` e o Cloudflare passou a falhar antes do build em `npm install`, com erro do Arborist `Cannot read properties of null (reading 'edgesOut')`.

Foi comprovado que o problema não nasceu da modernização: o baseline `b004e9c` falhou com a mesma árvore que já havia sido implantada com sucesso anteriormente.

Mitigação versionada aplicada em `.npmrc`:

```ini
legacy-peer-deps=true
fund=false
audit=false
```

Após essa mitigação, o Cloudflare voltou a instalar dependências, executar o build e publicar previews.

Heads já comprovadamente verdes após o Gate 0:
- `9227adf` — estabilização da instalação;
- `e382a76` — shell/tokens modernizados;
- `5ff96d7` — Badge em PrimeReact Tag;
- `8154324` — `SimpleLineChart` em PrimeReact Chart + Chart.js.

Ainda não existe lockfile oficial. Isso permanece como dívida de reprodutibilidade e deve ser resolvido somente com lockfile gerado por npm real, nunca manualmente inventado.

## 17. Sequência de execução atualizada

1. diagnóstico, C4 e memória — concluído;
2. Gate 0 do Cloudflare/npm — mitigado e validado;
3. PrimeReact / PrimeIcons / Chart.js — dependências e provider concluídos;
4. tokens e bridge PrimeReact — fundação concluída, continuará refinamento;
5. login / recuperação — primeira migração concluída;
6. shell/sidebar/topbar — primeira migração concluída;
7. filtros globais — migração para Dropdown em validação;
8. componentes compartilhados — Badge, Chip e SearchField em andamento;
9. charts comuns — `SimpleLineChart` concluído tecnicamente;
10. Visão Geral e KPIs — próxima onda visual;
11. Supervisores e Depositantes;
12. Financeiro;
13. FCA;
14. Administração;
15. DataTable / formulários / dialogs por superfície;
16. auditoria mobile/desktop completa;
17. limpeza gradual do legado;
18. homologação final e smoke test.

## 18. Matriz de auditoria obrigatória

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

## 19. Critério de tela concluída

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

## 20. Git e merge

Regras obrigatórias desta modernização:
- nunca desenvolver diretamente em `main`;
- usar a branch `feature/frontend-modernization-primereact`;
- commits pequenos e descritivos;
- manter o PR #69 em Draft durante toda a modernização;
- NÃO fazer merge parcial;
- NÃO fazer merge automático;
- só sair de Draft quando toda a modernização estiver concluída e auditada;
- merge somente após autorização explícita do usuário;
- nunca afirmar que build/test/deploy está verde sem validar o head exato.

Cada push da branch pode gerar Preview no Cloudflare. Isso não equivale a produção. O merge em `main` é tratado como ação de release e permanece bloqueado até homologação completa.

## 21. Próximos gates

- validar o head mais recente após Dropdown/Chip/SearchField;
- padronizar wrappers PrimeReact restantes somente onde houver ganho real;
- iniciar migração controlada das tabelas, preservando record cards mobile;
- migrar formulários e dialogs por fluxo, sem alterar regras;
- revisar os demais charts artesanais e barras CSS;
- executar matriz de auditoria completa;
- reconciliar/remover CSS legado somente após último consumidor;
- gerar lockfile real quando houver ambiente npm confiável;
- validar build/test/preview no head final;
- solicitar autorização explícita antes do merge.
