import { createClient } from '@supabase/supabase-js'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, type Env } from './env'

interface SupabaseAuthUser { id: string; email?: string }
export type GovernanceRole = 'OWNER' | 'ADMIN' | 'USER'

export interface SupabaseSubstitute { id: string; codigo: string; nome: string; email: string | null; fotoUrl: string | null; ativo: boolean }
export interface SupabaseCoverage {
  id: string; legacy_substituicao_id: string | null; supervisor_titular_id: string; supervisor_titular_nome: string;
  substituto_master_id: string; substituto_codigo_snapshot: string; substituto_nome_snapshot: string;
  substituto_email_snapshot: string | null; substituto_foto_url_snapshot: string | null; modulo_id: string; data_inicio: string; data_fim: string;
  motivo: string | null; status: 'ATIVA' | 'ENCERRADA' | 'CANCELADA'
}
export interface SupervisorPhotoOverride { supervisorId:string; fotoPath:string; fotoUrl:string; updatedAt:string }

const SUPERVISOR_PHOTO_BUCKET='supervisor-fotos'
const PHOTO_EXTENSIONS:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}

export async function getAuthenticatedUser(_env: Env, accessToken: string): Promise<SupabaseAuthUser> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  })
  if (!response.ok) throw new Error('AUTH_INVALID')
  const user = await response.json() as SupabaseAuthUser
  if (!user.id || !user.email) throw new Error('AUTH_EMAIL_MISSING')
  return user
}

async function userGet<T>(accessToken: string, path: string): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`SUPABASE_READ_FAILED:${response.status}:${detail.slice(0,300)}`)
  }
  return await response.json() as T
}

export async function getGovernanceRole(accessToken:string,userId:string):Promise<GovernanceRole>{
  try{
    const rows=await userGet<Array<{governance_role:'OWNER'|'ADMIN'}>>(
      accessToken,
      `app_governance?select=governance_role&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
    )
    return rows[0]?.governance_role??'USER'
  }catch(error){
    console.error('governance role lookup',error instanceof Error?error.message:error)
    return 'USER'
  }
}

export async function getSupervisorCoverageData(accessToken: string) {
  const [substitutes, coverages] = await Promise.all([
    userGet<SupabaseSubstitute[]>(accessToken,'supervisor_substitutos?select=id,codigo,nome,email,fotoUrl:foto_url,ativo&order=nome.asc'),
    userGet<SupabaseCoverage[]>(accessToken,'supervisor_substituicoes?select=id,legacy_substituicao_id,supervisor_titular_id,supervisor_titular_nome,substituto_master_id,substituto_codigo_snapshot,substituto_nome_snapshot,substituto_email_snapshot,substituto_foto_url_snapshot,modulo_id,data_inicio,data_fim,motivo,status&order=data_inicio.desc'),
  ])
  return { substitutes, coverages }
}

function secretHeaders(env: Env, extra?: Record<string,string>): Record<string,string> {
  return { apikey: env.SUPABASE_SECRET_KEY, Accept: 'application/json', ...extra }
}

function adminClient(env:Env){
  return createClient(SUPABASE_URL,env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}})
}

export async function getSupervisorPhotoOverrides(env:Env):Promise<SupervisorPhotoOverride[]>{
  const admin=adminClient(env)
  const{data,error}=await admin.from('supervisor_fotos').select('supervisor_id,foto_path,updated_at').order('supervisor_id')
  if(error)throw new Error(`SUPERVISOR_PHOTO_LIST_FAILED:${error.message}`)
  return(data??[]).map(row=>({
    supervisorId:String(row.supervisor_id),
    fotoPath:String(row.foto_path),
    fotoUrl:admin.storage.from(SUPERVISOR_PHOTO_BUCKET).getPublicUrl(String(row.foto_path)).data.publicUrl,
    updatedAt:String(row.updated_at),
  }))
}

export async function saveSupervisorPhoto(env:Env,supervisorId:string,file:File,actorId:string):Promise<SupervisorPhotoOverride>{
  const extension=PHOTO_EXTENSIONS[file.type]
  if(!extension)throw new Error('SUPERVISOR_PHOTO_TYPE_INVALID')
  if(file.size<=0||file.size>2*1024*1024)throw new Error('SUPERVISOR_PHOTO_SIZE_INVALID')

  const admin=adminClient(env)
  const{data:previous,error:previousError}=await admin.from('supervisor_fotos').select('foto_path').eq('supervisor_id',supervisorId).maybeSingle()
  if(previousError)throw new Error(`SUPERVISOR_PHOTO_LOOKUP_FAILED:${previousError.message}`)

  const fotoPath=`${supervisorId}/${crypto.randomUUID()}.${extension}`
  const{error:uploadError}=await admin.storage.from(SUPERVISOR_PHOTO_BUCKET).upload(fotoPath,file,{contentType:file.type,cacheControl:'31536000',upsert:false})
  if(uploadError)throw new Error(`SUPERVISOR_PHOTO_UPLOAD_FAILED:${uploadError.message}`)

  const{data:row,error:saveError}=await admin.from('supervisor_fotos').upsert({supervisor_id:supervisorId,foto_path:fotoPath,content_type:file.type,updated_at:new Date().toISOString(),updated_by:actorId},{onConflict:'supervisor_id'}).select('supervisor_id,foto_path,updated_at').single()
  if(saveError){
    await admin.storage.from(SUPERVISOR_PHOTO_BUCKET).remove([fotoPath])
    throw new Error(`SUPERVISOR_PHOTO_SAVE_FAILED:${saveError.message}`)
  }

  if(previous?.foto_path&&previous.foto_path!==fotoPath){
    const{error:removeError}=await admin.storage.from(SUPERVISOR_PHOTO_BUCKET).remove([previous.foto_path])
    if(removeError)console.error('supervisor photo old object cleanup',removeError.message)
  }

  return{
    supervisorId:String(row.supervisor_id),
    fotoPath:String(row.foto_path),
    fotoUrl:admin.storage.from(SUPERVISOR_PHOTO_BUCKET).getPublicUrl(String(row.foto_path)).data.publicUrl,
    updatedAt:String(row.updated_at),
  }
}

export async function removeSupervisorPhoto(env:Env,supervisorId:string):Promise<void>{
  const admin=adminClient(env)
  const{data:row,error:lookupError}=await admin.from('supervisor_fotos').select('foto_path').eq('supervisor_id',supervisorId).maybeSingle()
  if(lookupError)throw new Error(`SUPERVISOR_PHOTO_LOOKUP_FAILED:${lookupError.message}`)
  const{error:deleteError}=await admin.from('supervisor_fotos').delete().eq('supervisor_id',supervisorId)
  if(deleteError)throw new Error(`SUPERVISOR_PHOTO_DELETE_FAILED:${deleteError.message}`)
  if(row?.foto_path){
    const{error:storageError}=await admin.storage.from(SUPERVISOR_PHOTO_BUCKET).remove([row.foto_path])
    if(storageError)console.error('supervisor photo object cleanup',storageError.message)
  }
}

export async function upsertProfile(env: Env, profile: { id:string; email:string; nome:string; perfil:'ADMIN'|'USUARIO'; supervisor_id:string|null; ativo:boolean }) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?on_conflict=id`, {
    method:'POST',
    headers: secretHeaders(env,{ 'Content-Type':'application/json', Prefer:'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify(profile),
  })
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`PROFILE_SYNC_FAILED:${response.status}:${detail.slice(0,300)}`)
  }
}
