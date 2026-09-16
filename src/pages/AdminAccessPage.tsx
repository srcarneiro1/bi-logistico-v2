import { useEffect, useMemo, useState } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dropdown } from 'primereact/dropdown'
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

const roleOptions=[
  {label:'Todas as governanças',value:'ALL'},
  {label:'Owner',value:'OWNER'},
  {label:'Administradores',value:'ADMIN'},
  {label:'Usuários',value:'USER'},
]

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

  const userBody=(user:GovernanceUser)=><div className="table-primary"><strong>{user.nome}</strong><span className="admin-user-email">{user.email}</span></div>
  const operationalBody=(user:GovernanceUser)=><span>{user.perfilOperacional}</span>
  const activeBody=(user:GovernanceUser)=><Badge tone={user.ativo?'success':'neutral'} className="ui-status-badge">{user.ativo?'Ativo':'Inativo'}</Badge>
  const governanceBody=(user:GovernanceUser)=><Badge tone={roleTone(user.governanceRole)}>{roleLabel(user.governanceRole)}</Badge>
  const actionBody=(user:GovernanceUser)=>user.governanceRole==='OWNER'
    ?<span className="muted-text">Protegido</span>
    :user.governanceRole==='ADMIN'
      ?<Button type="button" label="Revogar Admin" outlined severity="secondary" size="small" disabled={changingId===user.userId} onClick={()=>setPendingChange({user,makeAdmin:false})}/>
      :<Button type="button" label="Tornar Admin" size="small" disabled={changingId===user.userId} onClick={()=>setPendingChange({user,makeAdmin:true})}/>

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
      filters={<Dropdown aria-label="Filtrar governança" value={roleFilter} options={roleOptions} onChange={event=>setRoleFilter(String(event.value))} className="admin-role-filter"/>}
    />

    {pendingChange&&<section className="admin-confirmation" role="region" aria-labelledby="admin-confirm-title">
      <div><i className="pi pi-shield" aria-hidden="true"/><div><strong id="admin-confirm-title">Confirmar alteração de governança</strong><p>{pendingChange.makeAdmin?`Conceder acesso administrativo a ${pendingChange.user.nome}?`:`Revogar o acesso administrativo de ${pendingChange.user.nome}?`} O perfil operacional e o escopo logístico não serão alterados.</p></div></div>
      <div className="admin-confirmation-actions"><Button type="button" label="Cancelar" outlined severity="secondary" onClick={()=>setPendingChange(null)}/><Button type="button" label="Confirmar" loading={changingId===pendingChange.user.userId} onClick={()=>void changeRole(pendingChange.user,pendingChange.makeAdmin)}/></div>
    </section>}

    <Panel>
      <PanelHeader
        eyebrow="GOVERNANÇA"
        title="Usuários provisionados"
        description="Perfil operacional e autoridade administrativa são dimensões independentes. Conceder Admin não altera o escopo logístico da HUB."
        trailing={<Chip>{visibleUsers.length} resultado(s)</Chip>}
      />

      {message&&<div className="notice notice-success" role="status">{message}</div>}
      {loading?<Skeleton lines={5}/>:error?<EmptyState tone="error" icon="error" title="Falha ao carregar acessos" description={error} action={<Button type="button" label="Tentar novamente" outlined severity="secondary" onClick={()=>void load()}/>}/>:visibleUsers.length===0?<EmptyState icon="group_off" title="Nenhum usuário encontrado" description="Ajuste a busca ou o filtro de governança para consultar outros usuários."/>:<>
        <div className="admin-access-prime-table" aria-label="Usuários provisionados">
          <DataTable value={visibleUsers} dataKey="userId" size="small" rowHover responsiveLayout="scroll" className="nx-prime-table" tableStyle={{minWidth:'760px'}}>
            <Column header="Usuário" body={userBody}/>
            <Column header="Perfil operacional" body={operationalBody}/>
            <Column header="Status" body={activeBody}/>
            <Column header="Governança" body={governanceBody}/>
            <Column header="Ação" body={actionBody}/>
          </DataTable>
        </div>
        <div className="admin-access-mobile-records" role="list" aria-label="Usuários provisionados">
          {visibleUsers.map(user=><article key={user.userId} className="admin-access-mobile-record" role="listitem"><header>{userBody(user)}{governanceBody(user)}</header><div className="admin-access-mobile-meta"><div><span>Perfil operacional</span><strong>{user.perfilOperacional}</strong></div><div><span>Status</span>{activeBody(user)}</div></div><footer>{actionBody(user)}</footer></article>)}
        </div>
      </>}
    </Panel>
  </section>
}
