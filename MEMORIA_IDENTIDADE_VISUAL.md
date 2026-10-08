# MEMÓRIA DE IDENTIDADE VISUAL E UX — BI LOGÍSTICO V2

Última atualização: 2026-10-08
Estado: **fonte de verdade visual/UX do BI Logístico V2**.

## 1. Finalidade desta memória

Este arquivo concentra todas as decisões de:
- identidade visual;
- design system;
- UX;
- responsividade;
- interação;
- componentes visuais;
- comportamento mobile;
- padrões de filtros, tabelas, cards e gráficos;
- estados de loading, vazio, erro e autenticação;
- navegação contextual quando ela impacta experiência do usuário.

A partir de agora, **toda nova decisão visual ou de UX deve ser registrada aqui**.

Não duplicar decisões visuais em `MEMORIA_PROJETO.md`, salvo quando uma mudança visual tiver impacto funcional, arquitetural ou de segurança.

Referência principal de identidade: **Extra Cost Control Unilog**.

## 2. Princípios visuais

O BI deve parecer parte da mesma família de produto do Extra Cost Control.

Princípios:
- visual corporativo, sóbrio e operacional;
- vermelho Unilog como cor de marca, não como sinônimo automático de erro;
- superfícies claras, com baixa elevação;
- grafite como base do shell e navegação;
- densidade informacional alta, mas sem aparência apertada;
- hierarquia clara entre leitura executiva, detalhe operacional e ação;
- consistência entre desktop, notebook, tablet e mobile;
- controles PrimeReact devem parecer um único sistema, não componentes isolados;
- evitar “caixas dentro de caixas” sem necessidade;
- evitar dupla borda em controles;
- evitar hover em elementos que não são clicáveis;
- quando algo parece clicável, deve ser clicável;
- foco de teclado deve continuar visível mesmo quando bordas visuais de botão forem removidas.

## 3. Stack visual oficial

- PrimeReact 10.9.9 em modo styled;
- PrimeIcons 7;
- Chart.js 4.5.1 via PrimeReact Chart;
- tema base `lara-light-indigo`;
- identidade Unilog aplicada por tokens e CSS de override;
- tipografia oficial do BI: `Roboto, Arial, Helvetica, sans-serif`.

Não migrar para `unstyled: true` sem projeto separado.

Material Symbols não deve voltar ao runtime principal.

## 4. Tokens oficiais

### Marca
- `--unilog-red: #db0812`;
- `--unilog-red-dark: #b8070f`;
- `--unilog-red-soft: #fdecee`.

### Neutros
- `--unilog-ink: #171b24`;
- `--unilog-ink-2: #242a36`;
- `--unilog-graphite: #494a56`;
- `--unilog-graphite-2: #676d77`;
- `--unilog-muted: #8a9099`;
- `--unilog-border: #e2e5e9`;
- `--unilog-border-soft: #edf0f2`;
- `--unilog-canvas: #f5f6f8`;
- `--unilog-surface: #ffffff`;
- `--unilog-surface-soft: #f8f9fb`.

### Estados
- sucesso: `#3f7c59`;
- atenção: `#a87900`;
- perigo: `#c91a23`.

### Geometria
- radius de card: 14px;
- radius de controle: 10px;
- dialogs/editors: aproximadamente 18px;
- controles principais: aproximadamente 42–46px de altura;
- sombras discretas;
- focus ring suave em vermelho Unilog.

## 5. Shell e navegação

### Desktop
- sidebar grafite em gradiente `#171b24 → #202632`;
- largura expandida ~244px;
- largura recolhida ~72px;
- item ativo com fundo grafite mais claro e rail vermelho à esquerda;
- ícones PrimeIcons;
- topbar branca/translúcida com border inferior leve.

### Status superior
- usar ponto verde + texto **Base conectada**;
- não usar “HUB conectada” como texto final visível;
- em telefone o status pode ser omitido para preservar espaço do título.

### Mobile drawer — padrão final pós-PR #72

Breakpoint principal:
- `<=1180px`.

Comportamento oficial:
- drawer lateral;
- largura alvo 276px;
- proteção para viewports muito estreitos;
- altura `100dvh`;
- respeitar `safe-area-inset-bottom`;
- marca fixa no topo;
- usuário/logout fixos na parte inferior;
- **somente a navegação interna rola**;
- `.sidebar-nav` deve usar `flex:1`, `min-height:0`, `overflow-y:auto` e `overscroll-behavior:contain`;
- não colocar `overflow-y:auto` no drawer inteiro;
- backdrop cobrindo o restante da tela;
- bloquear scroll do `body` enquanto o drawer estiver aberto;
- fechar com Escape;
- manter focus trap dentro do drawer;
- ao fechar, devolver foco ao botão de abertura;
- fechar automaticamente ao navegar.

Esse comportamento deve permanecer alinhado ao Extra Cost, preservando os recursos de acessibilidade adicionais do BI.

## 6. Page header

Estrutura:
- eyebrow em uppercase;
- título principal forte;
- descrição curta;
- ações à direita no desktop;
- ações em largura adequada no mobile.

Evitar títulos redundantes com o breadcrumb/topbar.

## 7. Cards

### Card base
- PrimeReact Card sempre que a superfície representa uma entidade, resumo ou bloco de conteúdo relevante;
- radius 14px;
- border fina;
- sombra discreta;
- evitar faixas laterais grossas como owner visual.

### KPI / métrica
- PrimeReact Card;
- fundo semântico verde/amarelo/vermelho quando aplicável;
- sem rail lateral grosso;
- label pequeno e uppercase;
- valor principal forte;
- detalhe/meta abaixo;
- variação em p.p. independente do tom do card:
  - positivo = verde;
  - negativo = vermelho;
  - zero = neutro.

### Cards selecionáveis FCA
- seleção = borda vermelha + ring vermelho;
- fundo semântico continua preservado;
- hover só atua em card não selecionado;
- selecionado deve permanecer selecionado durante hover e active;
- mobile: 2 colunas em larguras intermediárias e 1 coluna abaixo de 480px.

### Entity cards
Exemplos:
- carteiras de supervisor;
- fotos administrativas;
- coberturas;
- resumo financeiro.

Usar `PrimeReact Card` como owner da superfície sempre que aplicável.

## 8. Filtros

### Padrão global
Usar:
- PrimeReact Card;
- `nx-dashboard-filter-grid`;
- `nx-field`;
- Dropdown PrimeReact;
- labels visíveis;
- uma única moldura por controle.

Regras:
- o `p-dropdown` externo é o owner da borda;
- `p-dropdown-label.p-inputtext` não pode desenhar borda interna;
- valor com peso regular;
- labels compactos;
- focus vermelho somente na moldura externa;
- desktop com grid fluido;
- mobile em 1 coluna;
- ação `Limpar dimensões` em botão explícito.

### Filtros locais
Se houver **busca + dimensão/status**, seguir o mesmo padrão visual dos filtros globais.

Aplicado em:
- FCA: Busca + Status;
- Administração > Acessos: Busca + Governança.

Se houver **apenas busca de lista**, `PageToolbar` pode permanecer; não transformar artificialmente tudo em card de filtro.

Exemplos intencionais:
- Depositantes — busca;
- Fotos de supervisores — busca.

## 9. Inputs, Dropdowns e focus

- altura principal ~42–48px conforme contexto;
- radius 10px;
- border `#d9dde3` ou token equivalente;
- hover com border levemente mais forte;
- focus vermelho Unilog;
- ring suave vermelho;
- sem dupla borda;
- estados disabled em superfície suave e opacidade moderada.

Novo/Editar FCA seguem o mesmo focus vermelho dos demais formulários.

## 10. Botões

### Primário
- vermelho Unilog;
- texto branco;
- forte hierarquia.

### Secundário
- outlined ou text conforme importância;
- borda neutra;
- hover discreto.

### Ações destrutivas
- não usar vermelho apenas por coerência de marca; considerar semântica da ação.

### Mobile
- ações principais podem ocupar 100% da largura quando isso melhora toque e leitura;
- não forçar botão full-width quando a ação é apenas utilitária e cabe melhor inline.

## 11. Tabelas

Padrão oficial `nx-prime-table`:
- PrimeReact DataTable / Column;
- wrapper sem border/radius extra;
- cabeçalho ~42px;
- linhas ~46px;
- padding aproximado 12x14;
- cabeçalho claro e uppercase;
- fonte compacta;
- hover discreto;
- Tags/Badges compactos;
- sem visual de tabela pesada.

Telas padronizadas:
- KPIs;
- Supervisores 360º;
- Depositantes;
- Financeiro — despesas;
- FCA;
- Administração > Acessos.

### Mobile
Quando tabela horizontal for ruim para uso em telefone:
- substituir visualmente por record cards;
- preservar a mesma informação;
- não forçar scroll horizontal por padrão.

## 12. Linhas e cards clicáveis

Regra principal:
- quando uma linha/card representa um depositante, a linha/card inteira deve abrir o 360º;
- o nome pode continuar destacado, mas não pode ser o único alvo de clique.

Aplicado em:
- Home > Pontos de atenção;
- KPIs;
- Supervisores;
- Depositantes;
- Financeiro quando houver vínculo inequívoco com um depositante.

Não aplicar hover de ação em linha sem navegação.

O nome do depositante não deve exibir caixa/borda de botão.

FCA não segue essa regra porque a linha representa um FCA.

## 13. Navegação contextual

Ao abrir detalhe a partir de outra tela, preservar origem sempre que isso melhora fluxo.

Fluxos homologados:
- Home → Depositante → Voltar para Visão geral;
- KPIs → Depositante → Voltar para KPIs;
- Supervisores → Depositante → Voltar para Supervisores e reabrir supervisor;
- Financeiro → Depositante → Voltar para Financeiro;
- Depositante → FCA → Depositante preserva contexto anterior;
- entrada direta pelo menu em Depositantes mantém apenas `Fechar visão`.

Não usar `history.back()` como solução principal para esses fluxos.

## 14. Gráficos

Wrapper oficial:
- `SimpleLineChart`;
- PrimeReact Chart + Chart.js.

Configuração visual/interativa:
- `responsive: true`;
- `maintainAspectRatio: false`;
- `animation: false`;
- `interaction: { mode: 'index', intersect: false }`;
- tooltip grafite/ink;
- tooltip deve mostrar todas as séries do mesmo período ao passar o mouse;
- pontos ~2.5px;
- hover ~4px;
- linha ~2–2.5px;
- grid e ticks discretos;
- Roboto;
- paleta Unilog/semântica;
- legendas interativas.

Stage aproximado:
- desktop: 248px;
- intermediário: 238px;
- mobile: 224px.

Não voltar para `nearest` quando houver múltiplas séries comparáveis.

## 15. Paleta de gráficos

- ink: `#242a36`;
- graphite: `#494a56`;
- graphite soft: `#8b9099`;
- red: `#db0812`;
- grid: `#eceef1`;
- text: `#5f636b`;
- muted: `#858a93`;
- planned: `#d7dbe0`.

Evitar paletas azuis arbitrárias fora do design system.

## 16. Home

Padrões finais:
- resumo executivo compacto;
- cards contextuais com hierarquia clara;
- equalização de altura de blocos vizinhos quando aplicável;
- gráfico e coluna lateral visualmente equilibrados;
- Pontos de atenção realmente clicáveis;
- status `Base conectada` no header desktop/tablet.

## 17. Supervisores

- cards de supervisores em PrimeReact Card;
- seleção clara;
- carteira detalhada em DataTable + record cards mobile;
- linha/card inteira do depositante clicável;
- nome sem borda de botão;
- depositantes sem dado operacional/inventário no período não aparecem na carteira da tela.

## 18. Depositantes

- tabela principal padronizada;
- linha/card inteira clicável;
- nome como ação textual sem moldura;
- 360º com retorno contextual;
- gráficos com tooltip agregado por período.

## 19. Financeiro

- resumo principal em PrimeReact Card;
- receita clicável somente quando existe vínculo real com depositante;
- linha não clicável não recebe hover interativo;
- despesas em DataTable desktop e record cards mobile.

## 20. FCA

### Lista
- filtros no padrão global;
- DataTable desktop;
- record cards mobile;
- cards de status selecionáveis no padrão vermelho de seleção.

### Novo/Editar
- inputs, Dropdowns e Textarea com focus vermelho;
- grids responsivos;
- mobile em uma coluna;
- manter clareza entre etapas e ações.

## 21. Administração

### Acessos
- filtros no padrão global;
- Busca + Governança;
- DataTable desktop;
- record cards mobile.

### Fotos de supervisores
- busca em PageToolbar é intencional;
- cards PrimeReact;
- Avatar e ações PrimeReact;
- input de arquivo nativo permanece oculto.

### Substituições
Padrão final:
- consulta primeiro;
- cadastro/edição sob demanda;
- não abrir com dois formulários grandes simultaneamente;
- ações explícitas `Novo substituto` e `Nova cobertura`;
- um editor por vez;
- lista compacta de substitutos;
- cards de cobertura com Titular → Substituto, módulo, período, status e motivo;
- mobile em coluna única.

## 22. Loading / boot

Tela homologada:
- viewport fixo;
- `100dvh`;
- `overflow:hidden`;
- sem scroll/rubber-band desnecessário no mobile;
- safe-area respeitada;
- identidade enxuta.

Branding:
- logo Unilog Express;
- texto `BI LOGÍSTICO` apenas uma vez;
- não repetir `UNILOG EXPRESS` em texto separado;
- não repetir `Carregando BI Logístico` abaixo do branding.

Mensagens:
- `ACESSO SEGURO` / `Validando seu acesso`;
- `SINCRONIZANDO DADOS` / `Preparando seu ambiente`.

## 23. MFA

Apresentação final:
- PrimeReact Card;
- ícone/bloco visual de segurança;
- título `Confirme sua identidade`;
- OTP centralizado;
- CTA principal dominante;
- `Sair da conta` secundário;
- nota de segurança discreta.

Alterações visuais não devem alterar lógica AAL/TOTP.

## 24. Estados vazios, erros e avisos

- preferir componentes PrimeReact/PrimeIcons;
- evitar ilustrações ou elementos decorativos excessivos;
- mensagem curta;
- ação clara quando existir;
- sem texto técnico desnecessário para o usuário final;
- feedback deve usar cor semântica, não apenas vermelho de marca.

## 25. Responsividade

Breakpoints relevantes já consolidados:
- shell/drawer: 1180px;
- filtros: 720px para 1 coluna;
- diversos record cards/telas: 760px;
- ações de detalhe: ~560px;
- refinamentos de telefone: 480px.

Princípios:
- evitar overflow horizontal global;
- permitir scroll horizontal somente em estruturas matriciais onde isso for superior, como heatmap;
- DataTable extensa → record cards no telefone;
- formulários → 1 coluna no telefone;
- ações principais com área de toque confortável;
- respeitar safe areas do iOS.

## 26. Acessibilidade visual/interativa

Preservar:
- `focus-visible` claro;
- focus trap no drawer;
- Escape em overlay/drawer quando aplicável;
- retorno de foco ao elemento que abriu o drawer;
- labels visíveis em filtros;
- `aria-pressed` em cards selecionáveis;
- tabela `sr-only` de apoio nos gráficos;
- não remover focus apenas para “ficar bonito”.

## 27. CSS e ownership

Não corrigir inconsistência visual apenas empilhando overrides sem identificar o owner.

Fluxo preferido:
1. identificar componente e owner da superfície;
2. confirmar DOM PrimeReact real;
3. corrigir estrutura quando necessário;
4. aplicar CSS específico em camada final;
5. validar desktop + mobile;
6. remover CSS morto somente quando comprovado.

Camadas relevantes do projeto:
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
- owners específicos de cada página.

`primereact.css` continua como bridge de compatibilidade.

## 28. O que NÃO fazer

- não recriar Material Symbols;
- não criar nova paleta arbitrária;
- não usar azul como cor principal só porque é default PrimeReact;
- não criar segunda borda dentro de Dropdown;
- não usar rail lateral grosso em todos os cards;
- não usar hover em elemento sem ação;
- não deixar nome de depositante com caixa de botão;
- não forçar tabela horizontal no telefone quando record card for melhor;
- não esconder focus de teclado;
- não alterar domínio para resolver aparência;
- não reabrir padrões já homologados sem necessidade real.

## 29. Processo para novas mudanças visuais

Toda nova mudança visual deve seguir:
1. criar branch própria;
2. comparar com esta memória e, quando necessário, com Extra Cost Control;
3. implementar de forma incremental;
4. validar CI + Cloudflare no mesmo head;
5. homologar visualmente;
6. merge somente com autorização explícita;
7. **atualizar este arquivo quando a mudança criar, alterar ou revogar um padrão visual/UX**.

Mudanças pequenas que apenas corrigem um bug dentro de um padrão já documentado não precisam gerar seção nova; podem atualizar a regra existente.

## 30. Referência de retomada visual

Ao retomar qualquer trabalho de interface no BI Logístico V2, considerar este arquivo como a fonte de verdade visual.

Estado base consolidado em 16/09/2026:
- modernização PrimeReact concluída;
- paridade visual com Extra Cost consolidada;
- filtros, cards, tabelas, gráficos e interações homologados;
- loading e MFA modernizados;
- navegação contextual consolidada;
- drawer mobile alinhado ao Extra Cost no PR #72;
- responsividade iOS/mobile revisada;
- futuras decisões visuais devem ser registradas aqui.


## Paridade com a família Unilog (Extra Cost Control + Retrabalho Controle) — 2026-10-08

Medição objetiva com Playwright: BI e Extra rodando lado a lado, elemento a elemento, em 13 larguras (1440 a 360 px).
Correções em `src/unilog-family-parity.css`, **importado por último** em `main.tsx` (não reordenar).

| Elemento | Antes (BI) | Agora (= Extra) |
|---|---|---|
| Itens do menu | 40 px | 44 px |
| Botão sair (rodapé) | sem fundo/contorno | fundo 3,5%, contorno 8%; 40×40 (desktop) / 40×44 (≤1180) |
| Barra superior | 60 px (58 no celular), fundo 97% | 62 px (64 no ≤760), fundo 94%, padding 14 px no ≤760 |
| Kicker da barra ("BI LOGÍSTICO") | peso 800 | peso 400, `#959aa3` |
| Seção na barra | peso 750 | peso 700 (13 px no ≤760) |
| Título da página | 28 px `#171b24` | 26 px `#242a36` (22 px no ≤760), tracking −0,025em |
| Eyebrow / descrição | peso 800 / `#6e747e` | peso 700 / `#5f636b` |
| Filtros (dropdown/multiselect) | 42 px | 46 px |
| Margem do conteúdo | 18 px em todo ≤1180 | 20 (1101–1180), 24 (901–1100), 18 (761–900), 12 (481–760), 10 (≤480) |
| Menu gaveta | 276 px, logo 92 px | 292 px, logo 96×42, sombra do Extra |
| Botão ☰ / fechar | 44 px / fundo cinza | 38×44 / transparente `#aeb4be` |
| Fundo atrás do menu | — | `rgba(13,16,22,.44)` |
| Login: ícone de senha | desalinhado (top 0) | centralizado (top 50%) |
| Login no celular | campos 12 px (zoom no iOS) | 16 px |

Já eram iguais e foram mantidos: largura do menu (244/72 px), gradiente, item ativo com barra vermelha, menu gaveta a partir de 1180 px, barra superior de ponta a ponta, margem do desktop (34 px), cartão de login, paleta e raios.

Tipografia: mantida **Roboto** (fonte oficial da marca, também no Retrabalho). O Extra é o único que ainda usa Inter.

Resultado medido: margens e barra superior idênticas ao Extra nas 13 larguras; menu e cabeçalhos alinhados no desktop e no celular; build e testes (vitest 6/6) aprovados.
