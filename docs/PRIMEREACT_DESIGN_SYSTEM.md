# PrimeReact Design System — BI Logístico V2

Última atualização: 2026-09-14

## 1. Objetivo

Este documento define como PrimeReact será usado no BI Logístico V2 sem descaracterizar a identidade Unilog e sem transformar a aplicação em uma interface genérica de biblioteca.

PrimeReact fornece comportamento, acessibilidade e estrutura de componentes. O visual final é governado pelo design system do projeto.

## 2. Versões-base da modernização

Linha adotada inicialmente:
- PrimeReact 10.9.9 (`v10-stable`)
- PrimeIcons 7.x
- Chart.js 4.5.1

Motivo para permanecer na linha PrimeReact v10 nesta migração:
- API compatível com os componentes já mapeados no plano (`DataTable`, `Dialog`, `Dropdown`, `MultiSelect`, `Chart`, etc.);
- menor risco de introduzir simultaneamente uma migração conceitual para a API de primitives do PrimeReact v11;
- permite modernização incremental sobre o React/Vite existente.

A troca futura para PrimeReact v11 é uma decisão arquitetural separada, não condição desta modernização.

## 3. Princípios

1. A identidade Unilog prevalece sobre o tema padrão da biblioteca.
2. Vermelho Unilog é cor de marca; não é cor universal de erro.
3. Estado semântico deve usar tokens de sucesso, aviso, perigo e informação.
4. Mesmo tipo de ação deve ter mesma anatomia e comportamento em toda a aplicação.
5. Componentes PrimeReact não devem ser estilizados ad hoc por página quando puderem ser controlados por wrapper/tokens compartilhados.
6. Responsividade faz parte do componente, não é correção posterior.
7. Mobile não deve depender de arrastar tabelas largas para acessar informação essencial.
8. A migração deve preservar densidade adequada a um BI operacional.

## 4. Tokens oficiais

### Marca

```css
--brand-primary: #db0812;
--brand-primary-hover: #b8070f;
--brand-primary-soft: #fdecee;
```

### Neutros

```css
--ink: #2f3136;
--graphite: #5f636b;
--muted: #858a93;
--border: #e2e4e8;
--border-soft: #eceef1;
--border-strong: #cdd0d5;
--canvas: #f5f6f8;
--surface: #ffffff;
--surface-soft: #f8f9fa;
--surface-muted: #f2f3f5;
```

### Estados

```css
--success: #3f7c59;
--success-soft: #edf6f0;
--warning: #a87900;
--warning-soft: #fff6d8;
--danger: #c91a23;
--danger-soft: #fff0f1;
--info: #356a9a;
--info-soft: #edf5fb;
```

### Geometria

```css
--radius-control: 8px;
--radius-card: 11px;
--radius-pill: 999px;
```

### Sombras

```css
--shadow-card: 0 1px 3px rgba(29, 31, 35, 0.035);
--shadow-raised: 0 12px 32px rgba(29, 31, 35, 0.10);
--shadow-overlay: 0 18px 48px rgba(29, 31, 35, 0.16);
```

### Espaçamento

Escala oficial:
- 4px
- 8px
- 12px
- 16px
- 24px
- 32px
- 40px
- 48px

Tokens existentes `--space-1` a `--space-8` devem continuar válidos durante a migração.

## 5. Tipografia

- família preferencial: Roboto, com fallback de sistema;
- corpo padrão compacto e legível para BI operacional;
- labels sempre visíveis em formulários;
- headings devem seguir hierarquia previsível;
- não usar peso alto em excesso;
- números de KPI podem ter hierarquia visual maior sem competir com o título da página.

## 6. Foco e acessibilidade

Todo controle interativo deve ter foco visível.

Padrão recomendado:

```css
outline: 3px solid color-mix(in srgb, var(--brand-primary) 22%, transparent);
outline-offset: 2px;
```

Não remover outline sem fornecer substituto equivalente.

Estados disabled devem continuar legíveis e distinguíveis, sem depender apenas de opacidade extrema.

## 7. Botões

Mapeamento preferencial:
- ação principal: PrimeReact `Button` com wrapper/variant do projeto;
- ação secundária: botão neutro;
- ação terciária: text/ghost;
- destrutiva: danger somente quando realmente destrutiva;
- icon-only: sempre com `aria-label` e tooltip quando o significado não for óbvio.

Regras:
- altura mínima desktop: 38–40px;
- touch target mobile: preferencialmente 44px;
- radius: `--radius-control`;
- primary usa `--brand-primary`;
- hover primary usa `--brand-primary-hover`;
- não usar vermelho para ações neutras apenas por identidade visual.

## 8. Inputs e seleção

Componentes preferenciais:
- `InputText`
- `InputTextarea`
- `Password`
- `Dropdown`
- `MultiSelect`
- `Calendar`
- `Checkbox`
- `InputSwitch`
- `SelectButton`

Estrutura de campo:
1. label;
2. controle;
3. helper opcional;
4. erro quando aplicável.

Regras:
- label não deve depender apenas de placeholder;
- required deve ter sinalização consistente;
- erro deve ser semântico, não apenas borda vermelha;
- controles devem preencher largura disponível em layouts estreitos;
- dropdowns e overlays não podem sair da viewport mobile.

## 9. Cards e painéis

PrimeReact `Card` pode ser usado quando sua semântica contribuir para padronização.

Nem todo painel precisa obrigatoriamente virar `Card`; componentes executivos já validados podem continuar customizados quando isso preservar melhor a hierarquia visual.

Padrão:
- fundo `--surface`;
- borda `--border` quando necessária;
- radius `--radius-card`;
- shadow `--shadow-card`;
- padding governado pela escala de spacing.

## 10. DataTable

PrimeReact `DataTable` + `Column` será o padrão desktop quando adequado.

O wrapper do projeto deve controlar:
- cabeçalho;
- densidade;
- ordenação;
- paginação;
- loading;
- empty state;
- hover;
- seleção quando aplicável;
- coluna de ações;
- status;
- acessibilidade.

### Mobile

Não usar simplesmente `overflow-x:auto` como solução padrão.

Quando a tabela contém dados operacionais extensos, usar record cards verticais ou outra representação responsiva quando isso permitir leitura/ação sem arrasto horizontal essencial.

## 11. Dialogs e overlays

Preferir PrimeReact `Dialog`, `ConfirmDialog` e overlays relacionados.

Estrutura recomendada:
- eyebrow/contexto quando necessário;
- título;
- descrição curta;
- conteúdo;
- feedback/erro;
- footer com ações.

Regras mobile:
- largura deve respeitar viewport;
- altura deve respeitar `100dvh` e safe areas;
- conteúdo longo deve rolar dentro do dialog sem esconder ações críticas;
- foco deve permanecer corretamente gerenciado.

Não usar `window.alert`, `window.confirm` ou `window.prompt` quando o fluxo visual da aplicação já possuir alternativa adequada.

## 12. Tags e estados

Preferir `Tag` ou wrapper equivalente para status.

Cores por semântica:
- sucesso -> `--success`;
- atenção -> `--warning`;
- erro/risco -> `--danger`;
- informação -> `--info`;
- neutro -> escala neutral.

A cor de marca não deve substituir essas categorias.

## 13. Feedback assíncrono

Preferir:
- `Toast` para confirmação transitória;
- `Message` para feedback persistente/contextual;
- `Skeleton` para carregamento estrutural;
- empty states compartilhados;
- erros acionáveis com orientação curta.

Evitar spinners soltos sem contexto quando Skeleton ou estado de conteúdo for mais informativo.

## 14. Sidebar e navegação

Desktop/notebook:
- navegação lateral persistente conforme espaço disponível;
- estado collapsed pode continuar persistido conforme comportamento atual.

Mobile:
- sidebar deve se tornar Drawer/Sidebar;
- fechar com Escape quando aplicável;
- foco deve ser contido/retornado corretamente;
- bloquear scroll de fundo quando overlay estiver ativo;
- navegação deve manter mesma permissão/visibilidade já definida no AppShell atual.

## 15. Gráficos

Padrão preferencial: PrimeReact `Chart` com Chart.js.

Regras:
- preservar cálculo no domínio; gráfico apenas apresenta;
- não recalcular KPI dentro do componente visual;
- `responsive: true`;
- `maintainAspectRatio: false` quando a tela exigir altura controlada;
- labels extensos devem usar truncamento controlado + tooltip completo, autoSkip, rotação ou orientação horizontal;
- altura pode ser dinâmica conforme quantidade de categorias;
- nenhuma legenda/rótulo deve se sobrepor de forma estrutural;
- cores precisam vir de tokens/semântica;
- acessibilidade deve incluir contexto textual fora do canvas quando necessário.

## 16. Tooltips

Tooltips devem ser padronizados.

Conteúdo deve:
- identificar métrica/categoria;
- mostrar valor formatado conforme domínio;
- preservar texto completo de labels truncados;
- evitar informação redundante;
- não depender de hover para informação essencial em mobile.

## 17. Breakpoints de revisão

A implementação deve ser inspecionada pelo menos nestas bandas:
- 1440+;
- 1024–1366;
- 768–1024;
- 320–767.

Não tratar apenas 375px e 1440px como representativos de todo o sistema.

## 18. CSS e ownership

Estratégia:
- `design-system.css`: tokens e base global;
- `primereact.css`: integração visual dos componentes PrimeReact e bridge de migração;
- owners de página/componente: apenas regras específicas que não pertencem ao sistema compartilhado;
- CSS legado deve ser removido somente depois de não possuir consumidores.

Evitar:
- seletores excessivamente globais;
- cadeias longas de especificidade;
- `!important` como estratégia de tema;
- overrides de uma página que alterem outra;
- duplicação de cores hexadecimais já existentes como token.

## 19. Uso customizado permitido

Continuam permitidos quando forem superiores aos componentes genéricos:
- KPI cards executivos;
- DetailHero;
- record cards mobile;
- matrizes/heatmaps;
- visualizações analíticas específicas;
- elementos de descoberta/insight;
- layouts contextuais de FCA.

Esses componentes ainda devem consumir tokens oficiais.

## 20. Padrões proibidos

- introduzir nova cor arbitrária por tela;
- usar vermelho de marca como erro universal;
- criar botão custom novo quando um wrapper compartilhado resolver;
- misturar select nativo e PrimeReact sem justificativa durante estado final da migração;
- esconder ação obsoleta apenas com CSS;
- resolver tabela mobile apenas com scroll horizontal essencial;
- posicionar labels de gráfico onde bolhas/barras os tornem ilegíveis;
- duplicar regra de negócio dentro de componentes visuais;
- fazer override infinito sobre tema genérico.

## 21. Critério de aprovação visual

Uma superfície PrimeReact só é considerada migrada quando:
- corresponde à identidade Unilog;
- funciona nas quatro bandas responsivas;
- possui foco/keyboard coerentes;
- não introduz regressão funcional;
- loading/empty/error estão padronizados;
- não possui overflow inadequado;
- não depende de CSS legado sem justificativa;
- utiliza tokens oficiais;
- foi validada no preview do head exato.
