import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FcaFormStepper } from '../components/fca/FcaFormStepper'
import { PageHeader } from '../components/PageHeader'
import { ContextNotice } from '../components/ui/ContextNotice'
import { EmptyState, Skeleton } from '../components/ui/Feedback'
import { Panel } from '../components/ui/Panel'
import { supabase } from '../lib/supabase'
import { updateFca, type EditFcaAction } from '../lib/fca'
import type { FcaActionStatus, FcaWithActions } from '../types/fca'
import type { HubBootstrap } from '../types/hub'

const emptyAction=():EditFcaAction=>({acao:'',responsavel:'',prazo:'',status:'ABERTO'})
const emailKey=(value:string|null|undefined)=>String(value??'').trim().toLowerCase()

export function FcaEditPage({hub}:{hub:HubBootstrap}){
 const{id}=useParams(),navigate=useNavigate(),isAdmin=hub.profile.perfil==='ADMIN'
 const hasTemporaryCoverage=!isAdmin&&hub.supervisors.some(s=>s.supervisorId!==hub.profile.supervisorId)
 const canChooseSupervisor=isAdmin||hasTemporaryCoverage||!hub.profile.supervisorId
 const[row,setRow]=useState<FcaWithActions|null>(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState<string|null>(null)
 const[dataReuniao,setDataReuniao]=useState(''),[supervisorId,setSupervisorId]=useState(''),[moduloId,setModuloId]=useState(''),[depositanteCnpj,setDepositanteCnpj]=useState(''),[indicadorCodigo,setIndicadorCodigo]=useState(''),[causa,setCausa]=useState(''),[acoes,setAcoes]=useState<EditFcaAction[]>([])
 useEffect(()=>{
  if(!id)return
  let active=true
  async function loadFca(){
   setLoading(true)
   setError(null)
   try{
    const{data,error}=await supabase.from('fca').select('*, fca_acoes(*)').eq('id',id).single()
    if(error)throw error
    if(!active)return
    const f=data as unknown as FcaWithActions
    setRow(f)
    setDataReuniao(f.data_reuniao)
    setSupervisorId(f.supervisor_id)
    setModuloId(f.modulo_id)
    setDepositanteCnpj(f.depositante_cnpj)
    setIndicadorCodigo(f.indicador_codigo)
    setCausa(f.causa)
    setAcoes((f.fca_acoes??[]).filter(a=>a.status!=='CANCELADO').sort((a,b)=>a.ordem-b.ordem).map(a=>({id:a.id,acao:a.acao,responsavel:a.responsavel??'',prazo:a.prazo??'',status:a.status})))
   }catch(e:unknown){
    if(active)setError(e instanceof Error?e.message:'Falha ao carregar FCA.')
   }finally{
    if(active)setLoading(false)
   }
  }
  void loadFca()
  return()=>{active=false}
 },[id])
 const currentModules=useMemo(()=>Array.from(new Set(hub.supervisorModules.filter(m=>!supervisorId||m.supervisorId===supervisorId).map(m=>m.moduloId))).sort(),[hub.supervisorModules,supervisorId])
 const modules=useMemo(()=>{
  if(!row||supervisorId!==row.supervisor_id||currentModules.includes(row.modulo_id))return currentModules
  return [row.modulo_id,...currentModules]
 },[currentModules,row,supervisorId])
 const depositantes=useMemo(()=>hub.depositantes.filter(d=>(!supervisorId||d.supervisorId===supervisorId)&&(!moduloId||d.moduloId===moduloId)).sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR')),[hub.depositantes,supervisorId,moduloId])
 const indicadores=useMemo(()=>hub.indicadores.filter(i=>i.grupo.trim().toUpperCase()==='KPI').sort((a,b)=>a.indicador.localeCompare(b.indicador,'pt-BR')),[hub.indicadores])
 const historicalSupervisorMissing=Boolean(row&&!hub.supervisors.some(s=>s.supervisorId===row.supervisor_id))
 const historicalModuleMissing=Boolean(row&&!hub.supervisorModules.some(m=>m.supervisorId===row.supervisor_id&&m.moduloId===row.modulo_id))
 const historicalDepositanteMissing=Boolean(row&&supervisorId===row.supervisor_id&&moduloId===row.modulo_id&&!depositantes.some(d=>d.cnpj===row.depositante_cnpj))
 const historicalIndicatorMissing=Boolean(row&&!indicadores.some(i=>i.codigo===row.indicador_codigo))
 const currentDepositante=row?hub.depositantes.find(d=>d.cnpj===row.depositante_cnpj):undefined
 const contextChangedInHub=Boolean(row&&(!currentDepositante||currentDepositante.supervisorId!==row.supervisor_id||currentDepositante.moduloId!==row.modulo_id||historicalSupervisorMissing||historicalModuleMissing||historicalIndicatorMissing))
 function updateAction(index:number,field:keyof EditFcaAction,value:string){setAcoes(c=>c.map((a,i)=>i===index?{...a,[field]:value}:a))}
 function currentUserSubstitution(targetSupervisorId:string,targetModuloId:string){return hub.substituicoes.find(s=>s.ativo&&s.supervisorTitularId===targetSupervisorId&&s.moduloId===targetModuloId&&((hub.profile.supervisorId&&s.supervisorSubstitutoId===hub.profile.supervisorId)||emailKey(s.supervisorSubstitutoEmail)===emailKey(hub.profile.email)))}
 async function submit(e:FormEvent){
  e.preventDefault()
  if(!id||!row)return
  setError(null)
  const keepsHistoricalContext=supervisorId===row.supervisor_id&&moduloId===row.modulo_id&&depositanteCnpj===row.depositante_cnpj
  const currentDep=hub.depositantes.find(d=>d.cnpj===depositanteCnpj&&d.supervisorId===supervisorId&&d.moduloId===moduloId)
  const currentInd=indicadores.find(i=>i.codigo===indicadorCodigo)
  const keepsHistoricalIndicator=indicadorCodigo===row.indicador_codigo
  if(!keepsHistoricalContext&&!currentDep){setError('Selecione um depositante válido para o supervisor e módulo escolhidos.');return}
  if(!keepsHistoricalIndicator&&!currentInd){setError('Selecione um indicador válido.');return}
  if(!moduloId){setError('Selecione o módulo.');return}
  if(!causa.trim()){setError('Informe a causa do FCA.');return}

  const targetSupervisorId=keepsHistoricalContext?row.supervisor_id:currentDep!.supervisorId
  const targetSupervisor=keepsHistoricalContext?null:hub.supervisors.find(s=>s.supervisorId===targetSupervisorId)
  if(!keepsHistoricalContext&&!targetSupervisor){setError('Selecione um supervisor válido para o depositante.');return}
  const targetSupervisorNome=keepsHistoricalContext?row.supervisor_nome:targetSupervisor!.supervisor
  const targetDepositanteCnpj=keepsHistoricalContext?row.depositante_cnpj:currentDep!.cnpj
  const targetDepositanteNome=keepsHistoricalContext?row.depositante_nome:currentDep!.nome
  const targetIndicadorCodigo=keepsHistoricalIndicator?row.indicador_codigo:currentInd!.codigo
  const targetIndicadorNome=keepsHistoricalIndicator?row.indicador_nome:currentInd!.indicador
  const sub=keepsHistoricalContext?null:currentUserSubstitution(targetSupervisorId,moduloId)
  const substitutionSnapshot=keepsHistoricalContext
   ? {substituicaoId:row.substituicao_id,substitutoId:row.substituto_id,substitutoNome:row.substituto_nome}
   : {substituicaoId:sub?.substituicaoId??null,substitutoId:sub?.supervisorSubstitutoId??null,substitutoNome:sub?.supervisorSubstituto??null}

  setSaving(true)
  try{
   await updateFca({id,dataReuniao,supervisorId:targetSupervisorId,supervisorNome:targetSupervisorNome,moduloId,depositanteCnpj:targetDepositanteCnpj,depositanteNome:targetDepositanteNome,indicadorCodigo:targetIndicadorCodigo,indicadorNome:targetIndicadorNome,causa,...substitutionSnapshot,acoes:acoes.filter(a=>a.acao.trim())})
   navigate(`/fca/${id}`,{state:{updated:true}})
  }catch(e){setError(e instanceof Error?e.message:'Não foi possível atualizar o FCA.')}
  finally{setSaving(false)}
 }
 if(loading)return <Panel><Skeleton lines={6}/></Panel>
 if(error&&!row)return <Panel><EmptyState tone="error" icon="error" title="Não foi possível carregar o FCA" description={error}/></Panel>
 if(!row)return null
 return <section className="fca-page fca-editor-page">
  <PageHeader eyebrow="FCA · EDIÇÃO" title={`Editar FCA #${String(row.numero).padStart(5,'0')}`} description="Revise o contexto, atualize a análise e mantenha o plano de ação rastreável." actions={<Link className="button" to={`/fca/${id}`}><span className="material-symbols-rounded" aria-hidden="true">close</span>Cancelar edição</Link>}/>
  <FcaFormStepper mode="edição"/>
  {hasTemporaryCoverage&&<ContextNotice icon="event_repeat" title="Edição com cobertura temporária disponível" description="Você pode manter o FCA no seu próprio escopo ou selecionar um supervisor titular que esteja sob sua cobertura vigente."/>}
  {contextChangedInHub&&<ContextNotice icon="history" title="Contexto histórico preservado" description="Este FCA possui supervisor, módulo, depositante ou indicador que difere do cadastro atual da HUB. Você pode concluir ou editar mantendo o contexto salvo. Para trocar o contexto, selecione uma opção atualmente disponível na HUB."/>}
  <form className="fca-form" onSubmit={submit}>
   <div className="form-section"><div className="form-section-heading"><span className="material-symbols-rounded" aria-hidden="true">badge</span><div><h2>Identificação</h2><p>Revise o contexto operacional do registro.</p></div></div><div className="form-grid form-grid-3"><div><label>Data da reunião</label><input type="date" value={dataReuniao} onChange={e=>setDataReuniao(e.target.value)} required/></div><div><label>Supervisor titular</label><select value={supervisorId} onChange={e=>{setSupervisorId(e.target.value);setModuloId('');setDepositanteCnpj('')}} disabled={!canChooseSupervisor} required><option value="">Selecione</option>{historicalSupervisorMissing&&row&&<option value={row.supervisor_id}>{row.supervisor_nome} · contexto do FCA</option>}{hub.supervisors.map(s=><option key={s.supervisorId} value={s.supervisorId}>{s.nomeExibicao}</option>)}</select></div><div><label>Módulo</label><select value={moduloId} onChange={e=>{setModuloId(e.target.value);setDepositanteCnpj('')}} required><option value="">Selecione</option>{modules.map(m=>{const historical=Boolean(row&&m===row.modulo_id&&historicalModuleMissing);return <option key={m} value={m}>{m}{historical?' · contexto do FCA':''}</option>})}</select></div><div className="span-2"><label>Depositante</label><select value={depositanteCnpj} onChange={e=>setDepositanteCnpj(e.target.value)} required><option value="">Selecione</option>{historicalDepositanteMissing&&row&&<option value={row.depositante_cnpj}>{row.depositante_nome} · {row.depositante_cnpj} · contexto do FCA</option>}{depositantes.map(d=><option key={d.cnpj} value={d.cnpj}>{d.nome} · {d.cnpj}</option>)}</select></div><div><label>Indicador</label><select value={indicadorCodigo} onChange={e=>setIndicadorCodigo(e.target.value)} required><option value="">Selecione</option>{historicalIndicatorMissing&&row&&<option value={row.indicador_codigo}>{row.indicador_nome} · contexto do FCA</option>}{indicadores.map(i=><option key={i.codigo} value={i.codigo}>{i.indicador}</option>)}</select></div></div></div>
   <div className="form-section"><div className="form-section-heading"><span className="material-symbols-rounded" aria-hidden="true">troubleshoot</span><div><h2>Análise da causa</h2><p>Atualize o desvio e a causa com contexto suficiente para auditoria.</p></div></div><label>Causa / desvio identificado</label><textarea value={causa} onChange={e=>setCausa(e.target.value)} rows={6} required/></div>
   <div className="form-section"><div className="form-section-heading-row"><div className="form-section-heading"><span className="material-symbols-rounded" aria-hidden="true">task_alt</span><div><h2>Plano de ação</h2><p>Mantenha responsáveis, prazos e andamento das tratativas.</p></div></div><button type="button" className="add-action-button" onClick={()=>setAcoes(c=>[...c,emptyAction()])}><span className="material-symbols-rounded" aria-hidden="true">add</span>Nova ação</button></div><div className="actions-stack">{acoes.map((a,index)=><div className="action-card" key={a.id??`new-${index}`}><div className="action-card-title"><span className="action-number">{String(index+1).padStart(2,'0')}</span><strong>Ação</strong><button type="button" className="action-remove" onClick={()=>setAcoes(c=>c.filter((_,i)=>i!==index))}><span className="material-symbols-rounded" aria-hidden="true">delete</span>Remover</button></div><div className="form-grid form-grid-action"><div className="span-2"><label>Descrição da ação</label><textarea rows={3} value={a.acao} onChange={e=>updateAction(index,'acao',e.target.value)}/></div><div><label>Responsável</label><input value={a.responsavel} onChange={e=>updateAction(index,'responsavel',e.target.value)}/></div><div><label>Prazo</label><input type="date" value={a.prazo} onChange={e=>updateAction(index,'prazo',e.target.value)}/></div><div><label>Status</label><select value={a.status} onChange={e=>updateAction(index,'status',e.target.value as FcaActionStatus)}><option value="ABERTO">Aberto</option><option value="EM_ANDAMENTO">Em andamento</option><option value="CONCLUIDO">Concluído</option><option value="CANCELADO">Cancelado</option></select></div></div></div>)}</div></div>
   {error&&<div className="notice notice-error" role="alert">{error}</div>}<div className="form-actions sticky-form-actions"><Link className="button" to={`/fca/${id}`}>Cancelar</Link><button className="button button-primary" disabled={saving}>{saving?'Salvando…':'Salvar alterações'}</button></div>
  </form>
 </section>
}
