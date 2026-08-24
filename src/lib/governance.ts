import { supabase } from './supabase'
import type { GovernanceRole } from '../types/hub'

export interface GovernanceUser{
  userId:string
  email:string
  nome:string
  ativo:boolean
  perfilOperacional:string
  governanceRole:GovernanceRole
}

interface GovernanceUserRow{
  user_id:string
  email:string
  nome:string
  ativo:boolean
  perfil_operacional:string
  governance_role:GovernanceRole
}

function mapUser(row:GovernanceUserRow):GovernanceUser{
  return{
    userId:row.user_id,
    email:row.email,
    nome:row.nome,
    ativo:row.ativo,
    perfilOperacional:row.perfil_operacional,
    governanceRole:row.governance_role,
  }
}

export async function listGovernanceUsers():Promise<GovernanceUser[]>{
  const{data,error}=await supabase.rpc('list_bi_access_users')
  if(error)throw error
  return ((data??[]) as GovernanceUserRow[]).map(mapUser)
}

export async function setGovernanceAdmin(userId:string,makeAdmin:boolean):Promise<void>{
  const{error}=await supabase.rpc('set_bi_admin_role',{p_target_id:userId,p_make_admin:makeAdmin})
  if(error)throw error
}
