export type FcaReturnContext=
 |{type:'supervisor';supervisorId:string}
 |{type:'depositante';cnpj:string}

export type DepositorReturnContext=
 |{type:'home'}
 |{type:'supervisor';supervisorId:string}

const FCA_RETURN_KEY='bi-logistico-v2:fca-return'
const SUPERVISOR_RETURN_KEY='bi-logistico-v2:supervisor'
const DEPOSITOR_RETURN_KEY='bi-logistico-v2:depositante'
const DEPOSITOR_ORIGIN_KEY='bi-logistico-v2:depositante-origin'

export function setFcaReturnContext(context:FcaReturnContext){
 sessionStorage.setItem(FCA_RETURN_KEY,JSON.stringify(context))
}

export function clearFcaReturnContext(){
 sessionStorage.removeItem(FCA_RETURN_KEY)
}

export function getFcaReturnContext():FcaReturnContext|null{
 const raw=sessionStorage.getItem(FCA_RETURN_KEY)
 if(!raw)return null
 try{
  const parsed=JSON.parse(raw) as FcaReturnContext
  if(parsed.type==='supervisor'&&parsed.supervisorId)return parsed
  if(parsed.type==='depositante'&&parsed.cnpj)return parsed
 }catch{/* contexto inválido é descartado abaixo */}
 sessionStorage.removeItem(FCA_RETURN_KEY)
 return null
}

export function prepareFcaReturnTarget(context:FcaReturnContext|null):string{
 sessionStorage.removeItem(FCA_RETURN_KEY)
 if(context?.type==='supervisor'){
  sessionStorage.setItem(SUPERVISOR_RETURN_KEY,context.supervisorId)
  return'/supervisores'
 }
 if(context?.type==='depositante'){
  sessionStorage.setItem(DEPOSITOR_RETURN_KEY,context.cnpj)
  return'/depositantes'
 }
 return'/fca'
}

export function consumeSupervisorReturn():string{
 const value=sessionStorage.getItem(SUPERVISOR_RETURN_KEY)??''
 if(value)sessionStorage.removeItem(SUPERVISOR_RETURN_KEY)
 return value
}

export function openDepositorFrom(cnpj:string,context:DepositorReturnContext){
 sessionStorage.setItem(DEPOSITOR_RETURN_KEY,cnpj)
 sessionStorage.setItem(DEPOSITOR_ORIGIN_KEY,JSON.stringify(context))
}

export function consumeDepositorTarget():string{
 const value=sessionStorage.getItem(DEPOSITOR_RETURN_KEY)??''
 if(value)sessionStorage.removeItem(DEPOSITOR_RETURN_KEY)
 return value
}

export function getDepositorReturnContext():DepositorReturnContext|null{
 const raw=sessionStorage.getItem(DEPOSITOR_ORIGIN_KEY)
 if(!raw)return null
 try{
  const parsed=JSON.parse(raw) as DepositorReturnContext
  if(parsed.type==='home')return parsed
  if(parsed.type==='supervisor'&&parsed.supervisorId)return parsed
 }catch{/* contexto inválido é descartado abaixo */}
 sessionStorage.removeItem(DEPOSITOR_ORIGIN_KEY)
 return null
}

export function clearDepositorReturnContext(){
 sessionStorage.removeItem(DEPOSITOR_ORIGIN_KEY)
}

export function prepareDepositorReturnTarget(context:DepositorReturnContext|null):string{
 clearDepositorReturnContext()
 if(context?.type==='supervisor'){
  sessionStorage.setItem(SUPERVISOR_RETURN_KEY,context.supervisorId)
  return'/supervisores'
 }
 return'/'
}
