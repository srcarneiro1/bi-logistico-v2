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
type EditorMode='substitute'|'coverage'|null
const emptySub={id:'',codigo:'',nome:'',email:'',fotoUrl:'',ativo:true}
const emptyCoverage:CoverageForm={id:'',titularId:'',substitutoMasterId:'',moduloId:'',dataInicio:'',dataFim:'',motivo:'',status:'ATIVA'}
const coverageStatusOptions=[{label:'Ativa',value:'ATIVA'},{label:'Encerrada',value:'ENCERRADA'},{label:'Cancelada',value:'CANCELADA'}]

export function SubstitutionManager({hub,onRefresh}:{hub:HubBootstrap;onRefresh:()=>Promise<void>}){
 const isAdmin=hub.profile.governanceRole==='OWNER'||hub.profile.governanceRole==='ADMIN'
 const[subForm,setSubForm]=useState(emptySub)
 const[covForm,setCovForm]=useState<CoverageForm>(emptyCoverage)
 const[saving,setSaving]=useState(false)
 const[message,setMessage]=useState<string|null>(null)
 const[editor,setEditor]=useState<EditorMode>(null)
 const coverage=useMemo(()=>[...hub.substituicoes].sort((a,b)=>Number(b.ativo)-Number(a.ativo)||b.dataInicio.localeCompare(a.dataInicio)),[hub.substituicoes])
 const modulesForTitular=Array.from(new Set(hub.supervisorModules.filter(m=>m.supervisorId===covForm.titularId&&m.ativo).map(m=>m.moduloId))).sort()
 const titularOptions=hub.supervisors.map(s=>({label:s.nomeExibicao,value:s.supervisorId}))
 const substituteOptions=hub.substitutos.filter(s=>s.ativo||s.id===covForm.substitutoMasterId).map(s=>({label:`${s.nome}${s.email?` · ${s.email}`:' · sem e-mail'}`,value:s.id}))
 const moduleOptions=modulesForTitular.map(m=>({label:m,value:m}))
 const activeCount=coverage.filter(c=>c.ativo).length
 const activeSubstitutes=hub.substitutos.filter(s=>s.ativo).length

 function openNewSubstitute(){setSubForm(emptySub);setEditor('substitute');setMessage(null)}
 function openNewCoverage(){setCovForm(emptyCoverage);setEditor('coverage');setMessage(null)}
 function closeEditor(){if(saving)return;setEditor(null);setMessage(null)}
 function editSubstitute(s:HubSubstituto){setSubForm({id:s.id,codigo:s.codigo,nome:s.nome,email:s.email??'',fotoUrl:s.fotoUrl??'',ativo:s.ativo});setEditor('substitute');setMessage(null)}
 function editCoverage(c:HubSubstituicao){const f=coverageToForm(c);setCovForm({...f,status:f.status as CoverageStatus});setEditor('coverage');setMessage(null)}
 async function submitSub(e:FormEvent){e.preventDefault();setSaving(true);setMessage(null);try{await saveSubstitute(subForm);setSubForm(emptySub);await onRefresh();setMessage('Substituto salvo com sucesso.');setEditor(null)}catch(err){setMessage(err instanceof Error?err.message:'Falha ao salvar substituto.')}finally{setSaving(false)}}
 async function submitCoverage(e:FormEvent){e.preventDefault();const titular=hub.supervisors.find(s=>s.supervisorId===covForm.titularId),sub=hub.substitutos.find(s=>s.id===covForm.substitutoMasterId);if(!titular||!sub){setMessage('Selecione titular e substituto.');return}if(!covForm.moduloId||!covForm.dataInicio||!covForm.dataFim){setMessage('Preencha módulo e período da cobertura.');return}setSaving(true);setMessage(null);try{await saveCoverage({id:covForm.id||undefined,titularId:titular.supervisorId,titularNome:titular.nomeExibicao,substituto:sub,moduloId:covForm.moduloId,dataInicio:covForm.dataInicio,dataFim:covForm.dataFim,motivo:covForm.motivo,status:covForm.status});setCovForm(emptyCoverage);await onRefresh();setMessage('Cobertura salva com sucesso.');setEditor(null)}catch(err){setMessage(err instanceof Error?err.message:'Falha ao salvar cobertura.')}finally{setSaving(false)}}

 const headerActions=<div className="coverage-head-actions"><Chip tone={activeCount?'success':'neutral'}>{activeCount} em vigor</Chip>{isAdmin&&<><Button type="button" label="Novo substituto" icon="pi pi-user-plus" outlined severity="secondary" size="small" onClick={openNewSubstitute}/><Button type="button" label="Nova cobertura" icon="pi pi-plus" size="small" onClick={openNewCoverage}/></>}</div>

 return <Panel as="article" className="coverage-panel">
  <PanelHeader eyebrow="HISTÓRICO E VIGÊNCIA" title="Coberturas cadastradas" description="Consulte vigências e abra o cadastro somente quando precisar incluir ou editar uma pessoa ou cobertura." trailing={headerActions}/>

  {message&&<div className="substitution-notice" role="status"><i className="pi pi-check-circle" aria-hidden="true"/><span>{message}</span></div>}

  {isAdmin&&editor&&<section className="substitution-editor" aria-label={editor==='substitute'?'Cadastro de substituto':'Cadastro de cobertura'}>
   <div className="substitution-editor-head"><div><span className="ui-eyebrow">{editor==='substitute'?'PESSOA SUBSTITUTA':'COBERTURA TEMPORÁRIA'}</span><h3>{editor==='substitute'?(subForm.id?'Editar substituto':'Novo substituto'):(covForm.id?'Editar cobertura':'Nova cobertura')}</h3><p>{editor==='substitute'?'Cadastre a pessoa que poderá receber acesso temporário durante uma cobertura.':'Associe supervisor titular, substituto, módulo e período de vigência.'}</p></div><Button type="button" icon="pi pi-times" text rounded severity="secondary" aria-label="Fechar editor" onClick={closeEditor}/></div>

   {editor==='substitute'?<form className="substitution-form nx-admin-prime-form is-single" onSubmit={submitSub}>
    <div className="substitution-form-grid">
     <label>ID / matrícula<InputText required value={subForm.codigo} onChange={e=>setSubForm({...subForm,codigo:e.target.value})}/></label>
     <label>Nome<InputText required value={subForm.nome} onChange={e=>setSubForm({...subForm,nome:e.target.value})}/></label>
     <label>E-mail de acesso<InputText type="email" value={subForm.email} onChange={e=>setSubForm({...subForm,email:e.target.value})} placeholder="nome@empresa.com.br"/></label>
     <label>URL da foto<InputText type="url" value={subForm.fotoUrl} onChange={e=>setSubForm({...subForm,fotoUrl:e.target.value})} placeholder="https://..."/></label>
    </div>
    {subForm.fotoUrl&&<div className="substitute-photo-preview"><img src={subForm.fotoUrl} alt={`Prévia de ${subForm.nome||'substituto'}`} onError={e=>{e.currentTarget.style.display='none'}}/><div><strong>Prévia da foto</strong><span>Use um link público direto para a imagem.</span></div></div>}
    <label className="check-label"><Checkbox inputId="substitute-active" checked={subForm.ativo} onChange={e=>setSubForm({...subForm,ativo:Boolean(e.checked)})}/><span>Cadastro ativo</span></label>
    <div className="form-actions"><Button type="button" label="Cancelar" text severity="secondary" onClick={closeEditor}/><Button type="submit" label={subForm.id?'Salvar alterações':'Cadastrar substituto'} icon="pi pi-check" loading={saving}/></div>
   </form>:<form className="substitution-form nx-admin-prime-form is-single" onSubmit={submitCoverage}>
    <div className="substitution-form-grid">
     <label>Supervisor titular<Dropdown value={covForm.titularId} options={titularOptions} onChange={e=>setCovForm({...covForm,titularId:String(e.value??''),moduloId:''})} placeholder="Selecione" filter required/></label>
     <label>Substituto<Dropdown value={covForm.substitutoMasterId} options={substituteOptions} onChange={e=>setCovForm({...covForm,substitutoMasterId:String(e.value??'')})} placeholder="Selecione" filter required/></label>
     <label>Módulo<Dropdown value={covForm.moduloId} options={moduleOptions} onChange={e=>setCovForm({...covForm,moduloId:String(e.value??'')})} placeholder="Selecione" required/></label>
     <label>Status<Dropdown value={covForm.status} options={coverageStatusOptions} onChange={e=>setCovForm({...covForm,status:String(e.value) as CoverageStatus})}/></label>
     <label>Início<InputText required type="date" value={covForm.dataInicio} onChange={e=>setCovForm({...covForm,dataInicio:e.target.value})}/></label>
     <label>Fim<InputText required type="date" min={covForm.dataInicio||undefined} value={covForm.dataFim} onChange={e=>setCovForm({...covForm,dataFim:e.target.value})}/></label>
     <label className="substitution-field-wide">Motivo<InputText value={covForm.motivo} onChange={e=>setCovForm({...covForm,motivo:e.target.value})} placeholder="Férias, afastamento…"/></label>
    </div>
    <div className="form-actions"><Button type="button" label="Cancelar" text severity="secondary" onClick={closeEditor}/><Button type="submit" label={covForm.id?'Salvar alterações':'Cadastrar cobertura'} icon="pi pi-check" loading={saving}/></div>
   </form>}
  </section>}

  {isAdmin&&<section className="substitute-registry" aria-label="Substitutos cadastrados">
   <div className="substitute-registry-head"><div><span className="ui-eyebrow">PESSOAS</span><strong>Substitutos cadastrados</strong><small>{activeSubstitutes} ativo(s) de {hub.substitutos.length} cadastro(s)</small></div><Button type="button" label="Novo substituto" icon="pi pi-user-plus" text severity="secondary" size="small" onClick={openNewSubstitute}/></div>
   {hub.substitutos.length?<div className="substitute-registry-list">{hub.substitutos.map(s=><button type="button" key={s.id} className="substitute-registry-row" onClick={()=>editSubstitute(s)}><span className="substitute-registry-avatar" aria-hidden="true">{s.nome.slice(0,2).toUpperCase()}</span><span className="substitute-registry-copy"><strong>{s.nome}</strong><small>{s.email??'Sem e-mail de acesso'} · {s.codigo}</small></span><Badge tone={s.ativo?'success':'neutral'}>{s.ativo?'Ativo':'Inativo'}</Badge><i className="pi pi-pencil" aria-hidden="true"/></button>)}</div>:<EmptyState icon="person_off" title="Nenhum substituto cadastrado" description="Cadastre a primeira pessoa antes de criar uma cobertura."/>}
  </section>}

  {coverage.length?<div className="coverage-card-grid">{coverage.map(c=>{const titular=hub.supervisors.find(s=>s.supervisorId===c.supervisorTitularId);return <Card className="coverage-card nx-entity-card" key={c.substituicaoId}><div className="coverage-card-top"><Badge tone={c.ativo?'success':'neutral'} className="ui-status-badge">{c.ativo?'Em vigor':c.status==='CANCELADA'?'Cancelada':'Encerrada'}</Badge>{isAdmin&&c.origem==='SUPABASE'&&<Button type="button" icon="pi pi-pencil" text rounded severity="secondary" aria-label={`Editar cobertura de ${c.supervisorSubstituto}`} onClick={()=>editCoverage(c)}/>}</div><div className="coverage-people"><div><small>Titular</small><strong>{titular?.nomeExibicao??c.supervisorTitularId}</strong></div><i className="pi pi-arrow-right" aria-hidden="true"/><div><small>Substituto</small><strong>{c.supervisorSubstituto}</strong><span>{c.supervisorSubstitutoEmail??'Sem e-mail de acesso'}</span></div></div><div className="coverage-meta"><div><small>Módulo</small><strong>{c.moduloId}</strong></div><div><small>Período</small><strong>{datePt(c.dataInicio)} — {datePt(c.dataFim)}</strong></div></div>{c.motivo&&<p className="coverage-reason">{c.motivo}</p>}</Card>})}</div>:<EmptyState icon="event_busy" title="Nenhuma cobertura cadastrada" description="Crie uma cobertura para associar um substituto a um supervisor, módulo e período."/>}
 </Panel>
}
