import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FcaEditorForm } from '../components/fca/FcaEditorForm'
import { FcaFormStepper } from '../components/fca/FcaFormStepper'
import { PageHeader } from '../components/PageHeader'
import { EmptyState, Skeleton } from '../components/ui/Feedback'
import { Panel } from '../components/ui/Panel'
import { supabase } from '../lib/supabase'
import { updateFca, type EditFcaAction } from '../lib/fca'
import type { FcaWithActions } from '../types/fca'
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
 const modules=useMemo(()=>Array.from(new Set(hub.supervisorModules.filter(m=>!supervisorId||m.supervisorId===supervisorId).map(m=>m.moduloId))).sort(),[hub.supervisorModules,supervisorId])
 const depositantes=useMemo(()=>hub.depositantes.filter(d=>(!supervisorId||d.supervisorId===supervisorId)&&(!moduloId||d.moduloId===moduloId)).sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR')),[hub.depositantes,supervisorId,moduloId])
 const indicadores=useMemo(()=>hub.indicadores.filter(i=>i.grupo.trim().toUpperCase()==='KPI').sort((a,b)=>a.indicador.localeCompare(b.indicador,'pt-BR')),[hub.indicadores])
 function updateAction(index:number,field:keyof EditFcaAction,value:string){setAcoes(c=>c.map((a,i)=>i===index?{...a,[field]:value}:a))}
 function currentUserSubstitution(targetSupervisorId:string,targetModuloId:string){return hub.substituicoes.find(s=>s.ativo&&s.supervisorTitularId===targetSupervisorId&&s.moduloId===targetModuloId&&((hub.profile.supervisorId&&s.supervisorSubstitutoId===hub.profile.supervisorId)||emailKey(s.supervisorSubstitutoEmail)===emailKey(hub.profile.email)))}
 async function submit(e:FormEvent){e.preventDefault();if(!id||!row)return;setError(null);const dep=hub.depositantes.find(d=>d.cnpj===depositanteCnpj),ind=indicadores.find(i=>i.codigo===indicadorCodigo),sup=hub.supervisors.find(s=>s.supervisorId===dep?.supervisorId);if(!dep||!ind||!sup||!moduloId){setError('Preencha supervisor, módulo, depositante e indicador.');return}if(!causa.trim()){setError('Informe a causa do FCA.');return}const sub=currentUserSubstitution(dep.supervisorId,moduloId);setSaving(true);try{await updateFca({id,dataReuniao,supervisorId:dep.supervisorId,supervisorNome:sup.supervisor,moduloId,depositanteCnpj:dep.cnpj,depositanteNome:dep.nome,indicadorCodigo:ind.codigo,indicadorNome:ind.indicador,causa,substituicaoId:sub?.substituicaoId??null,substitutoId:sub?.supervisorSubstitutoId??null,substitutoNome:sub?.supervisorSubstituto??null,acoes:acoes.filter(a=>a.acao.trim())});navigate(`/fca/${id}`,{state:{updated:true}})}catch(e){setError(e instanceof Error?e.message:'Não foi possível atualizar o FCA.')}finally{setSaving(false)}}
 if(loading)return <Panel><Skeleton lines={6}/></Panel>
 if(error&&!row)return <Panel><EmptyState tone="error" icon="error" title="Não foi possível carregar o FCA" description={error}/></Panel>
 if(!row)return null
 return <section className="fca-page fca-editor-page">
  <PageHeader eyebrow="FCA · EDIÇÃO" title={`Editar FCA #${String(row.numero).padStart(5,'0')}`} description="Revise o contexto, atualize a análise e mantenha o plano de ação rastreável." actions={<Link className="button" to={`/fca/${id}`}><span className="material-symbols-rounded" aria-hidden="true">close</span>Cancelar edição</Link>}/>
  <FcaFormStepper mode="edição"/>
  {hasTemporaryCoverage&&<div className="substitute-context"><span className="material-symbols-rounded" aria-hidden="true">event_repeat</span><div><strong>Edição com cobertura temporária disponível</strong><p>Você pode manter o FCA no seu próprio escopo ou selecionar um supervisor titular que esteja sob sua cobertura vigente.</p></div></div>}
  <FcaEditorForm
    mode="edit"
    supervisors={hub.supervisors}
    modules={modules}
    depositantes={depositantes}
    indicadores={indicadores}
    canChooseSupervisor={canChooseSupervisor}
    dataReuniao={dataReuniao}
    supervisorId={supervisorId}
    moduloId={moduloId}
    depositanteCnpj={depositanteCnpj}
    indicadorCodigo={indicadorCodigo}
    causa={causa}
    acoes={acoes}
    saving={saving}
    error={error}
    cancelTo={`/fca/${id}`}
    onSubmit={submit}
    onDataReuniaoChange={setDataReuniao}
    onSupervisorChange={value=>{setSupervisorId(value);setModuloId('');setDepositanteCnpj('')}}
    onModuloChange={value=>{setModuloId(value);setDepositanteCnpj('')}}
    onDepositanteChange={setDepositanteCnpj}
    onIndicadorChange={setIndicadorCodigo}
    onCausaChange={setCausa}
    onActionChange={updateAction}
    onAddAction={()=>setAcoes(current=>[...current,emptyAction()])}
    onRemoveAction={index=>setAcoes(current=>current.filter((_,i)=>i!==index))}
  />
 </section>
}
