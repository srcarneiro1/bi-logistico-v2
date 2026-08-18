export type FcaActionStatus = 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'CANCELADO'

export interface NewFcaAction {
  acao: string
  responsavel: string
  prazo: string
  status: FcaActionStatus
}

export interface FcaRow {
  id: string
  numero: number
  data_reuniao: string
  supervisor_id: string
  supervisor_nome: string
  modulo_id: string
  depositante_cnpj: string
  depositante_nome: string
  indicador_codigo: string
  indicador_nome: string
  causa: string
  substituicao_id: string | null
  substituto_id: string | null
  substituto_nome: string | null
  status_registro: 'ATIVO' | 'CANCELADO'
  criado_em: string
}

export interface FcaActionRow {
  id: string
  fca_id: string
  ordem: number
  acao: string
  responsavel: string | null
  prazo: string | null
  status: FcaActionStatus
}

export interface FcaWithActions extends FcaRow {
  fca_acoes: FcaActionRow[]
}
