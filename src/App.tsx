import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { Button } from 'primereact/button'
import { supabase } from './lib/supabase'
import { getHubBootstrap } from './lib/api'
import { defaultPeriod, getAvailablePeriods, periodKey } from './lib/dashboard'
import type { DashboardFilters } from './types/dashboard'
import type { HubBootstrap } from './types/hub'
import { AppShell } from './components/AppShell'
import { MfaGate } from './components/MfaGate'
import { LoginPage } from './pages/LoginPage'
import { SetPasswordPage } from './pages/SetPasswordPage'
import { HomePage } from './pages/HomePage'
import { KpisPage } from './pages/KpisPage'
import { SupervisorsPage } from './pages/SupervisorsPage'
import { DepositantesPage } from './pages/DepositantesPage'
import { FinanceiroPage } from './pages/FinanceiroPage'
import { FcaListPage } from './pages/FcaListPage'
import { NewFcaPage } from './pages/NewFcaPage'
import { FcaDetailPage } from './pages/FcaDetailPage'
import { FcaEditPage } from './pages/FcaEditPage'
import { AdminSubstitutionsPage } from './pages/AdminSubstitutionsPage'
import { AdminSupervisorsPage } from './pages/AdminSupervisorsPage'
import { AdminAccessPage } from './pages/AdminAccessPage'

const emptyFilters:DashboardFilters={periodo:'',fcaPeriodo:'ALL',supervisorId:'',moduloId:''}
const BRAND_LOGO='/brand/unilog-logo-white-transparent.svg'

function BiBootLoading({eyebrow,title,description}:{eyebrow:string;title:string;description:string}){
 return <div className="bi-boot-screen" role="status" aria-live="polite" aria-busy="true">
   <div className="bi-boot-shell">
     <div className="bi-boot-brand" aria-hidden="true">
       <img src={BRAND_LOGO} alt=""/>
       <strong>BI LOGÍSTICO</strong>
     </div>
     <div className="bi-boot-content">
       <span className="bi-boot-eyebrow">{eyebrow}</span>
       <i className="pi pi-spin pi-spinner bi-boot-spinner" aria-hidden="true"/>
       <strong>{title}</strong>
       <p>{description}</p>
       <div className="bi-boot-progress" aria-hidden="true"><i/></div>
     </div>
   </div>
 </div>
}

function isPasswordRecoveryUrl() {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return query.get('type') === 'recovery' || hash.get('type') === 'recovery'
}

function resolvePeriodForHub(hub:HubBootstrap,currentPeriod:string) {
  const periods=getAvailablePeriods(hub)
  if(!periods.length)return ''
  const currentKey=periodKey(currentPeriod)
  const current=periods.find(period=>period.key===currentKey)
  return current?.value??defaultPeriod(hub)
}

export default function App(){
 const[session,setSession]=useState<Session|null>(null),[authReady,setAuthReady]=useState(false),[passwordRecovery,setPasswordRecovery]=useState(isPasswordRecoveryUrl),[hub,setHub]=useState<HubBootstrap|null>(null),[filters,setFilters]=useState<DashboardFilters>(emptyFilters),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null)
 useEffect(()=>{let active=true;const{data:l}=supabase.auth.onAuthStateChange((event,s)=>{if(!active)return;if(event==='PASSWORD_RECOVERY'){setPasswordRecovery(true);setHub(null);setError(null)}setSession(s);setAuthReady(true);if(!s){setHub(null);setFilters(emptyFilters)}});void supabase.auth.getSession().then(({data})=>{if(!active)return;setSession(data.session);setAuthReady(true)});return()=>{active=false;l.subscription.unsubscribe()}},[])
 async function refreshHub(showLoading=true){if(!session||passwordRecovery)return;if(showLoading)setLoading(true);setError(null);try{const nextHub=await getHubBootstrap();setFilters(current=>({...current,periodo:resolvePeriodForHub(nextHub,current.periodo)}));setHub(nextHub)}catch(e:unknown){setError(e instanceof Error?e.message:'Falha ao carregar a HUB.')}finally{if(showLoading)setLoading(false)}}
 useEffect(()=>{if(!authReady)return;if(!session||passwordRecovery){setLoading(false);return}void refreshHub(!hub)},[authReady,session?.user?.id,passwordRecovery])
 async function signOut(){await supabase.auth.signOut();setHub(null);setFilters(emptyFilters)}
 function abandonRecovery(){window.history.replaceState(null,'','/');setPasswordRecovery(false);setError(null)}
 function finishRecovery(){setPasswordRecovery(false);setHub(null);setLoading(true);setError(null)}
 if(!authReady)return <BiBootLoading eyebrow="ACESSO SEGURO" title="Validando seu acesso" description="Confirmando sua sessão antes de abrir o ambiente."/>
 if(passwordRecovery){if(session)return <SetPasswordPage onComplete={finishRecovery}/>;return <div className="center-state center-state-error"><div className="center-state-card"><i className="pi pi-link center-state-icon" aria-hidden="true"/><strong>Link de acesso inválido ou expirado</strong><p>Solicite um novo link de primeiro acesso ou recuperação de senha.</p><div className="center-state-actions"><Button type="button" label="Voltar ao login" outlined severity="secondary" onClick={abandonRecovery}/></div></div></div>}
 if(!session)return <LoginPage/>
 if(loading)return <BiBootLoading eyebrow="SINCRONIZANDO DADOS" title="Preparando seu ambiente" description="Conectando à base e organizando os indicadores do seu escopo."/>
 if(error||!hub)return <div className="center-state center-state-error"><div className="center-state-card"><i className="pi pi-exclamation-circle center-state-icon" aria-hidden="true"/><strong>Não foi possível carregar o BI</strong><p>{error??'Seu e-mail não possui um perfil válido na HUB.'}</p><div className="center-state-actions"><Button type="button" label="Tentar novamente" onClick={()=>void refreshHub(true)}/><Button type="button" label="Voltar ao login" outlined severity="secondary" onClick={()=>void signOut()}/></div></div></div>
 const isGovernanceAdmin=hub.profile.governanceRole==='OWNER'||hub.profile.governanceRole==='ADMIN'
 const isOwner=hub.profile.governanceRole==='OWNER'
 return <MfaGate required={isGovernanceAdmin}><BrowserRouter><AppShell hub={hub} filters={filters} onFiltersChange={setFilters} onSignOut={signOut}><Routes><Route path="/" element={<HomePage hub={hub} filters={filters}/>}/><Route path="/kpis" element={<KpisPage hub={hub} filters={filters}/>}/><Route path="/supervisores" element={<SupervisorsPage hub={hub} filters={filters}/>}/><Route path="/depositantes" element={<DepositantesPage hub={hub} filters={filters}/>}/><Route path="/financeiro" element={<FinanceiroPage hub={hub} filters={filters}/>}/><Route path="/fca" element={<FcaListPage hub={hub} filters={filters}/>}/><Route path="/fca/novo" element={<NewFcaPage hub={hub}/>}/><Route path="/fca/:id/editar" element={<FcaEditPage hub={hub}/>}/><Route path="/fca/:id" element={<FcaDetailPage/>}/>{isGovernanceAdmin&&<Route path="/administracao/supervisores" element={<AdminSupervisorsPage hub={hub} onRefresh={()=>refreshHub(false)}/>}/>} {isGovernanceAdmin&&<Route path="/administracao/substituicoes" element={<AdminSubstitutionsPage hub={hub} onRefresh={()=>refreshHub(false)}/>}/>} {isOwner&&<Route path="/administracao/acessos" element={<AdminAccessPage hub={hub}/>}/>}<Route path="*" element={<HomePage hub={hub} filters={filters}/>}/></Routes></AppShell></BrowserRouter></MfaGate>
}
