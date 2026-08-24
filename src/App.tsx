import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { getHubBootstrap } from './lib/api'
import { defaultPeriod } from './lib/dashboard'
import type { DashboardFilters } from './types/dashboard'
import type { HubBootstrap } from './types/hub'
import { AppShell } from './components/AppShell'
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
import { AdminAccessPage } from './pages/AdminAccessPage'

const emptyFilters:DashboardFilters={periodo:'',fcaPeriodo:'ALL',supervisorId:'',moduloId:''}
const BRAND_LOGO='/brand/unilog-logo-white-transparent.svg'

function isPasswordRecoveryUrl() {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return query.get('type') === 'recovery' || hash.get('type') === 'recovery'
}

export default function App(){
 const[session,setSession]=useState<Session|null>(null),[authReady,setAuthReady]=useState(false),[passwordRecovery,setPasswordRecovery]=useState(isPasswordRecoveryUrl),[hub,setHub]=useState<HubBootstrap|null>(null),[filters,setFilters]=useState<DashboardFilters>(emptyFilters),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null)
 useEffect(()=>{let active=true;const{data:l}=supabase.auth.onAuthStateChange((event,s)=>{if(!active)return;if(event==='PASSWORD_RECOVERY'){setPasswordRecovery(true);setHub(null);setError(null)}setSession(s);setAuthReady(true);if(!s){setHub(null);setFilters(emptyFilters)}});void supabase.auth.getSession().then(({data})=>{if(!active)return;setSession(data.session);setAuthReady(true)});return()=>{active=false;l.subscription.unsubscribe()}},[])
 async function refreshHub(){if(!session||passwordRecovery)return;setLoading(true);setError(null);try{setHub(await getHubBootstrap())}catch(e:unknown){setError(e instanceof Error?e.message:'Falha ao carregar a HUB.')}finally{setLoading(false)}}
 useEffect(()=>{if(!authReady)return;if(!session||passwordRecovery){setLoading(false);return}void refreshHub()},[authReady,session?.access_token,passwordRecovery])
 useEffect(()=>{if(!hub||filters.periodo)return;const period=defaultPeriod(hub);if(period)setFilters(c=>({...c,periodo:period}))},[hub,filters.periodo])
 async function signOut(){await supabase.auth.signOut();setHub(null);setFilters(emptyFilters)}
 function abandonRecovery(){window.history.replaceState(null,'','/');setPasswordRecovery(false);setError(null)}
 function finishRecovery(){setPasswordRecovery(false);setHub(null);setLoading(true);setError(null)}
 if(!authReady)return <div className="center-state"><div className="loading-brand"><img src={BRAND_LOGO} alt="Unilog Express"/><span className="loading-spinner"/></div><strong>Validando acesso…</strong><p>Preparando a autenticação segura.</p></div>
 if(passwordRecovery){if(session)return <SetPasswordPage onComplete={finishRecovery}/>;return <div className="center-state center-state-error"><strong>Link de acesso inválido ou expirado</strong><p>Solicite um novo link de primeiro acesso ou recuperação de senha.</p><button className="button" onClick={abandonRecovery}>Voltar ao login</button></div>}
 if(!session)return <LoginPage/>
 if(loading)return <div className="center-state"><div className="loading-brand"><img src={BRAND_LOGO} alt="Unilog Express"/><span className="loading-spinner"/></div><strong>Carregando BI Logístico…</strong><p>Validando acesso e preparando indicadores.</p></div>
 if(error||!hub)return <div className="center-state center-state-error"><strong>Acesso não liberado</strong><p>{error??'Seu e-mail não possui um perfil válido na HUB.'}</p><button className="button" onClick={()=>void signOut()}>Voltar ao login</button></div>
 const isGovernanceAdmin=hub.profile.governanceRole==='OWNER'||hub.profile.governanceRole==='ADMIN'
 const isOwner=hub.profile.governanceRole==='OWNER'
 return <BrowserRouter><AppShell hub={hub} filters={filters} onFiltersChange={setFilters} onSignOut={signOut}><Routes><Route path="/" element={<HomePage hub={hub} filters={filters}/>}/><Route path="/kpis" element={<KpisPage hub={hub} filters={filters}/>}/><Route path="/supervisores" element={<SupervisorsPage hub={hub} filters={filters}/>}/><Route path="/depositantes" element={<DepositantesPage hub={hub} filters={filters}/>}/><Route path="/financeiro" element={<FinanceiroPage hub={hub} filters={filters}/>}/><Route path="/fca" element={<FcaListPage hub={hub} filters={filters}/>}/><Route path="/fca/novo" element={<NewFcaPage hub={hub}/>}/><Route path="/fca/:id/editar" element={<FcaEditPage hub={hub}/>}/><Route path="/fca/:id" element={<FcaDetailPage/>}/>{isGovernanceAdmin&&<Route path="/administracao/substituicoes" element={<AdminSubstitutionsPage hub={hub} onRefresh={refreshHub}/>}/>} {isOwner&&<Route path="/administracao/acessos" element={<AdminAccessPage hub={hub}/>}/>}<Route path="*" element={<HomePage hub={hub} filters={filters}/>}/></Routes></AppShell></BrowserRouter>
}
