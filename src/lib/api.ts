import { supabase } from './supabase'
import type { HubBootstrap } from '../types/hub'

export type AccessEmailAction = 'first-access' | 'recover'

async function accessToken(){
  const { data: { session }, error } = await supabase.auth.getSession()
  if(error||!session?.access_token)throw new Error('Sessão inválida. Entre novamente.')
  return session.access_token
}

export async function requestAccessEmail(email: string, action: AccessEmailAction): Promise<string> {
  const response = await fetch('/api/auth/access', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email: email.trim().toLowerCase(), action }),
  })

  const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null
  if (!response.ok) {
    throw new Error(payload?.error || 'Não foi possível enviar as instruções de acesso.')
  }

  return payload?.message || 'Se o e-mail estiver autorizado, você receberá as instruções de acesso em instantes.'
}

export async function getHubBootstrap(): Promise<HubBootstrap> {
  const token=await accessToken()
  const response = await fetch('/api/hub/bootstrap', {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  })

  if (response.status === 401 || response.status === 403) {
    await supabase.auth.signOut()
  }

  const payload = await response.json().catch(() => null) as { error?: string } | HubBootstrap | null
  if (!response.ok) {
    const message = payload && 'error' in payload && payload.error
      ? payload.error
      : 'Não foi possível carregar os cadastros da HUB.'
    throw new Error(message)
  }

  return payload as HubBootstrap
}

export async function uploadSupervisorPhoto(supervisorId:string,file:File){
  const token=await accessToken()
  const form=new FormData()
  form.set('supervisorId',supervisorId)
  form.set('file',file)
  const response=await fetch('/api/admin/supervisor-photos',{method:'POST',headers:{Authorization:`Bearer ${token}`,Accept:'application/json'},body:form})
  const payload=await response.json().catch(()=>null) as {error?:string;photo?:{supervisorId:string;fotoUrl:string}}|null
  if(!response.ok)throw new Error(payload?.error||'Não foi possível atualizar a foto.')
  return payload?.photo
}

export async function deleteSupervisorPhoto(supervisorId:string){
  const token=await accessToken()
  const response=await fetch('/api/admin/supervisor-photos',{method:'DELETE',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({supervisorId})})
  const payload=await response.json().catch(()=>null) as {error?:string}|null
  if(!response.ok)throw new Error(payload?.error||'Não foi possível remover a foto interna.')
}
