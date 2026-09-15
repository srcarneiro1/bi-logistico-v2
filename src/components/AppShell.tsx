import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Avatar } from 'primereact/avatar'
import { Tag } from 'primereact/tag'
import { getAvailablePeriods, periodLabel } from '../lib/dashboard'
import { listFcaPeriods } from '../lib/fca'
import type { DashboardFilters } from '../types/dashboard'
import type { HubBootstrap } from '../types/hub'

const BRAND_LOGO='/brand/unilog-logo-white-transparent.svg'
const MOBILE_SIDEBAR_ID='bi-logistico-mobile-sidebar'
const baseItems=[
  {to:'/',label:'Visão geral',icon:'pi pi-chart-bar'},
  {to:'/kpis',label:'KPIs',icon:'pi pi-chart-line'},
  {to:'/supervisores',label:'Supervisores',icon:'pi pi-users'},
  {to:'/depositantes',label:'Depositantes',icon:'pi pi-box'},
  {to:'/financeiro',label:'Financeiro',icon:'pi pi-wallet'},
  {to:'/fca',label:'FCA',icon:'pi pi-check-square'},
]

function MenuIcon({open=false}:{open?:boolean}){
  return <i className={open?'pi pi-angle-left':'pi pi-bars'} aria-hidden="true"/>
}

export function AppShell({hub,filters,onFiltersChange,onSignOut,children}:{hub:HubBootstrap;filters:DashboardFilters;onFiltersChange:(next:DashboardFilters)=>void;onSignOut:()=>Promise<void>;children:ReactNode}){
  const location=useLocation()
  const periods=getAvailablePeriods(hub)
  const isOperationalAdmin=hub.profile.perfil==='ADMIN'
  const isGovernanceAdmin=hub.profile.governanceRole==='OWNER'||hub.profile.governanceRole==='ADMIN'
  const isOwner=hub.profile.governanceRole==='OWNER'
  const adminItems=[
    ...(isGovernanceAdmin?[{to:'/administracao/supervisores',label:'Fotos de supervisores',icon:'pi pi-id-card'}]:[]),
    ...(isGovernanceAdmin?[{to:'/administracao/substituicoes',label:'Substituições',icon:'pi pi-sync'}]:[]),
    ...(isOwner?[{to:'/administracao/acessos',label:'Acessos',icon:'pi pi-user-edit'}]:[]),
  ]
  const items=[...baseItems,...adminItems]
  const isFcaRoute=location.pathname==='/fca'||location.pathname.startsWith('/fca/')
  const isFcaList=location.pathname==='/fca'
  const contextualRoute=location.pathname.startsWith('/administracao/')||location.pathname==='/fca/novo'||/^\/fca\/[^/]+(?:\/editar)?$/.test(location.pathname)
  const[collapsed,setCollapsed]=useState(()=>localStorage.getItem('bi-logistico-v2:sidebar')==='collapsed')
  const[mobileOpen,setMobileOpen]=useState(false)
  const[fcaPeriods,setFcaPeriods]=useState<string[]>([])
  const sidebarRef=useRef<HTMLElement>(null)
  const mobileMenuButtonRef=useRef<HTMLButtonElement>(null)
  const wasMobileOpen=useRef(false)

  useEffect(()=>setMobileOpen(false),[location.pathname])
  useEffect(()=>{
    if(!isFcaRoute)return
    let active=true
    void listFcaPeriods().then(values=>{if(active)setFcaPeriods(values)}).catch(()=>{if(active)setFcaPeriods([])})
    return()=>{active=false}
  },[isFcaRoute])

  useEffect(()=>{
    if(wasMobileOpen.current&&!mobileOpen)mobileMenuButtonRef.current?.focus()
    wasMobileOpen.current=mobileOpen
  },[mobileOpen])

  useEffect(()=>{
    if(!mobileOpen)return
    const sidebar=sidebarRef.current
    if(!sidebar)return

    const previousOverflow=document.body.style.overflow
    document.body.style.overflow='hidden'

    const focusableSelector='a[href],button:not([disabled]),select:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    const focusable=()=>Array.from(sidebar.querySelectorAll<HTMLElement>(focusableSelector)).filter(element=>element.offsetParent!==null)
    const initial=sidebar.querySelector<HTMLButtonElement>('.sidebar-mobile-close')??focusable()[0]
    initial?.focus()

    function handleKeyDown(event:KeyboardEvent){
      if(event.key==='Escape'){
        event.preventDefault()
        setMobileOpen(false)
        return
      }
      if(event.key!=='Tab')return
      const elements=focusable()
      if(!elements.length)return
      const first=elements[0],last=elements[elements.length-1]
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }

    document.addEventListener('keydown',handleKeyDown)
    return()=>{
      document.body.style.overflow=previousOverflow
      document.removeEventListener('keydown',handleKeyDown)
    }
  },[mobileOpen])

  const modules=Array.from(new Set(hub.supervisorModules.filter(x=>!filters.supervisorId||x.supervisorId===filters.supervisorId).map(x=>x.moduloId))).sort()
  const current=items.find(i=>i.to==='/'?location.pathname==='/':location.pathname.startsWith(i.to))
  const supervisorName=filters.supervisorId?hub.supervisors.find(s=>s.supervisorId===filters.supervisorId)?.nomeExibicao:''
  const visiblePeriod=isFcaRoute?(filters.fcaPeriodo==='ALL'?'Todos os meses':periodLabel(filters.fcaPeriodo)):periodLabel(filters.periodo)
  const scope=[visiblePeriod,supervisorName,filters.moduloId].filter(Boolean).join(' · ')||'Escopo completo'
  const accessLabel=isOwner?'OWNER':hub.profile.governanceRole==='ADMIN'?'ADMINISTRADOR':hub.profile.perfil

  function toggleCollapsed(){setCollapsed(v=>{const next=!v;localStorage.setItem('bi-logistico-v2:sidebar',next?'collapsed':'expanded');return next})}
  function resetFilters(){onFiltersChange({...filters,supervisorId:'',moduloId:''})}
  function changePeriod(value:string){
    if(isFcaList)onFiltersChange({...filters,fcaPeriodo:value})
    else onFiltersChange({...filters,periodo:value})
  }

  return <div className={`app-shell ${collapsed?'sidebar-collapsed':''}`}>
    {mobileOpen&&<button className="sidebar-backdrop" type="button" aria-label="Fechar menu de navegação" onClick={()=>setMobileOpen(false)}/>} 
    <aside
      id={MOBILE_SIDEBAR_ID}
      ref={sidebarRef}
      className={`sidebar ${mobileOpen?'mobile-open':''}`}
      aria-label="Navegação principal"
      {...(mobileOpen?{role:'dialog','aria-modal':true as const}: {})}
    >
      <div className="sidebar-brand"><img src={BRAND_LOGO} alt="Unilog Express"/><span>BI LOGÍSTICO</span><button type="button" className="sidebar-collapse" onClick={toggleCollapsed} title={collapsed?'Expandir menu':'Recolher menu'} aria-label={collapsed?'Expandir menu lateral':'Recolher menu lateral'}><MenuIcon open={!collapsed}/></button><button type="button" className="sidebar-mobile-close" onClick={()=>setMobileOpen(false)} title="Fechar menu" aria-label="Fechar menu de navegação"><i className="pi pi-times" aria-hidden="true"/></button></div>
      <nav className="sidebar-nav" aria-label="Seções do BI">{items.map((item,index)=><div key={item.to} className={index===baseItems.length&&adminItems.length?'admin-nav-item':''}>{index===baseItems.length&&adminItems.length>0&&<span className="nav-section-label">ADMINISTRAÇÃO</span>}<NavLink to={item.to} end={item.to==='/' } title={collapsed?item.label:undefined}><i className={item.icon} aria-hidden="true"/><span className="nav-label">{item.label}</span></NavLink></div>)}</nav>
      <div className="sidebar-user"><Avatar label={hub.profile.nome.slice(0,1).toUpperCase()} shape="circle" className="sidebar-avatar"/><div className="sidebar-user-copy"><strong>{hub.profile.nome}</strong><span>{accessLabel}</span></div><button type="button" onClick={()=>void onSignOut()} title="Sair" aria-label="Sair do BI Logístico"><i className="pi pi-sign-out" aria-hidden="true"/></button></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div className="topbar-title"><button ref={mobileMenuButtonRef} type="button" className="mobile-menu-button" onClick={()=>setMobileOpen(true)} title="Abrir menu" aria-label="Abrir menu de navegação" aria-expanded={mobileOpen} aria-controls={MOBILE_SIDEBAR_ID}><MenuIcon/></button><div><span className="topbar-kicker">BI LOGÍSTICO</span><strong>{current?.label??'Visão geral'}</strong></div></div>
        <div className="topbar-profile" title={scope}>
          <span className="topbar-scope"><small>Escopo ativo</small><strong>{scope}</strong></span>
          <Tag value={accessLabel} severity="secondary" rounded className="topbar-access-tag"/>
          <span className="topbar-sync"><span className="sync-dot"/><span>HUB conectada</span></span>
        </div>
      </header>
      {!contextualRoute&&<div className="filter-toolbar" role="region" aria-label="Filtros globais">
        <div className="filter-toolbar-title"><i className="pi pi-filter" aria-hidden="true"/><div><strong>Filtros</strong><small>Refine o escopo da análise</small></div></div>
        <div className="topbar-filters">
          <label><span>Período</span><select aria-label="Período" value={isFcaList?filters.fcaPeriodo:filters.periodo} onChange={e=>changePeriod(e.target.value)}>{isFcaList&&<option value="ALL">Todos os meses</option>}{isFcaList?fcaPeriods.map(period=><option key={period} value={period}>{periodLabel(period)}</option>):periods.map(p=><option key={p.key} value={p.value}>{p.label}</option>)}</select></label>
          <label><span>Supervisor</span><select aria-label="Supervisor" value={filters.supervisorId} disabled={!isOperationalAdmin} onChange={e=>onFiltersChange({...filters,supervisorId:e.target.value,moduloId:''})}><option value="">{isOperationalAdmin?'Todos os supervisores':hub.profile.nome}</option>{isOperationalAdmin&&hub.supervisors.map(s=><option key={s.supervisorId} value={s.supervisorId}>{s.nomeExibicao}</option>)}</select></label>
          <label><span>Módulo</span><select aria-label="Módulo" value={filters.moduloId} onChange={e=>onFiltersChange({...filters,moduloId:e.target.value})}><option value="">Todos os módulos</option>{modules.map(m=><option key={m}>{m}</option>)}</select></label>
          {isOperationalAdmin&&(filters.supervisorId||filters.moduloId)&&<button type="button" className="topbar-filter-reset" onClick={resetFilters} title="Limpar supervisor e módulo" aria-label="Limpar supervisor e módulo"><i className="pi pi-filter-slash" aria-hidden="true"/></button>}
        </div>
      </div>}
      <main className="content">{!hub.analyticsReady&&<div className="analytics-warning"><i className="pi pi-info-circle" aria-hidden="true"/><div><strong>Camada analítica ainda não publicada no Apps Script.</strong><span>Cadastros e FCA funcionam, mas os indicadores aparecerão após atualizar a ponte da HUB para a versão 2.</span></div></div>}{children}</main>
    </div>
  </div>
}
