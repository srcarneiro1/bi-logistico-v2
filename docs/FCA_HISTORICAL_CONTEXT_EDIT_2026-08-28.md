# BI Logístico V2 — Preservação de contexto histórico na edição de FCA

Data: 2026-08-28

## Sintoma

Ao editar um FCA antigo apenas para atualizar/concluir ações, o formulário podia exigir novamente o depositante e não exibir o depositante já salvo no FCA.

## Causa raiz

`FcaEditPage` carregava corretamente os snapshots do registro (`supervisor_id`, `modulo_id`, `depositante_cnpj`, `depositante_nome`, `indicador_*`), mas reconstruía as opções exclusivamente a partir da HUB atual.

Se o cadastro operacional mudasse depois da criação do FCA — por exemplo, depositante transferido de módulo/supervisor ou inativado — o valor histórico deixava de existir nas opções. O submit também exigia encontrar novamente o CNPJ na HUB atual, bloqueando uma edição que não pretendia alterar o contexto.

## Evidência real

Existem FCAs da CELLERA FARMA salvos com:

- Supervisor: Alex (`300068`)
- Módulo: `Modulo 07`
- CNPJ: `33173097000517`

Na HUB atual, CELLERA FARMA está cadastrada para Alex no `Modulo 05`.

Logo, ao abrir esse FCA histórico, o formulário selecionava `Modulo 07` e filtrava `hub.depositantes` por `Alex + Modulo 07`; CELLERA FARMA desaparecia da lista.

## Regra correta

### Manutenção sem troca de contexto

Quando Supervisor + Módulo + Depositante permanecem iguais ao snapshot salvo no FCA:

- o valor histórico continua disponível mesmo que não exista mais dessa forma na HUB;
- Supervisor/Módulo/Depositante são enviados com os snapshots do próprio FCA;
- `substituicao_id`, `substituto_id` e `substituto_nome` também são preservados;
- o usuário pode alterar causa, ações, prazo e status sem reescrever contexto histórico.

O mesmo princípio vale para o indicador já salvo: se não houver troca, o snapshot do FCA é preservado mesmo que o indicador deixe de estar ativo na HUB.

### Troca de contexto

Se o usuário alterar Supervisor, Módulo, Depositante ou Indicador:

- a nova escolha deve existir na HUB atual;
- Depositante precisa pertencer ao Supervisor + Módulo escolhidos atualmente;
- supervisor e indicador precisam ser válidos nas opções atuais;
- cobertura/substituição vigente é recalculada para o novo contexto.

Não é permitido usar um snapshot histórico para criar uma nova combinação fora da HUB atual.

## Apresentação

Quando o FCA contém contexto que diverge da HUB atual, a edição mostra um aviso `ContextNotice` informando que o contexto histórico está sendo preservado.

Opções históricas ausentes da HUB recebem o sufixo `contexto do FCA`.

## Regra permanente

**Snapshot salvo governa manutenção; HUB atual governa mudança de contexto.**

Nunca corrigir esse problema apenas adicionando uma `<option>` visual. A validação do submit precisa distinguir manutenção histórica de nova seleção; caso contrário, a UI parecerá corrigida enquanto o save continuará bloqueado ou reescreverá snapshots indevidamente.

Edição de ações/status não pode apagar metadados históricos de substituição apenas porque a cobertura já terminou.
