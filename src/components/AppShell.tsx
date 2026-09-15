import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Avatar } from 'primereact/avatar'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Dropdown } from 'primereact/dropdown'
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

function MenuIcon({open=false,menu=false}:{open?:boolean;menu?:boolean}){
  return <i className={menu?'pi pi-bars':open?'pi pi-angle-left':'pi pi-angle-right'} aria-hidden="true"/>
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
      if(event.key==='Escape'){event.preventDefault();setMobileOpen(false);return}
      if(event.key!=='Tab')return
      const elements=focusable()
      if(!elements.length)return
      const first=elements[0],last=elements[elements.length-1]
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
    document.addEventListener('keydown',handleKeyDown)
    return()=>{document.body.style.overflow=previousOverflow;document.removeEventListener('keydown',handleKeyDown)}
  },[mobileOpen])

  const modules=Array.from(new Set(hub.supervisorModules.filter(x=>!filters.supervisorId||x.supervisorId===filters.supervisorId).map(x=>x.moduloId))).sort()
  const current=items.find(i=>i.to==='/'?location.pathname==='/':location.pathname.startsWith(i.to))
  const supervisorName=filters.supervisorId?hub.supervisors.find(s=>s.supervisorId===filters.supervisorId)?.nomeExibicao:''
  const visiblePeriod=isFcaRoute?(filters.fcaPeriodo==='ALL'?'Todos os meses':periodLabel(filters.fcaPeriodo)):periodLabel(filters.periodo)
  const scope=[visiblePeriod,supervisorName,filters.moduloId].filter(Boolean).join(' · ')||'Escopo completo'
  const accessLabel=isOwner?'OWNER':hub.profile.governanceRole==='ADMIN'?'ADMINISTRADOR':hub.profile.perfil
  const periodOptions=isFcaList?[{label:'Todos os meses',value:'ALL'},...fcaPeriods.map(period=>({label:periodLabel(period),value:period}))]:periods.map(period=>({label:period.label,value:period.value}))
  const supervisorOptions=isOperationalAdmin?[{label:'Todos os supervisores',value:''},...hub.supervisors.map(supervisor=>({label:supervisor.nomeExibicao,value:supervisor.supervisorId}))]:[{label:hub.profile.nome,value:''}]
  const moduleOptions=[{label:'Todos os módulos',value:''},...modules.map(module=>({label:module,value:module}))]

  function toggleCollapsed(){setCollapsed(v=>{const next=!v;localStorage.setItem('bi-logistico-v2:sidebar',next?'collapsed':'expanded');return next})}
  function resetFilters(){onFiltersChange({...filters,supervisorId:'',moduloId:''})}
  function changePeriod(value:string){if(isFcaList)onFiltersChange({...filters,fcaPeriodo:value});else onFiltersChange({...filters,periodo:value})}

  return <div className={`app-shell ${collapsed?'sidebar-collapsed':''}`}>
    {mobileOpen&&<button className="sidebar-backdrop" type="button" aria-label="Fechar menu de navegação" onClick={()=>setMobileOpen(false)}/>} 
    <aside id={MOBILE_SIDEBAR_ID} ref={sidebarRef} className={`sidebar ${mobileOpen?'mobile-open':''}`} aria-label="Navegação principal" {...(mobileOpen?{role:'dialog','aria-modal':true as const}:{})}>
      <div className="sidebar-brand"><img src={BRAND_LOGO} alt="Unilog Express"/><span>BI LOGÍSTICO</span><button type="button" className="sidebar-collapse" onClick={toggleCollapsed} title={collapsed?'Expandir menu':'Recolher menu'} aria-label={collapsed?'Expandir menu lateral':'Recolher menu lateral'}><MenuIcon open={!collapsed}/></button><button type="button" className="sidebar-mobile-close" onClick={()=>setMobileOpen(false)} title="Fechar menu" aria-label="Fechar menu de navegação"><i className="pi pi-times" aria-hidden="true"/></button></div>
      <nav className="sidebar-nav" aria-label="Seções do BI">{items.map((item,index)=><div key={item.to} className={index===baseItems.length&&adminItems.length?'admin-nav-item':''}>{index===baseItems.length&&adminItems.length>0&&<span className="nav-section-label">ADMINISTRAÇÃO</span>}<NavLink to={item.to} end={item.to==='/'} title={collapsed?item.label:undefined}><i className={item.icon} aria-hidden="true"/><span className="nav-label">{item.label}</span></NavLink></div>)}</nav>
      <div className="sidebar-user"><Avatar label={hub.profile.nome.slice(0,1).toUpperCase()} shape="circle" className="sidebar-avatar"/><div className="sidebar-user-copy"><strong>{hub.profile.nome}</strong><span>{accessLabel}</span></div><button type="button" onClick={()=>void onSignOut()} title="Sair" aria-label="Sair do BI Logístico"><i className="pi pi-sign-out" aria-hidden="true"/></button></div>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <div className="topbar-title"><button ref={mobileMenuButtonRef} type="button" className="mobile-menu-button" onClick={()=>setMobileOpen(true)} title="Abrir menu" aria-label="Abrir menu de navegação" aria-expanded={mobileOpen} aria-controls={MOBILE_SIDEBAR_ID}><MenuIcon menu/></button><div><span className="topbar-kicker">BI LOGÍSTICO</span><strong>{current?.label??'Visão geral'}</strong></div></div>
        <div className="topbar-profile" title={scope}><span className="topbar-scope"><small>Escopo ativo</small><strong>{scope}</strong></span><Tag value={accessLabel} severity="secondary" rounded className="topbar-access-tag"/><span className="topbar-sync"><span className="sync-dot"/><span>HUB conectada</span></span></div>
      </header>

      {!contextualRoute&&<section className="global-filter-stage" aria-label="Filtros globais">
        <Card className="dashboard-filter-panel nx-dashboard-filter-card global-filter-card">
          <div className="nx-dashboard-filter-grid">
            <label className="nx-field">Período<Dropdown aria-label="Período" value={isFcaList?filters.fcaPeriodo:filters.periodo} options={periodOptions} optionLabel="label" optionValue="value" onChange={event=>changePeriod(String(event.value??''))}/></label>
            <label className="nx-field">Supervisor<Dropdown aria-label="Supervisor" value={filters.supervisorId} options={supervisorOptions} optionLabel="label" optionValue="value" disabled={!isOperationalAdmin} onChange={event=>onFiltersChange({...filters,supervisorId:String(event.value??''),moduloId:''})}/></label>
            <label className="nx-field">Módulo<Dropdown aria-label="Módulo" value={filters.moduloId} options={moduleOptions} optionLabel="label" optionValue="value" onChange={event=>onFiltersChange({...filters,moduloId:String(event.value??'')})}/></label>
          </div>
          <div className="nx-dashboard-filter-actions">
            <Button type="button" label="Limpar dimensões" icon="pi pi-filter-slash" outlined onClick={resetFilters} disabled={!isOperationalAdmin||(!filters.supervisorId&&!filters.moduloId)}/>
          </div>
        </Card>
      </section>}

      <main className="content">{!hub.analyticsReady&&<div className="analytics-warning"><i className="pi pi-info-circle" aria-hidden="true"/><div><strong>Camada analítica ainda não publicada no Apps Script.</strong><span>Cadastros e FCA funcionam, mas os indicadores aparecerão após atualizar a ponte da HUB para a versão 2.</span></div></div>}{children}</main>
    </div>
  </div>
}
