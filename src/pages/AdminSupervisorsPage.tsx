import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Chip } from '../components/ui/Chip'
import { EmptyState } from '../components/ui/Feedback'
import { PageToolbar } from '../components/ui/PageToolbar'
import { SearchField } from '../components/ui/SearchField'
import { SectionHeader } from '../components/ui/SectionHeader'
import { SummaryMetrics } from '../components/ui/SummaryMetrics'
import { deleteSupervisorPhoto, uploadSupervisorPhoto } from '../lib/api'
import type { HubBootstrap, HubSupervisor } from '../types/hub'

function SupervisorAvatar({supervisor}:{supervisor:HubSupervisor}){
  const[failed,setFailed]=useState(false)
  useEffect(()=>setFailed(false),[supervisor.fotoUrl])
  if(supervisor.fotoUrl&&!failed)return <img src={supervisor.fotoUrl} alt="" onError={()=>setFailed(true)}/>
  return <span aria-hidden="true">{supervisor.nomeExibicao.slice(0,2).toUpperCase()}</span>
}

function sourceLabel(supervisor:HubSupervisor){
  if(supervisor.fotoSource==='SUPABASE')return'Foto interna'
  if(supervisor.fotoUrl)return'Fallback HUB'
  return'Sem foto'
}

export function AdminSupervisorsPage({hub,onRefresh}:{hub:HubBootstrap;onRefresh:()=>Promise<void>}){
  const[search,setSearch]=useState('')
  const[workingId,setWorkingId]=useState<string|null>(null)
  const[error,setError]=useState<string|null>(null)
  const[message,setMessage]=useState<string|null>(null)
  const isAdmin=hub.profile.governanceRole==='OWNER'||hub.profile.governanceRole==='ADMIN'

  const supervisors=useMemo(()=>hub.supervisors.filter(supervisor=>{
    if(!search.trim())return true
    const q=search.trim().toLocaleLowerCase('pt-BR')
    return `${supervisor.nomeExibicao} ${supervisor.email} ${supervisor.supervisorId}`.toLocaleLowerCase('pt-BR').includes(q)
  }),[hub.supervisors,search])

  const internal=hub.supervisors.filter(supervisor=>supervisor.fotoSource==='SUPABASE').length
  const fallback=hub.supervisors.filter(supervisor=>supervisor.fotoSource!=='SUPABASE'&&Boolean(supervisor.fotoUrl)).length
  const missing=hub.supervisors.filter(supervisor=>!supervisor.fotoUrl).length

  async function handleFile(supervisor:HubSupervisor,event:ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0]
    event.target.value=''
    if(!file)return
    setWorkingId(supervisor.supervisorId)
    setError(null)
    setMessage(null)
    try{
      await uploadSupervisorPhoto(supervisor.supervisorId,file)
      await onRefresh()
      setMessage(`Foto de ${supervisor.nomeExibicao} salva no Supabase.`)
    }catch(err){setError(err instanceof Error?err.message:'Não foi possível atualizar a foto.')}
    finally{setWorkingId(null)}
  }

  async function removePhoto(supervisor:HubSupervisor){
    setWorkingId(supervisor.supervisorId)
    setError(null)
    setMessage(null)
    try{
      await deleteSupervisorPhoto(supervisor.supervisorId)
      await onRefresh()
      setMessage(`Foto interna de ${supervisor.nomeExibicao} removida. O BI voltou ao fallback da HUB.`)
    }catch(err){setError(err instanceof Error?err.message:'Não foi possível remover a foto interna.')}
    finally{setWorkingId(null)}
  }

  if(!isAdmin)return <EmptyState tone="error" icon="lock" title="Área exclusiva para administradores" description="Somente Owner ou Administrador pode gerenciar fotos de supervisores."/>

  return <section className="admin-supervisors-page">
    <PageHeader eyebrow="ADMINISTRAÇÃO" title="Fotos de supervisores" description="Gerencie apenas as fotos usadas pelo BI. Nome, e-mail, SupervisorID, módulos e demais dados continuam sendo controlados pela HUB."/>

    <SummaryMetrics ariaLabel="Resumo das fotos de supervisores" items={[
      {key:'total',label:'Supervisores',value:hub.supervisors.length,detail:'cadastros da HUB',icon:'groups'},
      {key:'internal',label:'Fotos internas',value:internal,detail:'armazenadas no Supabase',icon:'cloud_done',tone:internal?'success':'neutral'},
      {key:'fallback',label:'Fallback HUB',value:fallback,detail:'ainda dependem do SharePoint',icon:'link',tone:fallback?'warning':'neutral'},
      {key:'missing',label:'Sem foto',value:missing,detail:'sem imagem disponível',icon:'person_off',tone:missing?'warning':'neutral'},
    ]}/>

    <PageToolbar ariaLabel="Ferramentas de fotos de supervisores" search={<SearchField ariaLabel="Buscar supervisor" value={search} onChange={setSearch} placeholder="Buscar por nome, e-mail ou ID…"/>}/>

    <div className="admin-guidance"><span className="material-symbols-rounded" aria-hidden="true">image</span><div><strong>Fonte das fotos</strong><p>Uma foto cadastrada aqui tem prioridade sobre a FotoURL da HUB. JPG, PNG ou WEBP até 2 MB. Se o override for removido, o BI volta automaticamente a usar a imagem informada na HUB.</p></div></div>
    {error&&<div className="notice notice-error" role="alert">{error}</div>}
    {message&&<div className="notice notice-success" role="status">{message}</div>}

    <SectionHeader eyebrow="CADASTRO VISUAL" title="Supervisores da HUB" description="A origem da foto é exibida em cada registro; o restante do cadastro permanece somente leitura nesta área." trailing={<Chip>{supervisors.length} resultado(s)</Chip>}/>
    {supervisors.length===0?<EmptyState icon="group_off" title="Nenhum supervisor encontrado" description="Ajuste a busca para consultar outros supervisores."/>:<div className="admin-supervisor-grid">{supervisors.map(supervisor=>{
      const working=workingId===supervisor.supervisorId
      return <article className="admin-supervisor-card" key={supervisor.supervisorId}>
        <div className="admin-supervisor-card-head">
          <div className="admin-supervisor-avatar"><SupervisorAvatar supervisor={supervisor}/></div>
          <div className="admin-supervisor-identity"><strong>{supervisor.nomeExibicao}</strong><span>{supervisor.email||'Sem e-mail'}</span><small>ID {supervisor.supervisorId}</small></div>
          <Badge tone={supervisor.fotoSource==='SUPABASE'?'success':supervisor.fotoUrl?'warning':'neutral'}>{sourceLabel(supervisor)}</Badge>
        </div>
        <div className="admin-supervisor-actions">
          <label className={`button button-primary ${working?'is-disabled':''}`}>
            <span className="material-symbols-rounded" aria-hidden="true">upload</span>{working?'Processando…':supervisor.fotoSource==='SUPABASE'?'Substituir foto':'Cadastrar foto'}
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={working} onChange={event=>void handleFile(supervisor,event)}/>
          </label>
          {supervisor.fotoSource==='SUPABASE'&&<button type="button" className="button" disabled={working} onClick={()=>void removePhoto(supervisor)}>Remover foto interna</button>}
        </div>
      </article>
    })}</div>}
  </section>
}
