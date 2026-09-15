import { useMemo, useState, type FormEvent } from 'react'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Checkbox } from 'primereact/checkbox'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Badge } from './ui/Badge'
import { Chip } from './ui/Chip'
import { EmptyState } from './ui/Feedback'
import { Panel, PanelHeader } from './ui/Panel'
import { coverageToForm, saveCoverage, saveSubstitute } from '../lib/substitutions'
import type { HubBootstrap, HubSubstituicao, HubSubstituto } from '../types/hub'

const datePt=(value:string)=>value?new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR'):'—'
type CoverageStatus='ATIVA'|'ENCERRADA'|'CANCELADA'
type CoverageForm={id:string;titularId:string;substitutoMasterId:string;moduloId:string;dataInicio:string;dataFim:string;motivo:string;status:CoverageStatus}
const emptySub={id:'',codigo:'',nome:'',email:'',fotoUrl:'',ativo:true}
const emptyCoverage:CoverageForm={id:'',titularId:'',substitutoMasterId:'',moduloId:'',dataInicio:'',dataFim:'',motivo:'',status:'ATIVA'}
const coverageStatusOptions=[{label:'Ativa',value:'ATIVA'},{label:'Encerrada',value:'ENCERRADA'},{label:'Cancelada',value:'CANCELADA'}]

export function SubstitutionManager({hub,onRefresh,startOpen=false}:{hub:HubBootstrap;onRefresh:()=>Promise<void>;startOpen?:boolean}){
 const isAdmin=hub.profile.governanceRole==='OWNER'||hub.profile.governanceRole==='ADMIN',[subForm,setSubForm]=useState(emptySub),[covForm,setCovForm]=useState<CoverageForm>(emptyCoverage),[saving,setSaving]=useState(false),[message,setMessage]=useState<string|null>(null),[adminOpen,setAdminOpen]=useState(startOpen)
 const coverage=useMemo(()=>[...hub.substituicoes].sort((a,b)=>Number(b.ativo)-Number(a.ativo)||b.dataInicio.localeCompare(a.dataInicio)),[hub.substituicoes])
 const modulesForTitular=Array.from(new Set(hub.supervisorModules.filter(m=>m.supervisorId===covForm.titularId&&m.ativo).map(m=>m.moduloId))).sort()
 const titularOptions=hub.supervisors.map(s=>({label:s.nomeExibicao,value:s.supervisorId}))
 const substituteOptions=hub.substitutos.filter(s=>s.ativo||s.id===covForm.substitutoMasterId).map(s=>({label:`${s.nome}${s.email?` · ${s.email}`:' · sem e-mail'}`,value:s.id}))
 const moduleOptions=modulesForTitular.map(m=>({label:m,value:m}))
 function editSubstitute(s:HubSubstituto){setSubForm({id:s.id,codigo:s.codigo,nome:s.nome,email:s.email??'',fotoUrl:s.fotoUrl??'',ativo:s.ativo});setAdminOpen(true);setMessage(null)}
 function editCoverage(c:HubSubstituicao){const f=coverageToForm(c);setCovForm({...f,status:f.status as CoverageStatus});setAdminOpen(true);setMessage(null)}
 async function submitSub(e:FormEvent){e.preventDefault();setSaving(true);setMessage(null);try{await saveSubstitute(subForm);setSubForm(emptySub);await onRefresh();setMessage('Substituto salvo com sucesso.')}catch(err){setMessage(err instanceof Error?err.message:'Falha ao salvar substituto.')}finally{setSaving(false)}}
 async function submitCoverage(e:FormEvent){e.preventDefault();const titular=hub.supervisors.find(s=>s.supervisorId===covForm.titularId),sub=hub.substitutos.find(s=>s.id===covForm.substitutoMasterId);if(!titular||!sub){setMessage('Selecione titular e substituto.');return}if(!covForm.moduloId||!covForm.dataInicio||!covForm.dataFim){setMessage('Preencha módulo e período da cobertura.');return}setSaving(true);setMessage(null);try{await saveCoverage({id:covForm.id||undefined,titularId:titular.supervisorId,titularNome:titular.nomeExibicao,substituto:sub,moduloId:covForm.moduloId,dataInicio:covForm.dataInicio,dataFim:covForm.dataFim,motivo:covForm.motivo,status:covForm.status});setCovForm(emptyCoverage);await onRefresh();setMessage('Cobertura salva com sucesso.')}catch(err){setMessage(err instanceof Error?err.message:'Falha ao salvar cobertura.')}finally{setSaving(false)}}
 const headerActions=<div className="coverage-head-actions"><Chip>{coverage.filter(c=>c.ativo).length} em vigor</Chip>{isAdmin&&!startOpen&&<Button type="button" label={adminOpen?'Fechar gestão':'Gerenciar'} icon={adminOpen?'pi pi-times':'pi pi-users'} outlined severity="secondary" size="small" onClick={()=>setAdminOpen(v=>!v)}/>}</div>
 return <Panel as="article" className="coverage-panel"><PanelHeader eyebrow="HISTÓRICO E VIGÊNCIA" title="Coberturas cadastradas" trailing={headerActions}/>
 {isAdmin&&adminOpen&&<div className="substitution-admin"><div className="substitution-admin-head"><div><span className="ui-eyebrow">CADASTRO</span><h3>Substituto e cobertura</h3><p>Primeiro cadastre a pessoa. Depois associe o período e o módulo que ela irá cobrir.</p></div>{message&&<span className="form-feedback" role="status">{message}</span>}</div><div className="substitution-admin-grid">
  <form className="substitution-form nx-admin-prime-form" onSubmit={submitSub}>
   <div className="form-title"><i className="pi pi-user-plus" aria-hidden="true"/><div><strong>{subForm.id?'Editar substituto':'Novo substituto'}</strong><span>Pessoa que poderá assumir uma cobertura temporária.</span></div></div>
   <label>ID / matrícula<InputText required value={subForm.codigo} onChange={e=>setSubForm({...subForm,codigo:e.target.value})}/></label>
   <label>Nome<InputText required value={subForm.nome} onChange={e=>setSubForm({...subForm,nome:e.target.value})}/></label>
   <label>E-mail de acesso<InputText type="email" value={subForm.email} onChange={e=>setSubForm({...subForm,email:e.target.value})} placeholder="nome@empresa.com.br"/></label>
   <label>URL da foto<InputText type="url" value={subForm.fotoUrl} onChange={e=>setSubForm({...subForm,fotoUrl:e.target.value})} placeholder="https://..."/></label>
   {subForm.fotoUrl&&<div className="substitute-photo-preview"><img src={subForm.fotoUrl} alt={`Prévia de ${subForm.nome||'substituto'}`} onError={e=>{e.currentTarget.style.display='none'}}/><div><strong>Prévia da foto</strong><span>Use um link público direto para a imagem.</span></div></div>}
   <label className="check-label"><Checkbox inputId="substitute-active" checked={subForm.ativo} onChange={e=>setSubForm({...subForm,ativo:Boolean(e.checked)})}/><span>Cadastro ativo</span></label>
   <div className="form-actions"><Button type="button" label="Limpar" outlined severity="secondary" onClick={()=>setSubForm(emptySub)}/><Button type="submit" label={subForm.id?'Salvar alterações':'Cadastrar substituto'} loading={saving}/></div>
   <div className="substitute-chips">{hub.substitutos.map(s=><Button type="button" key={s.id} label={`${s.nome}${s.email?' · acesso':''}`} text severity="secondary" size="small" onClick={()=>editSubstitute(s)}/>)}</div>
  </form>
  <form className="substitution-form nx-admin-prime-form" onSubmit={submitCoverage}>
   <div className="form-title"><i className="pi pi-sync" aria-hidden="true"/><div><strong>{covForm.id?'Editar cobertura':'Nova cobertura'}</strong><span>Defina titular, substituto, módulo e período.</span></div></div>
   <label>Supervisor titular<Dropdown value={covForm.titularId} options={titularOptions} onChange={e=>setCovForm({...covForm,titularId:String(e.value??''),moduloId:''})} placeholder="Selecione" filter required/></label>
   <label>Substituto<Dropdown value={covForm.substitutoMasterId} options={substituteOptions} onChange={e=>setCovForm({...covForm,substitutoMasterId:String(e.value??'')})} placeholder="Selecione" filter required/></label>
   <label>Módulo<Dropdown value={covForm.moduloId} options={moduleOptions} onChange={e=>setCovForm({...covForm,moduloId:String(e.value??'')})} placeholder="Selecione" required/></label>
   <div className="date-pair"><label>Início<InputText required type="date" value={covForm.dataInicio} onChange={e=>setCovForm({...covForm,dataInicio:e.target.value})}/></label><label>Fim<InputText required type="date" min={covForm.dataInicio||undefined} value={covForm.dataFim} onChange={e=>setCovForm({...covForm,dataFim:e.target.value})}/></label></div>
   <label>Motivo<InputText value={covForm.motivo} onChange={e=>setCovForm({...covForm,motivo:e.target.value})} placeholder="Férias, afastamento…"/></label>
   <label>Status<Dropdown value={covForm.status} options={coverageStatusOptions} onChange={e=>setCovForm({...covForm,status:String(e.value) as CoverageStatus})}/></label>
   <div className="form-actions"><Button type="button" label="Limpar" outlined severity="secondary" onClick={()=>setCovForm(emptyCoverage)}/><Button type="submit" label={covForm.id?'Salvar alterações':'Cadastrar cobertura'} loading={saving}/></div>
  </form>
 </div></div>}
 {coverage.length?<div className="coverage-card-grid">{coverage.map(c=>{const titular=hub.supervisors.find(s=>s.supervisorId===c.supervisorTitularId);return <Card className="coverage-card nx-entity-card" key={c.substituicaoId}><div className="coverage-card-top"><Badge tone={c.ativo?'success':'neutral'} className="ui-status-badge">{c.ativo?'Em vigor':c.status==='CANCELADA'?'Cancelada':'Encerrada'}</Badge>{isAdmin&&c.origem==='SUPABASE'&&<Button type="button" icon="pi pi-pencil" text rounded severity="secondary" aria-label={`Editar cobertura de ${c.supervisorSubstituto}`} onClick={()=>editCoverage(c)}/>}</div><div className="coverage-people"><div><small>Titular</small><strong>{titular?.nomeExibicao??c.supervisorTitularId}</strong></div><i className="pi pi-arrow-right" aria-hidden="true"/><div><small>Substituto</small><strong>{c.supervisorSubstituto}</strong><span>{c.supervisorSubstitutoEmail??'Sem e-mail de acesso'}</span></div></div><div className="coverage-meta"><div><small>Módulo</small><strong>{c.moduloId}</strong></div><div><small>Período</small><strong>{datePt(c.dataInicio)} — {datePt(c.dataFim)}</strong></div></div>{c.motivo&&<p className="coverage-reason">{c.motivo}</p>}</Card>})}</div>:<EmptyState icon="event_busy" title="Nenhuma cobertura cadastrada" description="Crie uma cobertura para associar um substituto a um supervisor, módulo e período."/>}
 </Panel>
}
