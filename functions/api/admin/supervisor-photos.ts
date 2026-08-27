import type { PagesFunction } from '@cloudflare/workers-types'
import { assertEnv, type Env } from '../../_lib/env'
import { readHub } from '../../_lib/google'
import { bearerToken, json } from '../../_lib/http'
import { getAuthenticatedUser, getGovernanceRole, removeSupervisorPhoto, saveSupervisorPhoto } from '../../_lib/supabase'

function tokenAal(token:string){
  try{
    const payload=token.split('.')[1]
    if(!payload)return''
    const normalized=payload.replace(/-/g,'+').replace(/_/g,'/')
    const padded=normalized.padEnd(Math.ceil(normalized.length/4)*4,'=')
    return String((JSON.parse(atob(padded)) as {aal?:unknown}).aal??'')
  }catch{return''}
}

function supervisorExists(rows:string[][],supervisorId:string){
  return rows.slice(1).some(row=>String(row[0]??'').trim()===supervisorId)
}

async function authorize(request:Request,env:Env){
  const token=bearerToken(request)
  if(!token)throw new Error('AUTH_REQUIRED')
  const user=await getAuthenticatedUser(env,token)
  if(tokenAal(token)!=='aal2')throw new Error('AAL2_REQUIRED')
  const role=await getGovernanceRole(token,user.id)
  if(role!=='OWNER'&&role!=='ADMIN')throw new Error('ADMIN_REQUIRED')
  return user
}

function errorResponse(error:unknown){
  const message=error instanceof Error?error.message:'UNKNOWN_ERROR'
  console.error('admin/supervisor-photos',message)
  if(message==='AUTH_REQUIRED'||message==='AUTH_INVALID'||message==='AUTH_EMAIL_MISSING')return json({error:'Sessão inválida. Entre novamente.'},{status:401})
  if(message==='AAL2_REQUIRED')return json({error:'Confirme seu segundo fator para administrar fotos.'},{status:403})
  if(message==='ADMIN_REQUIRED')return json({error:'Área exclusiva para administradores.'},{status:403})
  if(message==='SUPERVISOR_NOT_FOUND')return json({error:'Supervisor não encontrado na HUB.'},{status:404})
  if(message==='SUPERVISOR_PHOTO_TYPE_INVALID')return json({error:'Use uma imagem JPG, PNG ou WEBP.'},{status:400})
  if(message==='SUPERVISOR_PHOTO_SIZE_INVALID')return json({error:'A imagem deve ter no máximo 2 MB.'},{status:400})
  if(message.startsWith('SUPERVISOR_PHOTO_'))return json({error:'Não foi possível atualizar a foto no Supabase.'},{status:500})
  return json({error:'Falha ao administrar a foto do supervisor.'},{status:500})
}

export const onRequestPost:PagesFunction<Env>=async({request,env})=>{
  try{
    assertEnv(env)
    const user=await authorize(request,env)
    const form=await request.formData()
    const supervisorId=String(form.get('supervisorId')??'').trim()
    const file=form.get('file')
    if(!supervisorId||!file||typeof file==='string')return json({error:'Selecione o supervisor e uma imagem.'},{status:400})

    const rawHub=await readHub(env)
    if(!supervisorExists(rawHub.supervisors,supervisorId))throw new Error('SUPERVISOR_NOT_FOUND')

    const photo=await saveSupervisorPhoto(env,supervisorId,file,user.id)
    return json({ok:true,photo})
  }catch(error){return errorResponse(error)}
}

export const onRequestDelete:PagesFunction<Env>=async({request,env})=>{
  try{
    assertEnv(env)
    await authorize(request,env)
    const body=await request.json().catch(()=>null) as {supervisorId?:unknown}|null
    const supervisorId=String(body?.supervisorId??'').trim()
    if(!supervisorId)return json({error:'Supervisor não informado.'},{status:400})

    const rawHub=await readHub(env)
    if(!supervisorExists(rawHub.supervisors,supervisorId))throw new Error('SUPERVISOR_NOT_FOUND')

    await removeSupervisorPhoto(env,supervisorId)
    return json({ok:true})
  }catch(error){return errorResponse(error)}
}
