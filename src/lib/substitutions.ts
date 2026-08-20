import { supabase } from './supabase'
import type { HubSubstituicao, HubSubstituto } from '../types/hub'

export async function saveSubstitute(input:{id?:string;codigo:string;nome:string;email:string;ativo:boolean}){
  const payload={codigo:input.codigo.trim(),nome:input.nome.trim(),email:input.email.trim().toLowerCase()||null,ativo:input.ativo,alterado_por:(await supabase.auth.getUser()).data.user?.id??null,alterado_em:new Date().toISOString()}
  if(input.id){const{error}=await supabase.from('supervisor_substitutos').update(payload).eq('id',input.id);if(error)throw new Error(error.message);return input.id}
  const user=(await supabase.auth.getUser()).data.user
  const{data,error}=await supabase.from('supervisor_substitutos').insert({...payload,criado_por:user?.id??null}).select('id').single()
  if(error)throw new Error(error.message)
  return data.id as string
}

export async function saveCoverage(input:{id?:string;titularId:string;titularNome:string;substituto:HubSubstituto;moduloId:string;dataInicio:string;dataFim:string;motivo:string;status:'ATIVA'|'ENCERRADA'|'CANCELADA'}){
  const user=(await supabase.auth.getUser()).data.user
  const payload={
    supervisor_titular_id:input.titularId,
    supervisor_titular_nome:input.titularNome,
    substituto_master_id:input.substituto.id,
    substituto_codigo_snapshot:input.substituto.codigo,
    substituto_nome_snapshot:input.substituto.nome,
    substituto_email_snapshot:input.substituto.email,
    modulo_id:input.moduloId,
    data_inicio:input.dataInicio,
    data_fim:input.dataFim,
    motivo:input.motivo.trim()||null,
    status:input.status,
    alterado_por:user?.id??null,
    alterado_em:new Date().toISOString(),
  }
  if(input.id){const{error}=await supabase.from('supervisor_substituicoes').update(payload).eq('id',input.id);if(error)throw new Error(error.message);return}
  const{error}=await supabase.from('supervisor_substituicoes').insert({...payload,criado_por:user?.id??null})
  if(error)throw new Error(error.message)
}

export function coverageToForm(coverage:HubSubstituicao){
  return {id:coverage.substituicaoId,titularId:coverage.supervisorTitularId,substitutoMasterId:coverage.substitutoMasterId??'',moduloId:coverage.moduloId,dataInicio:coverage.dataInicio,dataFim:coverage.dataFim,motivo:coverage.motivo??'',status:(coverage.status??(coverage.ativo?'ATIVA':'ENCERRADA')) as 'ATIVA'|'ENCERRADA'|'CANCELADA'}
}
