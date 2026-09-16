# MEMÓRIA DO PROJETO — BI LOGÍSTICO V2

Última atualização: 2026-09-16
Estado: **modernização frontend concluída, homologada e consolidada em produção**.

## 1. Finalidade desta memória

Este arquivo é a fonte de verdade **funcional, arquitetural e de release** do BI Logístico V2.

Usar esta memória para:
- preservar regras de negócio;
- preservar segurança, autenticação e autorização;
- registrar releases e decisões arquiteturais;
- evitar reabrir fluxos já homologados;
- retomar o projeto em novos chats.

### Memória visual separada

Toda decisão de identidade visual, UX, responsividade, componentes, filtros, cards, tabelas, gráficos, loading, MFA visual, navegação visual e comportamento mobile deve ser registrada em:

- `MEMORIA_IDENTIDADE_VISUAL.md`

**A partir de agora, novas decisões visuais/UX vão para essa memória separada.**

Este arquivo só deve repetir uma decisão visual quando ela tiver impacto funcional, arquitetural ou de segurança.

## 2. Repositório e estado atual

Repositório:
- `srcarneiro1/bi-logistico-v2`.

Branch de produção:
- `main`.

Estado consolidado após as modernizações e auditorias finais:
- PR #69 — modernização principal PrimeReact/UX;
- PR #70 — consolidação documental inicial;
- PR #71 — padronização final de filtros FCA/Acessos e auditoria geral;
- PR #72 — paridade final do drawer mobile com Extra Cost.

Commit de merge do PR #72:
- `dacd0f6bbeaab5124035e8e9a6356ee4b380d7a1`.

Este commit é a referência funcional/visual de produção imediatamente anterior à reorganização documental desta memória.

## 3. Arquitetura oficial

A modernização **não migrou o BI para Next.js**.

Arquitetura atual:
- React 19;
- TypeScript;
- Vite;
- React Router;
- PrimeReact 10.9.9;
- PrimeIcons 7;
- Chart.js 4.5.1 via PrimeReact Chart;
- Cloudflare Pages + Pages Functions;
- Supabase;
- HUB / Apps Script / Google Sheets.

Uma eventual migração Vite → Next.js deve ser tratada como iniciativa separada.

## 4. Regra principal de preservação

Mudança visual não autoriza mudança de domínio.

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
- política de secrets.

## 5. Arquitetura funcional

### Frontend
- React + TypeScript + Vite;
- React Router;
- Supabase client com chave publicável no browser.

### Backend/BFF
- Cloudflare Pages Functions;
- validação de JWT;
- autorização e escopo server-side;
- bootstrap da HUB;
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
Responsável por:
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
- conta no Supabase Auth não concede acesso ao BI automaticamente;
- secrets de servidor nunca vão para o frontend;
- frontend não é fronteira de segurança;
- escopo continua aplicado por backend/RLS conforme o caso;
- substituição respeita titular, módulo e vigência;
- Owner/Admin não ganha escopo analítico indevido;
- nenhuma `service_role`/secret pode ir para variável pública;
- MFA Owner/Admin mantém AAL/TOTP;
- alterações de MFA realizadas na modernização foram apenas de apresentação.

Fluxo preservado:
1. Supabase Auth;
2. frontend chama `/api/hub/bootstrap` com JWT;
3. Function valida JWT;
4. servidor resolve HUB + cobertura gerenciada;
5. escopo é aplicado server-side;
6. frontend recebe apenas o que pode apresentar.

## 7. Rotas oficiais

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

Permissões OWNER / ADMIN / usuário operacional permanecem conforme as regras existentes.

## 8. Domínio congelado

Módulos de domínio preservados:
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

Exceção de frontend:
- `src/lib/navigationContext.ts` gerencia retorno contextual entre telas; isso é navegação/UI, não regra de domínio.

## 9. Navegação contextual — comportamento funcional

Ao abrir um depositante a partir de outra tela, preservar origem.

Fluxos:
- Home → Depositante → Voltar para Visão geral;
- KPIs → Depositante → Voltar para KPIs;
- Supervisores → Depositante → Voltar para Supervisores e reabrir o mesmo supervisor;
- Financeiro → Depositante → Voltar para Financeiro;
- Depositante → FCA → Depositante preserva contexto anterior;
- entrada direta por menu em Depositantes não inventa origem.

Não substituir por `history.back()` como solução principal.

## 10. Regras funcionais de Depositantes

Quando a tela de Supervisores monta a carteira:
- considerar somente depositantes cadastrados do supervisor que tenham dados operacionais ou de inventário no período/escopo atual;
- depositante sem dado no período não deve aparecer nessa carteira;
- isso é filtro de apresentação, não exclusão de cadastro/base.

Financeiro:
- uma linha de receita só pode abrir um Depositante 360º quando houver vínculo inequívoco com depositante cadastrado.

## 11. Financeiro — invariantes críticas

Regra para despesa consolidada:

`hub.profile.perfil === 'ADMIN' && !filters.supervisorId && !filters.moduloId`

Motivo:
- `fDespesa` não possui as dimensões necessárias para combinar despesa consolidada com receita filtrada.

Preservar:
- diferença negativa de despesa → `text-crit`;
- diferença não negativa → `text-ok`;
- `OUTRAS RECEITAS OPERACIONAIS` não entra como carteira operacional de depositante.

## 12. FCA — invariantes funcionais

Preservar:
- `deriveFcaDisplayStatus` como fonte do status visual;
- período FCA independente do período operacional;
- snapshot histórico;
- ações 1:N;
- auditoria;
- criação/edição pelas funções existentes;
- validações;
- cobertura/substituição;
- retorno contextual;
- ações canceladas não são apagadas quando a regra é cancelamento;
- vencidos excluem cancelados/concluídos conforme lógica existente.

## 13. Administração — regras funcionais

### Acessos
- Owner permanece protegido;
- perfil operacional e autoridade administrativa continuam dimensões independentes;
- conceder Admin não altera escopo logístico da HUB.

### Fotos de supervisores
- upload/remover mantém regras existentes;
- lógica Supabase/HUB intacta.

### Substituições
Funções preservadas:
- `saveSubstitute`;
- `saveCoverage`;
- `coverageToForm`.

Regras:
- titular obrigatório;
- substituto obrigatório;
- módulo obrigatório;
- data inicial/final obrigatórias;
- escopo e vigência permanecem inalterados;
- reorganização visual não alterou persistência.

## 14. Autenticação e MFA

MFA Owner/Admin usa Supabase AAL/TOTP.

Chamadas preservadas:
- `getAuthenticatorAssuranceLevel()`;
- `listFactors()`;
- `enroll()`;
- `unenroll()` para fatores pendentes;
- `challengeAndVerify()`.

Não alterar comportamento de segurança para atender demanda estética.

## 15. CI e deploy

`.npmrc` versionado:

```ini
legacy-peer-deps=true
fund=false
audit=false
```

Workflow GitHub Actions `test-and-build`:
- checkout;
- Node 22;
- `npm install --no-audit --no-fund`;
- `npm test`;
- `npm run build`.

Regra de merge:
- validar o head exato em CI;
- validar o mesmo head no Cloudflare Preview;
- homologação visual quando houver mudança de UX;
- merge somente com autorização explícita.

Existe warning conhecido de bundle principal acima de 500 kB. Tratar code splitting/performance em projeto separado; não misturar com correção visual pequena.

## 16. Histórico de releases recentes

### PR #69 — Modernização frontend
- título: `Modernização frontend: PrimeReact, design system e responsividade`;
- head final homologado: `3d7fd5bacc966ab7e28359416e58dd9ff1b4b01c`;
- merge commit: `249676abfdff39aa0857be28cf4f2e956897d067`;
- resultado: modernização principal concluída.

### PR #70 — Memória inicial pós-modernização
- merge commit: `b7dda7418485c42c30cfd692f7907d4b0839a6cf`;
- resultado: consolidação documental inicial.

### PR #71 — Auditoria visual final
- correções principais:
  - filtros FCA/Acessos padronizados;
  - hover falso removido em receitas não navegáveis;
  - focus de Novo/Editar FCA alinhado;
- merge commit: `e0f30143ece8346e696138b03cc911cf35dab431`.

### PR #72 — Paridade do drawer mobile
- objetivo: igualar shell mobile ao Extra Cost;
- mantém recursos adicionais de acessibilidade do BI;
- merge commit: `dacd0f6bbeaab5124035e8e9a6356ee4b380d7a1`.

## 17. Fonte de verdade visual

Consultar obrigatoriamente:
- `MEMORIA_IDENTIDADE_VISUAL.md`.

Ela contém:
- tokens;
- tipografia;
- shell;
- drawer mobile;
- filtros;
- cards;
- tabelas;
- gráficos;
- interações;
- responsividade;
- loading;
- MFA visual;
- padrões por tela;
- processo para futuras mudanças visuais.

A partir de 16/09/2026, **não registrar novas decisões visuais extensas neste arquivo**.

## 18. Processo para novas evoluções

1. partir de `main` atual;
2. criar branch própria;
3. identificar se a demanda é funcional ou visual;
4. se visual, consultar e atualizar `MEMORIA_IDENTIDADE_VISUAL.md` quando houver mudança de padrão;
5. se funcional, validar invariantes deste arquivo;
6. não tocar em backend/domínio sem demanda explícita;
7. executar testes/build;
8. validar Cloudflare no mesmo head;
9. homologar quando necessário;
10. merge somente com autorização explícita.

## 19. Estado de retomada

Ao retomar o projeto em outro chat, considerar:
- `main` pós-PR #72;
- merge commit de referência: `dacd0f6bbeaab5124035e8e9a6356ee4b380d7a1`;
- modernização V1 encerrada;
- auditoria visual final concluída;
- drawer mobile alinhado ao Extra Cost;
- domínio/backend preservados;
- navegação contextual implementada;
- CI existente;
- identidade visual documentada separadamente em `MEMORIA_IDENTIDADE_VISUAL.md`.

Qualquer nova alteração começa a partir deste estado.
