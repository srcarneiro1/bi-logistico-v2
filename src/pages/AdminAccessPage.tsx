import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Chip } from '../components/ui/Chip'
import { EmptyState, Skeleton } from '../components/ui/Feedback'
import { PageToolbar } from '../components/ui/PageToolbar'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { SearchField } from '../components/ui/SearchField'
import { SummaryMetrics } from '../components/ui/SummaryMetrics'
import { listGovernanceUsers, setGovernanceAdmin, type GovernanceUser } from '../lib/governance'
import type { HubBootstrap } from '../types/hub'

function roleLabel(role:GovernanceUser['governanceRole']){
  if(role==='OWNER')return'Owner'
  if(role==='ADMIN')return'Administrador'
  return'Usuário'
}

function roleTone(role:GovernanceUser['governanceRole']):'success'|'warning'|'neutral'{
  if(role==='OWNER')return'warning'
  if(role==='ADMIN')return'success'
  return'neutral'
}

export function AdminAccessPage({hub}:{hub:HubBootstrap}){
  const[users,setUsers]=useState<GovernanceUser[]>([])
  const[loading,setLoading]=useState(true)
  const[changingId,setChangingId]=useState<string|null>(null)
  const[error,setError]=useState<string|null>(null)
  const[message,setMessage]=useState<string|null>(null)
  const[search,setSearch]=useState('')
  const[roleFilter,setRoleFilter]=useState('ALL')
  const[pendingChange,setPendingChange]=useState<{user:GovernanceUser;makeAdmin:boolean}|null>(null)
  const isOwner=hub.profile.governanceRole==='OWNER'

  async function load(){
    if(!isOwner)return
    setLoading(true)
    setError(null)
    try{setUsers(await listGovernanceUsers())}
    catch(err){setError(err instanceof Error?err.message:'Não foi possível carregar os acessos.')}
    finally{setLoading(false)}
  }

  useEffect(()=>{void load()},[isOwner])

  const counts=useMemo(()=>({
    owner:users.filter(user=>user.governanceRole==='OWNER').length,
    admins:users.filter(user=>user.governanceRole==='ADMIN').length,
    users:users.filter(user=>user.governanceRole==='USER').length,
    inactive:users.filter(user=>!user.ativo).length,
  }),[users])

  const visibleUsers=useMemo(()=>users.filter(user=>{
    if(roleFilter!=='ALL'&&user.governanceRole!==roleFilter)return false
    if(!search.trim())return true
    const q=search.trim().toLocaleLowerCase('pt-BR')
    return `${user.nome} ${user.email} ${user.perfilOperacional} ${roleLabel(user.governanceRole)}`.toLocaleLowerCase('pt-BR').includes(q)
  }),[users,search,roleFilter])

  async function changeRole(user:GovernanceUser,makeAdmin:boolean){
    setChangingId(user.userId)
    setError(null)
    setMessage(null)
    try{
      await setGovernanceAdmin(user.userId,makeAdmin)
      setMessage(makeAdmin?`${user.nome} agora é administrador delegado.`:`O acesso administrativo de ${user.nome} foi revogado.`)
      setPendingChange(null)
      await load()
    }catch(err){setError(err instanceof Error?err.message:'Não foi possível alterar o acesso.')}
    finally{setChangingId(null)}
  }

  if(!isOwner)return <EmptyState tone="error" icon="lock" title="Acesso restrito ao Owner" description="Somente o proprietário do BI pode nomear ou revogar administradores."/>

  return <section className="admin-access-page">
    <PageHeader eyebrow="ADMINISTRAÇÃO" title="Acessos" description="Governança de administradores delegados. O Owner é permanente e não pode ser alterado por esta interface."/>

    <SummaryMetrics ariaLabel="Resumo de governança" items={[
      {key:'owner',label:'Owner',value:counts.owner,detail:'protegido',tone:'warning',icon:'shield_person'},
      {key:'admins',label:'Administradores',value:counts.admins,detail:'delegados',tone:counts.admins?'success':'neutral',icon:'admin_panel_settings'},
      {key:'users',label:'Usuários',value:counts.users,detail:'sem governança administrativa',icon:'group'},
      {key:'inactive',label:'Inativos',value:counts.inactive,detail:'cadastro sem operação',tone:counts.inactive?'warning':'neutral',icon:'person_off'},
    ]}/>

    <PageToolbar
      ariaLabel="Ferramentas de acessos"
      search={<SearchField ariaLabel="Buscar usuário" value={search} onChange={setSearch} placeholder="Buscar por nome, e-mail ou perfil…"/>}
      filters={<select aria-label="Filtrar governança" value={roleFilter} onChange={event=>setRoleFilter(event.target.value)}><option value="ALL">Todas as governanças</option><option value="OWNER">Owner</option><option value="ADMIN">Administradores</option><option value="USER">Usuários</option></select>}
    />

    {pendingChange&&<section className="admin-confirmation" role="region" aria-labelledby="admin-confirm-title">
      <div><span className="material-symbols-rounded" aria-hidden="true">verified_user</span><div><strong id="admin-confirm-title">Confirmar alteração de governança</strong><p>{pendingChange.makeAdmin?`Conceder acesso administrativo a ${pendingChange.user.nome}?`:`Revogar o acesso administrativo de ${pendingChange.user.nome}?`} O perfil operacional e o escopo logístico não serão alterados.</p></div></div>
      <div className="admin-confirmation-actions"><button type="button" className="button" onClick={()=>setPendingChange(null)}>Cancelar</button><button type="button" className="button button-primary" disabled={changingId===pendingChange.user.userId} onClick={()=>void changeRole(pendingChange.user,pendingChange.makeAdmin)}>{changingId===pendingChange.user.userId?'Processando…':'Confirmar'}</button></div>
    </section>}

    <Panel>
      <PanelHeader
        eyebrow="GOVERNANÇA"
        title="Usuários provisionados"
        description="Perfil operacional e autoridade administrativa são dimensões independentes. Conceder Admin não altera o escopo logístico da HUB."
        trailing={<Chip>{visibleUsers.length} resultado(s)</Chip>}
      />

      {message&&<div className="notice notice-success" role="status">{message}</div>}
      {loading?<Skeleton lines={5}/>:error?<EmptyState tone="error" icon="error" title="Falha ao carregar acessos" description={error} action={<button type="button" className="button" onClick={()=>void load()}>Tentar novamente</button>}/>:visibleUsers.length===0?<EmptyState icon="group_off" title="Nenhum usuário encontrado" description="Ajuste a busca ou o filtro de governança para consultar outros usuários."/>:<div className="table-wrap"><table className="responsive-data-table"><thead><tr><th scope="col">Usuário</th><th scope="col">Perfil operacional</th><th scope="col">Status</th><th scope="col">Governança</th><th scope="col">Ação</th></tr></thead><tbody>{visibleUsers.map(user=><tr key={user.userId}><td data-label="Usuário" data-primary="true"><div className="table-primary"><strong>{user.nome}</strong><span className="admin-user-email">{user.email}</span></div></td><td data-label="Perfil operacional">{user.perfilOperacional}</td><td data-label="Status"><Badge tone={user.ativo?'success':'neutral'} className="ui-status-badge">{user.ativo?'Ativo':'Inativo'}</Badge></td><td data-label="Governança"><Badge tone={roleTone(user.governanceRole)}>{roleLabel(user.governanceRole)}</Badge></td><td data-label="Ação">{user.governanceRole==='OWNER'?<span className="muted-text">Protegido</span>:user.governanceRole==='ADMIN'?<button type="button" className="button" disabled={changingId===user.userId} onClick={()=>setPendingChange({user,makeAdmin:false})}>Revogar Admin</button>:<button type="button" className="button button-primary" disabled={changingId===user.userId} onClick={()=>setPendingChange({user,makeAdmin:true})}>Tornar Admin</button>}</td></tr>)}</tbody></table></div>}
    </Panel>
  </section>
}
