import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { getHubBootstrap } from './lib/api'
import { getAvailablePeriods } from './lib/dashboard'
import type { DashboardFilters } from './types/dashboard'
import type { HubBootstrap } from './types/hub'
import { AppShell } from './components/AppShell'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { KpisPage } from './pages/KpisPage'
import { SupervisorsPage } from './pages/SupervisorsPage'
import { DepositantesPage } from './pages/DepositantesPage'
import { FinanceiroPage } from './pages/FinanceiroPage'
import { FcaListPage } from './pages/FcaListPage'
import { NewFcaPage } from './pages/NewFcaPage'
import { FcaDetailPage } from './pages/FcaDetailPage'

const emptyFilters:DashboardFilters={periodo:'',supervisorId:'',moduloId:''}

export default function App(){
 const[session,setSession]=useState<Session|null>(null),[hub,setHub]=useState<HubBootstrap|null>(null),[filters,setFilters]=useState<DashboardFilters>(emptyFilters),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null)
 useEffect(()=>{void supabase.auth.getSession().then(({data})=>setSession(data.session));const{data:l}=supabase.auth.onAuthStateChange((_e,s)=>{setSession(s);if(!s){setHub(null);setFilters(emptyFilters)}});return()=>l.subscription.unsubscribe()},[])
 useEffect(()=>{if(!session){setLoading(false);return}setLoading(true);setError(null);void getHubBootstrap().then(setHub).catch((e:unknown)=>setError(e instanceof Error?e.message:'Falha ao carregar a HUB.')).finally(()=>setLoading(false))},[session?.access_token])
 useEffect(()=>{if(!hub||filters.periodo)return;const latest=getAvailablePeriods(hub)[0]?.value||'';if(latest)setFilters(c=>({...c,periodo:latest}))},[hub,filters.periodo])
 async function signOut(){await supabase.auth.signOut();setHub(null);setFilters(emptyFilters)}
 if(!session)return <LoginPage/>
 if(loading)return <div className="center-state"><div className="loading-brand"><img src="/brand/unilog-logo-white.png" alt="Unilog Express"/><span className="loading-spinner"/></div><strong>Carregando BI Logístico…</strong><p>Validando acesso e preparando indicadores.</p></div>
 if(error||!hub)return <div className="center-state center-state-error"><strong>Acesso não liberado</strong><p>{error??'Seu e-mail não possui um perfil válido na HUB.'}</p><button className="button" onClick={()=>void signOut()}>Voltar ao login</button></div>
 return <BrowserRouter><AppShell hub={hub} filters={filters} onFiltersChange={setFilters} onSignOut={signOut}><Routes><Route path="/" element={<HomePage hub={hub} filters={filters}/>}/><Route path="/kpis" element={<KpisPage hub={hub} filters={filters}/>}/><Route path="/supervisores" element={<SupervisorsPage hub={hub} filters={filters} onFiltersChange={setFilters}/>}/><Route path="/depositantes" element={<DepositantesPage hub={hub} filters={filters}/>}/><Route path="/financeiro" element={<FinanceiroPage hub={hub} filters={filters}/>}/><Route path="/fca" element={<FcaListPage hub={hub}/>}/><Route path="/fca/novo" element={<NewFcaPage hub={hub}/>}/><Route path="/fca/:id" element={<FcaDetailPage/>}/><Route path="*" element={<HomePage hub={hub} filters={filters}/>}/></Routes></AppShell></BrowserRouter>
}
