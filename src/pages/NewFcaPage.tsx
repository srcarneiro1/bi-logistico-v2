import { FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FcaEditorForm } from '../components/fca/FcaEditorForm'
import { FcaFormStepper } from '../components/fca/FcaFormStepper'
import { PageHeader } from '../components/PageHeader'
import type { HubBootstrap } from '../types/hub'
import type { NewFcaAction } from '../types/fca'
import { createFca } from '../lib/fca'

const emptyAction=():NewFcaAction=>({acao:'',responsavel:'',prazo:'',status:'ABERTO'})
const todaySaoPaulo=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date())
const emailKey=(value:string|null|undefined)=>String(value??'').trim().toLowerCase()

export function NewFcaPage({hub}:{hub:HubBootstrap}){
 const navigate=useNavigate(),isAdmin=hub.profile.perfil==='ADMIN'
 const hasTemporaryCoverage=!isAdmin&&hub.supervisors.some(s=>s.supervisorId!==hub.profile.supervisorId)
 const canChooseSupervisor=isAdmin||hasTemporaryCoverage||!hub.profile.supervisorId
 const initialSupervisorId=isAdmin?'':hub.profile.supervisorId??(hub.supervisors.length===1?hub.supervisors[0].supervisorId:'')
 const[dataReuniao,setDataReuniao]=useState(todaySaoPaulo()),[supervisorId,setSupervisorId]=useState(initialSupervisorId),[moduloId,setModuloId]=useState(''),[depositanteCnpj,setDepositanteCnpj]=useState(''),[indicadorCodigo,setIndicadorCodigo]=useState(''),[causa,setCausa]=useState(''),[acoes,setAcoes]=useState<NewFcaAction[]>([emptyAction()]),[saving,setSaving]=useState(false),[error,setError]=useState<string|null>(null)
 const modules=useMemo(()=>Array.from(new Set(hub.supervisorModules.filter(i=>!supervisorId||i.supervisorId===supervisorId).map(i=>i.moduloId))).sort(),[hub.supervisorModules,supervisorId])
 const depositantes=useMemo(()=>hub.depositantes.filter(i=>(!supervisorId||i.supervisorId===supervisorId)&&(!moduloId||i.moduloId===moduloId)).sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR')),[hub.depositantes,supervisorId,moduloId])
 const indicadores=useMemo(()=>hub.indicadores.filter(i=>i.grupo.trim().toUpperCase()==='KPI').sort((a,b)=>a.indicador.localeCompare(b.indicador,'pt-BR')),[hub.indicadores])
 function updateAction(index:number,field:keyof NewFcaAction,value:string){setAcoes(c=>c.map((a,i)=>i===index?{...a,[field]:value}:a))}
 function currentUserSubstitution(targetSupervisorId:string,targetModuloId:string){return hub.substituicoes.find(i=>i.ativo&&i.supervisorTitularId===targetSupervisorId&&i.moduloId===targetModuloId&&((hub.profile.supervisorId&&i.supervisorSubstitutoId===hub.profile.supervisorId)||emailKey(i.supervisorSubstitutoEmail)===emailKey(hub.profile.email)))}
 async function handleSubmit(event:FormEvent){event.preventDefault();setError(null);const dep=depositantes.find(i=>i.cnpj===depositanteCnpj),ind=indicadores.find(i=>i.codigo===indicadorCodigo),sup=hub.supervisors.find(i=>i.supervisorId===dep?.supervisorId);if(!dep||!ind||!sup||!moduloId){setError('Preencha supervisor, módulo, depositante e indicador.');return}if(!causa.trim()){setError('Informe a causa do FCA.');return}const validActions=acoes.filter(a=>a.acao.trim());if(acoes.some(a=>!a.acao.trim()&&(a.responsavel||a.prazo))){setError('Há uma ação incompleta. Informe a descrição ou remova a linha.');return}const substitution=currentUserSubstitution(dep.supervisorId,moduloId);setSaving(true);try{const created=await createFca({dataReuniao,supervisorId:dep.supervisorId,supervisorNome:sup.supervisor,moduloId,depositanteCnpj:dep.cnpj,depositanteNome:dep.nome,indicadorCodigo:ind.codigo,indicadorNome:ind.indicador,causa:causa.trim(),substituicaoId:substitution?.substituicaoId??null,substitutoId:substitution?.supervisorSubstitutoId??null,substitutoNome:substitution?.supervisorSubstituto??null,acoes:validActions});navigate(`/fca/${created.id}`,{state:{justCreated:created.numero}})}catch(err){setError(err instanceof Error?err.message:'Não foi possível salvar o FCA.')}finally{setSaving(false)}}
 return <section className="fca-page fca-editor-page">
  <PageHeader eyebrow="FCA · NOVO REGISTRO" title="Novo FCA" description="Registre o contexto, documente a causa e transforme a análise em um plano de ação rastreável." actions={<Link className="button" to="/fca"><span className="material-symbols-rounded" aria-hidden="true">arrow_back</span>Voltar</Link>}/>
  <FcaFormStepper/>
  {hasTemporaryCoverage&&<div className="substitute-context"><span className="material-symbols-rounded" aria-hidden="true">event_repeat</span><div><strong>Acesso por cobertura temporária</strong><p>Você pode selecionar seu próprio escopo ou o supervisor titular que está cobrindo. Apenas módulos e depositantes autorizados ficam disponíveis.</p></div></div>}
  <FcaEditorForm
    mode="new"
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
    cancelTo="/fca"
    onSubmit={handleSubmit}
    onDataReuniaoChange={setDataReuniao}
    onSupervisorChange={value=>{setSupervisorId(value);setModuloId('');setDepositanteCnpj('')}}
    onModuloChange={value=>{setModuloId(value);setDepositanteCnpj('')}}
    onDepositanteChange={setDepositanteCnpj}
    onIndicadorChange={setIndicadorCodigo}
    onCausaChange={setCausa}
    onActionChange={updateAction}
    onAddAction={()=>setAcoes(current=>[...current,emptyAction()])}
    onRemoveAction={index=>setAcoes(current=>current.length===1?current:current.filter((_,i)=>i!==index))}
  />
 </section>
}
