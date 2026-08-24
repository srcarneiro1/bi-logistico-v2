import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Badge } from '../components/ui/Badge'
import { EmptyState, Skeleton } from '../components/ui/Feedback'
import { Panel, PanelHeader } from '../components/ui/Panel'
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
    admins:users.filter(user=>user.governanceRole==='ADMIN').length,
    users:users.filter(user=>user.governanceRole==='USER').length,
  }),[users])

  async function changeRole(user:GovernanceUser,makeAdmin:boolean){
    const verb=makeAdmin?'conceder acesso administrativo a':'revogar o acesso administrativo de'
    if(!window.confirm(`Confirma ${verb} ${user.nome}?`))return
    setChangingId(user.userId)
    setError(null)
    setMessage(null)
    try{
      await setGovernanceAdmin(user.userId,makeAdmin)
      setMessage(makeAdmin?`${user.nome} agora é administrador delegado.`:`O acesso administrativo de ${user.nome} foi revogado.`)
      await load()
    }catch(err){setError(err instanceof Error?err.message:'Não foi possível alterar o acesso.')}
    finally{setChangingId(null)}
  }

  if(!isOwner)return <EmptyState tone="error" icon="lock" title="Acesso restrito ao Owner" description="Somente o proprietário do BI pode nomear ou revogar administradores."/>

  return <>
    <PageHeader eyebrow="Administração" title="Acessos" description="Governança de administradores delegados. O Owner é permanente e não pode ser alterado por esta interface."/>

    <Panel>
      <PanelHeader
        eyebrow="Governança"
        title="Usuários provisionados"
        description="Perfil operacional e autoridade administrativa são dimensões independentes. Conceder Admin não altera o escopo logístico da HUB."
        trailing={<div style={{display:'flex',gap:8,flexWrap:'wrap'}}><Badge tone="warning">1 Owner</Badge><Badge tone="success">{counts.admins} Admin</Badge><Badge>{counts.users} Usuários</Badge></div>}
      />

      {message&&<div className="notice success" role="status">{message}</div>}
      {loading?<Skeleton lines={5}/>:error?<EmptyState tone="error" icon="error" title="Falha ao carregar acessos" description={error} action={<button type="button" className="button" onClick={()=>void load()}>Tentar novamente</button>}/>:users.length===0?<EmptyState icon="group_off" title="Nenhum usuário provisionado" description="Os usuários aparecem aqui depois de terem perfil sincronizado no BI."/>:<div className="table-wrap"><table className="responsive-data-table"><thead><tr><th scope="col">Usuário</th><th scope="col">Perfil operacional</th><th scope="col">Status</th><th scope="col">Governança</th><th scope="col">Ação</th></tr></thead><tbody>{users.map(user=><tr key={user.userId}><td data-label="Usuário"><strong>{user.nome}</strong><small style={{display:'block',marginTop:3}}>{user.email}</small></td><td data-label="Perfil operacional">{user.perfilOperacional}</td><td data-label="Status"><Badge tone={user.ativo?'success':'neutral'}>{user.ativo?'Ativo':'Inativo'}</Badge></td><td data-label="Governança"><Badge tone={roleTone(user.governanceRole)}>{roleLabel(user.governanceRole)}</Badge></td><td data-label="Ação">{user.governanceRole==='OWNER'?<span className="muted-text">Protegido</span>:user.governanceRole==='ADMIN'?<button type="button" className="button" disabled={changingId===user.userId} onClick={()=>void changeRole(user,false)}>{changingId===user.userId?'Processando…':'Revogar Admin'}</button>:<button type="button" className="button button-primary" disabled={changingId===user.userId} onClick={()=>void changeRole(user,true)}>{changingId===user.userId?'Processando…':'Tornar Admin'}</button>}</td></tr>)}</tbody></table></div>}
    </Panel>
  </>
}
