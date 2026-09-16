import { FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { FcaFormStepper } from '../components/fca/FcaFormStepper'
import { PageHeader } from '../components/PageHeader'
import { ContextNotice } from '../components/ui/ContextNotice'
import type { HubBootstrap } from '../types/hub'
import type { FcaActionStatus, NewFcaAction } from '../types/fca'
import { createFca } from '../lib/fca'

const emptyAction=():NewFcaAction=>({acao:'',responsavel:'',prazo:'',status:'ABERTO'})
const todaySaoPaulo=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date())
const emailKey=(value:string|null|undefined)=>String(value??'').trim().toLowerCase()
const actionStatusOptions=[
 {label:'Aberto',value:'ABERTO'},
 {label:'Em andamento',value:'EM_ANDAMENTO'},
 {label:'Concluído',value:'CONCLUIDO'},
 {label:'Cancelado',value:'CANCELADO'},
]

export function NewFcaPage({hub}:{hub:HubBootstrap}){
 const navigate=useNavigate(),isAdmin=hub.profile.perfil==='ADMIN'
 const hasTemporaryCoverage=!isAdmin&&hub.supervisors.some(s=>s.supervisorId!==hub.profile.supervisorId)
 const canChooseSupervisor=isAdmin||hasTemporaryCoverage||!hub.profile.supervisorId
 const initialSupervisorId=isAdmin?'':hub.profile.supervisorId??(hub.supervisors.length===1?hub.supervisors[0].supervisorId:'')
 const[dataReuniao,setDataReuniao]=useState(todaySaoPaulo()),[supervisorId,setSupervisorId]=useState(initialSupervisorId),[moduloId,setModuloId]=useState(''),[depositanteCnpj,setDepositanteCnpj]=useState(''),[indicadorCodigo,setIndicadorCodigo]=useState(''),[causa,setCausa]=useState(''),[acoes,setAcoes]=useState<NewFcaAction[]>([emptyAction()]),[saving,setSaving]=useState(false),[error,setError]=useState<string|null>(null)
 const modules=useMemo(()=>Array.from(new Set(hub.supervisorModules.filter(i=>!supervisorId||i.supervisorId===supervisorId).map(i=>i.moduloId))).sort(),[hub.supervisorModules,supervisorId])
 const depositantes=useMemo(()=>hub.depositantes.filter(i=>(!supervisorId||i.supervisorId===supervisorId)&&(!moduloId||i.moduloId===moduloId)).sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR')),[hub.depositantes,supervisorId,moduloId])
 const indicadores=useMemo(()=>hub.indicadores.filter(i=>i.grupo.trim().toUpperCase()==='KPI').sort((a,b)=>a.indicador.localeCompare(b.indicador,'pt-BR')),[hub.indicadores])
 const supervisorOptions=hub.supervisors.map(i=>({label:i.nomeExibicao,value:i.supervisorId}))
 const moduleOptions=modules.map(i=>({label:i,value:i}))
 const depositorOptions=depositantes.map(i=>({label:`${i.nome} · ${i.cnpj}`,value:i.cnpj}))
 const indicatorOptions=indicadores.map(i=>({label:i.indicador,value:i.codigo}))
 function updateAction(index:number,field:keyof NewFcaAction,value:string){setAcoes(c=>c.map((a,i)=>i===index?{...a,[field]:value}:a))}
 function currentUserSubstitution(targetSupervisorId:string,targetModuloId:string){return hub.substituicoes.find(i=>i.ativo&&i.supervisorTitularId===targetSupervisorId&&i.moduloId===targetModuloId&&((hub.profile.supervisorId&&i.supervisorSubstitutoId===hub.profile.supervisorId)||emailKey(i.supervisorSubstitutoEmail)===emailKey(hub.profile.email)))}
 async function handleSubmit(event:FormEvent){event.preventDefault();setError(null);const dep=depositantes.find(i=>i.cnpj===depositanteCnpj),ind=indicadores.find(i=>i.codigo===indicadorCodigo),sup=hub.supervisors.find(i=>i.supervisorId===dep?.supervisorId);if(!dep||!ind||!sup||!moduloId){setError('Preencha supervisor, módulo, depositante e indicador.');return}if(!causa.trim()){setError('Informe a causa do FCA.');return}const validActions=acoes.filter(a=>a.acao.trim());if(acoes.some(a=>!a.acao.trim()&&(a.responsavel||a.prazo))){setError('Há uma ação incompleta. Informe a descrição ou remova a linha.');return}const substitution=currentUserSubstitution(dep.supervisorId,moduloId);setSaving(true);try{const created=await createFca({dataReuniao,supervisorId:dep.supervisorId,supervisorNome:sup.supervisor,moduloId,depositanteCnpj:dep.cnpj,depositanteNome:dep.nome,indicadorCodigo:ind.codigo,indicadorNome:ind.indicador,causa:causa.trim(),substituicaoId:substitution?.substituicaoId??null,substitutoId:substitution?.supervisorSubstitutoId??null,substitutoNome:substitution?.supervisorSubstituto??null,acoes:validActions});navigate(`/fca/${created.id}`,{state:{justCreated:created.numero}})}catch(err){setError(err instanceof Error?err.message:'Não foi possível salvar o FCA.')}finally{setSaving(false)}}
 return <section className="fca-page fca-editor-page">
  <PageHeader eyebrow="FCA · NOVO REGISTRO" title="Novo FCA" description="Registre o contexto, documente a causa e transforme a análise em um plano de ação rastreável." actions={<Button type="button" label="Voltar" icon="pi pi-arrow-left" outlined severity="secondary" onClick={()=>navigate('/fca')}/>}/>
  <FcaFormStepper/>
  {hasTemporaryCoverage&&<ContextNotice icon="event_repeat" title="Acesso por cobertura temporária" description="Você pode selecionar seu próprio escopo ou o supervisor titular que está cobrindo. Apenas módulos e depositantes autorizados ficam disponíveis."/>}
  <form className="fca-form" onSubmit={handleSubmit}>
   <div className="form-section"><div className="form-section-heading"><div><h2>Identificação</h2><p>Defina o contexto operacional do registro.</p></div></div><div className="form-grid form-grid-3"><div><label>Data da reunião</label><InputText type="date" value={dataReuniao} onChange={e=>setDataReuniao(e.target.value)} required/></div><div><label>Supervisor titular</label><Dropdown value={supervisorId} options={supervisorOptions} onChange={e=>{setSupervisorId(String(e.value??''));setModuloId('');setDepositanteCnpj('')}} placeholder="Selecione" disabled={!canChooseSupervisor} required className="fca-prime-control"/></div><div><label>Módulo</label><Dropdown value={moduloId} options={moduleOptions} onChange={e=>{setModuloId(String(e.value??''));setDepositanteCnpj('')}} placeholder="Selecione" required className="fca-prime-control"/></div><div className="span-2"><label>Depositante</label><Dropdown value={depositanteCnpj} options={depositorOptions} onChange={e=>setDepositanteCnpj(String(e.value??''))} placeholder="Selecione pelo nome" filter showClear required className="fca-prime-control"/></div><div><label>Indicador</label><Dropdown value={indicadorCodigo} options={indicatorOptions} onChange={e=>setIndicadorCodigo(String(e.value??''))} placeholder="Selecione" filter required className="fca-prime-control"/></div></div></div>
   <div className="form-section"><div className="form-section-heading"><div><h2>Análise da causa</h2><p>Documente o desvio com contexto suficiente para leitura e auditoria.</p></div></div><label>Causa / desvio identificado</label><InputTextarea value={causa} onChange={e=>setCausa(e.target.value)} rows={6} autoResize={false} placeholder="Descreva o problema, o impacto e a causa identificada…" required/></div>
   <div className="form-section"><div className="form-section-heading-row"><div className="form-section-heading"><div><h2>Plano de ação</h2><p>Defina ações, responsáveis, prazos e acompanhamento.</p></div></div><Button type="button" label="Nova ação" icon="pi pi-plus" outlined severity="secondary" onClick={()=>setAcoes(c=>[...c,emptyAction()])}/></div><div className="actions-stack">{acoes.map((acao,index)=><div className="action-card" key={index}><div className="action-card-title"><span className="action-number">{String(index+1).padStart(2,'0')}</span><strong>Ação</strong><Button type="button" label="Remover" icon="pi pi-trash" text severity="danger" className="action-remove" onClick={()=>setAcoes(c=>c.length===1?c:c.filter((_,i)=>i!==index))} disabled={acoes.length===1}/></div><div className="form-grid form-grid-action"><div className="span-2"><label>Descrição da ação</label><InputTextarea rows={3} autoResize={false} value={acao.acao} onChange={e=>updateAction(index,'acao',e.target.value)}/></div><div><label>Responsável</label><InputText value={acao.responsavel} onChange={e=>updateAction(index,'responsavel',e.target.value)}/></div><div><label>Prazo</label><InputText type="date" value={acao.prazo} onChange={e=>updateAction(index,'prazo',e.target.value)}/></div><div><label>Status</label><Dropdown value={acao.status} options={actionStatusOptions} onChange={e=>updateAction(index,'status',String(e.value) as FcaActionStatus)} className="fca-prime-control"/></div></div></div>)}</div></div>
   {error&&<div className="notice notice-error" role="alert">{error}</div>}<div className="form-actions sticky-form-actions"><Button type="button" label="Cancelar" outlined severity="secondary" onClick={()=>navigate('/fca')}/><Button label="Salvar FCA" type="submit" loading={saving}/></div>
  </form>
 </section>
}
