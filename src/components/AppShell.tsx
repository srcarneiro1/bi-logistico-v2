import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { getAvailablePeriods } from '../lib/dashboard'
import type { DashboardFilters } from '../types/dashboard'
import type { HubBootstrap } from '../types/hub'

const BRAND_LOGO='https://raw.githubusercontent.com/srcarneiro1/forecast-planner/main/public/brand/unilog-logo-white-transparent.svg'
const items=[
  {to:'/',label:'Visão geral',icon:'space_dashboard'},
  {to:'/kpis',label:'KPIs',icon:'monitoring'},
  {to:'/supervisores',label:'Supervisores',icon:'groups'},
  {to:'/depositantes',label:'Depositantes',icon:'inventory_2'},
  {to:'/financeiro',label:'Financeiro',icon:'payments'},
  {to:'/fca',label:'FCA',icon:'fact_check'},
]
export function AppShell({hub,filters,onFiltersChange,onSignOut,children}:{hub:HubBootstrap;filters:DashboardFilters;onFiltersChange:(next:DashboardFilters)=>void;onSignOut:()=>Promise<void>;children:ReactNode}){
  const location=useLocation(),periods=getAvailablePeriods(hub),isAdmin=hub.profile.perfil==='ADMIN'
  const[collapsed,setCollapsed]=useState(()=>localStorage.getItem('bi-logistico-v2:sidebar')==='collapsed')
  const[mobileOpen,setMobileOpen]=useState(false)
  useEffect(()=>setMobileOpen(false),[location.pathname])
  const modules=Array.from(new Set(hub.supervisorModules.filter(x=>!filters.supervisorId||x.supervisorId===filters.supervisorId).map(x=>x.moduloId))).sort()
  const current=items.find(i=>i.to==='/'?location.pathname==='/':location.pathname.startsWith(i.to))
  function toggleCollapsed(){setCollapsed(v=>{const next=!v;localStorage.setItem('bi-logistico-v2:sidebar',next?'collapsed':'expanded');return next})}
  return <div className={`app-shell ${collapsed?'sidebar-collapsed':''}`}>
    {mobileOpen&&<button className="sidebar-backdrop" aria-label="Fechar menu" onClick={()=>setMobileOpen(false)}/>} 
    <aside className={`sidebar ${mobileOpen?'mobile-open':''}`}>
      <div className="sidebar-brand"><img src={BRAND_LOGO} alt="Unilog Express"/><span>BI LOGÍSTICO</span><button className="sidebar-collapse" onClick={toggleCollapsed} title={collapsed?'Expandir menu':'Recolher menu'}><span className="material-symbols-rounded">{collapsed?'chevron_right':'chevron_left'}</span></button><button className="sidebar-mobile-close" onClick={()=>setMobileOpen(false)} title="Fechar menu"><span className="material-symbols-rounded">close</span></button></div>
      <nav className="sidebar-nav">{items.map(item=><NavLink key={item.to} to={item.to} end={item.to==='/' } title={collapsed?item.label:undefined}><span className="material-symbols-rounded">{item.icon}</span><span className="nav-label">{item.label}</span></NavLink>)}</nav>
      <div className="sidebar-user"><div className="user-avatar">{hub.profile.nome.slice(0,1).toUpperCase()}</div><div className="sidebar-user-copy"><strong>{hub.profile.nome}</strong><span>{hub.profile.perfil}</span></div><button onClick={()=>void onSignOut()} title="Sair"><span className="material-symbols-rounded">logout</span></button></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><div className="topbar-title"><button className="mobile-menu-button" onClick={()=>setMobileOpen(true)} title="Abrir menu"><span className="material-symbols-rounded">menu</span></button><div><span className="topbar-kicker">BI Logístico</span><strong>{current?.label??'Visão geral'}</strong></div></div><div className="topbar-profile"><span className="sync-dot"/><span>HUB conectada</span></div></header>
      <div className="global-filters">
        <div><label>Período</label><select value={filters.periodo} onChange={e=>onFiltersChange({...filters,periodo:e.target.value})}><option value="">Todos</option>{periods.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}</select></div>
        <div><label>Supervisor</label><select value={filters.supervisorId} disabled={!isAdmin} onChange={e=>onFiltersChange({...filters,supervisorId:e.target.value,moduloId:''})}><option value="">{isAdmin?'Todos os supervisores':hub.profile.nome}</option>{isAdmin&&hub.supervisors.map(s=><option key={s.supervisorId} value={s.supervisorId}>{s.nomeExibicao}</option>)}</select></div>
        <div><label>Módulo</label><select value={filters.moduloId} onChange={e=>onFiltersChange({...filters,moduloId:e.target.value})}><option value="">Todos os módulos</option>{modules.map(m=><option key={m}>{m}</option>)}</select></div>
        <div className="filter-context"><span className="material-symbols-rounded">filter_alt</span><div><small>Escopo ativo</small><strong>{filters.periodo?periods.find(p=>p.value===filters.periodo)?.label:'Histórico completo'}</strong></div></div>
      </div>
      <main className="content">{!hub.analyticsReady&&<div className="analytics-warning"><span className="material-symbols-rounded">info</span><div><strong>Camada analítica ainda não publicada no Apps Script.</strong><span>Cadastros e FCA funcionam, mas os indicadores aparecerão após atualizar a ponte da HUB para a versão 2.</span></div></div>}{children}</main>
    </div>
  </div>
}
