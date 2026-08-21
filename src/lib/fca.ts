import { supabase } from './supabase'
import type { FcaActionStatus, FcaWithActions, NewFcaAction } from '../types/fca'

export interface CreateFcaInput {
  dataReuniao: string
  supervisorId: string
  supervisorNome: string
  moduloId: string
  depositanteCnpj: string
  depositanteNome: string
  indicadorCodigo: string
  indicadorNome: string
  causa: string
  substituicaoId?: string | null
  substitutoId?: string | null
  substitutoNome?: string | null
  acoes: NewFcaAction[]
}

export interface EditFcaAction extends NewFcaAction { id?: string }
export interface EditFcaInput extends Omit<CreateFcaInput,'acoes'> { id:string; acoes:EditFcaAction[] }

export async function createFca(input: CreateFcaInput) {
  const { data, error } = await supabase.rpc('criar_fca_com_acoes', {
    p_data_reuniao: input.dataReuniao,
    p_supervisor_id: input.supervisorId,
    p_supervisor_nome: input.supervisorNome,
    p_modulo_id: input.moduloId,
    p_depositante_cnpj: input.depositanteCnpj,
    p_depositante_nome: input.depositanteNome,
    p_indicador_codigo: input.indicadorCodigo,
    p_indicador_nome: input.indicadorNome,
    p_causa: input.causa,
    p_acoes: input.acoes.map((acao) => ({ acao: acao.acao.trim(), responsavel: acao.responsavel.trim() || null, prazo: acao.prazo || null, status: acao.status })),
    p_substituicao_id: input.substituicaoId ?? null,
    p_substituto_id: input.substitutoId ?? null,
    p_substituto_nome: input.substitutoNome ?? null,
  })
  if (error) throw new Error(error.message)
  const result = Array.isArray(data) ? data[0] : data
  if (!result?.id) throw new Error('O FCA foi processado, mas o identificador não foi retornado.')
  return result as { id: string; numero: number }
}

export async function updateFca(input:EditFcaInput) {
  const { error } = await supabase.rpc('editar_fca_com_acoes', {
    p_fca_id: input.id,
    p_data_reuniao: input.dataReuniao,
    p_supervisor_id: input.supervisorId,
    p_supervisor_nome: input.supervisorNome,
    p_modulo_id: input.moduloId,
    p_depositante_cnpj: input.depositanteCnpj,
    p_depositante_nome: input.depositanteNome,
    p_indicador_codigo: input.indicadorCodigo,
    p_indicador_nome: input.indicadorNome,
    p_causa: input.causa.trim(),
    p_acoes: input.acoes.filter(a=>a.acao.trim()).map((acao)=>({ id:acao.id??null, acao:acao.acao.trim(), responsavel:acao.responsavel.trim()||null, prazo:acao.prazo||null, status:acao.status as FcaActionStatus })),
    p_substituicao_id: input.substituicaoId ?? null,
    p_substituto_id: input.substitutoId ?? null,
    p_substituto_nome: input.substitutoNome ?? null,
  })
  if (error) throw new Error(error.message)
}

export async function listFcas(): Promise<FcaWithActions[]> {
  const { data, error } = await supabase.from('fca').select(`id, numero, data_reuniao, supervisor_id, supervisor_nome, modulo_id, depositante_cnpj, depositante_nome, indicador_codigo, indicador_nome, causa, substituicao_id, substituto_id, substituto_nome, status_registro, criado_em, fca_acoes ( id, fca_id, ordem, acao, responsavel, prazo, status )`).order('data_reuniao', { ascending: false }).order('numero', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as FcaWithActions[]
}

export async function listFcaPeriods(): Promise<string[]> {
  const { data, error } = await supabase.from('fca').select('data_reuniao').order('data_reuniao', { ascending: false })
  if (error) throw new Error(error.message)
  return Array.from(new Set((data ?? []).map(row=>String(row.data_reuniao).slice(0,7)).filter(period=>/^\d{4}-\d{2}$/.test(period))))
}

export function deriveFcaStatus(fca: FcaWithActions) {
  if (fca.status_registro === 'CANCELADO') return 'CANCELADO'
  const relevant = (fca.fca_acoes ?? []).filter((acao) => acao.status !== 'CANCELADO')
  if (relevant.length === 0) return 'ABERTO'
  if (relevant.every((acao) => acao.status === 'CONCLUIDO')) return 'CONCLUIDO'
  if (relevant.some((acao) => acao.status === 'EM_ANDAMENTO' || acao.status === 'CONCLUIDO')) return 'EM_ANDAMENTO'
  return 'ABERTO'
}

export function isFcaOverdue(fca: FcaWithActions, today = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date())) {
  if (fca.status_registro === 'CANCELADO') return false
  return (fca.fca_acoes ?? []).some((acao) => Boolean(acao.prazo) && acao.prazo! < today && acao.status !== 'CONCLUIDO' && acao.status !== 'CANCELADO')
}
