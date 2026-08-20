import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { periodKey } from '../lib/dashboard'
import { deriveFcaStatus, isFcaOverdue, listFcas } from '../lib/fca'
import type { DashboardFilters } from '../types/dashboard'
import type { FcaWithActions } from '../types/fca'
import type { HubBootstrap } from '../types/hub'

export function FcaListPage({hub,filters}:{hub:HubBootstrap;filters:DashboardFilters}){
  const[rows,setRows]=useState<FcaWithActions[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null),[search,setSearch]=useState(''),[status,setStatus]=useState('')
  useEffect(()=>{setLoading(true);void listFcas().then(setRows).catch(err=>setError(err instanceof Error?err.message:'Erro ao carregar FCA.')).finally(()=>setLoading(false))},[])
  const filtered=useMemo(()=>rows.filter(row=>{
    const derived=deriveFcaStatus(row),overdue=isFcaOverdue(row)
    if(filters.periodo&&row.data_reuniao.slice(0,7)!==periodKey(filters.periodo))return false
    if(filters.supervisorId&&row.supervisor_id!==filters.supervisorId&&row.substituto_id!==filters.supervisorId)return false
    if(filters.moduloId&&row.modulo_id!==filters.moduloId)return false
    if(status==='VENCIDO'&&!overdue)return false
    if(status&&status!=='VENCIDO'&&derived!==status)return false
    if(search.trim()){const q=search.trim().toLocaleLowerCase('pt-BR'),hay=`${row.numero} ${row.depositante_nome} ${row.indicador_nome} ${row.supervisor_nome} ${row.causa}`.toLocaleLowerCase('pt-BR');if(!hay.includes(q))return false}
    return true
  }),[rows,filters,status,search])
  const counts=useMemo(()=>filtered.reduce((acc,row)=>{const key=isFcaOverdue(row)?'VENCIDO':deriveFcaStatus(row);acc[key]=(acc[key]??0)+1;return acc},{} as Record<string,number>),[filtered])
  return <section>
    <div className="page-header page-header-row"><div><span className="eyebrow">FCA</span><h1>Fatos, causas e ações</h1><p>Registros do período e escopo definidos no cabeçalho. Use os filtros abaixo apenas para pesquisa e status.</p></div><Link className="button button-primary" to="/fca/novo"><span className="material-symbols-rounded">add</span>Novo FCA</Link></div>
    <div className="fca-status-summary"><button className={!status?'active':''} onClick={()=>setStatus('')}><strong>{filtered.length}</strong><span>Todos</span></button><button className={status==='ABERTO'?'active':''} onClick={()=>setStatus('ABERTO')}><strong>{counts.ABERTO??0}</strong><span>Abertos</span></button><button className={status==='EM_ANDAMENTO'?'active':''} onClick={()=>setStatus('EM_ANDAMENTO')}><strong>{counts.EM_ANDAMENTO??0}</strong><span>Em andamento</span></button><button className={status==='VENCIDO'?'active':''} onClick={()=>setStatus('VENCIDO')}><strong>{counts.VENCIDO??0}</strong><span>Vencidos</span></button><button className={status==='CONCLUIDO'?'active':''} onClick={()=>setStatus('CONCLUIDO')}><strong>{counts.CONCLUIDO??0}</strong><span>Concluídos</span></button></div>
    <div className="filters-panel fca-scope-filters"><div className="search-box"><span className="material-symbols-rounded">search</span><input placeholder="Pesquisar FCA, depositante, causa…" value={search} onChange={e=>setSearch(e.target.value)}/></div><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">Todos os status</option><option value="ABERTO">Aberto</option><option value="EM_ANDAMENTO">Em andamento</option><option value="CONCLUIDO">Concluído</option><option value="VENCIDO">Vencido</option><option value="CANCELADO">Cancelado</option></select></div>
    {loading&&<div className="panel loading-panel">Carregando FCAs…</div>}{error&&<div className="notice notice-error">{error}</div>}{!loading&&!error&&<div className="table-wrap"><table><thead><tr><th>FCA</th><th>Data</th><th>Depositante</th><th>KPI</th><th>Supervisor</th><th>Módulo</th><th>Status</th></tr></thead><tbody>{filtered.map(row=>{const derived=deriveFcaStatus(row),overdue=isFcaOverdue(row),display=overdue?'VENCIDO':derived;return <tr key={row.id}><td><Link className="fca-number-link" to={`/fca/${row.id}`}>#{String(row.numero).padStart(5,'0')}</Link></td><td>{new Date(`${row.data_reuniao}T12:00:00`).toLocaleDateString('pt-BR')}</td><td><strong>{row.depositante_nome}</strong></td><td>{row.indicador_nome}</td><td>{row.supervisor_nome}</td><td><span className="module-badge">{row.modulo_id}</span></td><td><span className={`status-badge status-${display}`}>{display.replace('_',' ')}</span></td></tr>})}{filtered.length===0&&<tr><td colSpan={7} className="table-empty">Nenhum FCA encontrado para o escopo atual.</td></tr>}</tbody></table></div>}
  </section>
}
