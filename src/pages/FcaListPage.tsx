import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/ui/Badge'
import { EmptyState, Skeleton } from '../components/ui/Feedback'
import { Panel } from '../components/ui/Panel'
import { SearchField } from '../components/ui/SearchField'
import { deriveFcaStatus, isFcaOverdue, listFcas } from '../lib/fca'
import type { DashboardFilters } from '../types/dashboard'
import type { FcaWithActions } from '../types/fca'
import type { HubBootstrap } from '../types/hub'

export function FcaListPage({filters}:{hub:HubBootstrap;filters:DashboardFilters}){
  const[rows,setRows]=useState<FcaWithActions[]>([])
  const[loading,setLoading]=useState(true)
  const[error,setError]=useState<string|null>(null)
  const[search,setSearch]=useState('')
  const[status,setStatus]=useState('')

  useEffect(()=>{
    setLoading(true)
    setError(null)
    void listFcas()
      .then(setRows)
      .catch(err=>setError(err instanceof Error?err.message:'Erro ao carregar FCA.'))
      .finally(()=>setLoading(false))
  },[])

  const scopedRows=useMemo(()=>rows.filter(row=>{
    if(filters.fcaPeriodo!=='ALL'&&row.data_reuniao.slice(0,7)!==filters.fcaPeriodo)return false
    if(filters.supervisorId&&row.supervisor_id!==filters.supervisorId&&row.substituto_id!==filters.supervisorId)return false
    if(filters.moduloId&&row.modulo_id!==filters.moduloId)return false
    if(search.trim()){
      const q=search.trim().toLocaleLowerCase('pt-BR')
      const hay=`${row.numero} ${row.depositante_nome} ${row.indicador_nome} ${row.supervisor_nome} ${row.causa}`.toLocaleLowerCase('pt-BR')
      if(!hay.includes(q))return false
    }
    return true
  }),[rows,filters.fcaPeriodo,filters.supervisorId,filters.moduloId,search])

  const counts=useMemo(()=>scopedRows.reduce((acc,row)=>{
    const key=isFcaOverdue(row)?'VENCIDO':deriveFcaStatus(row)
    acc[key]=(acc[key]??0)+1
    return acc
  },{} as Record<string,number>),[scopedRows])

  const filtered=useMemo(()=>scopedRows.filter(row=>{
    const derived=deriveFcaStatus(row)
    const overdue=isFcaOverdue(row)
    if(status==='VENCIDO')return overdue
    if(status)return derived===status
    return true
  }),[scopedRows,status])

  return <section>
    <PageHeader eyebrow="FCA" title="Fatos, causas e ações" description="Consulte uma competência específica ou mantenha Todos os meses sem alterar o período das demais áreas do BI." actions={<Link className="button button-primary" to="/fca/novo"><span className="material-symbols-rounded">add</span>Novo FCA</Link>}/>

    <div className="fca-status-summary" aria-label="Resumo por status">
      <button type="button" aria-pressed={!status} className={!status?'active':''} onClick={()=>setStatus('')}><strong>{scopedRows.length}</strong><span>Todos</span></button>
      <button type="button" aria-pressed={status==='ABERTO'} className={status==='ABERTO'?'active':''} onClick={()=>setStatus('ABERTO')}><strong>{counts.ABERTO??0}</strong><span>Abertos</span></button>
      <button type="button" aria-pressed={status==='EM_ANDAMENTO'} className={status==='EM_ANDAMENTO'?'active':''} onClick={()=>setStatus('EM_ANDAMENTO')}><strong>{counts.EM_ANDAMENTO??0}</strong><span>Em andamento</span></button>
      <button type="button" aria-pressed={status==='VENCIDO'} className={status==='VENCIDO'?'active':''} onClick={()=>setStatus('VENCIDO')}><strong>{counts.VENCIDO??0}</strong><span>Vencidos</span></button>
      <button type="button" aria-pressed={status==='CONCLUIDO'} className={status==='CONCLUIDO'?'active':''} onClick={()=>setStatus('CONCLUIDO')}><strong>{counts.CONCLUIDO??0}</strong><span>Concluídos</span></button>
    </div>

    <div className="ui-toolbar" role="region" aria-label="Filtros da FCA">
      <SearchField ariaLabel="Pesquisar FCA" placeholder="Pesquisar FCA, depositante, causa…" value={search} onChange={setSearch}/>
      <select aria-label="Status da FCA" value={status} onChange={event=>setStatus(event.target.value)}>
        <option value="">Todos os status</option><option value="ABERTO">Aberto</option><option value="EM_ANDAMENTO">Em andamento</option><option value="CONCLUIDO">Concluído</option><option value="VENCIDO">Vencido</option><option value="CANCELADO">Cancelado</option>
      </select>
    </div>

    {loading&&<Panel className="fca-results"><Skeleton lines={7}/></Panel>}
    {!loading&&error&&<Panel className="fca-results"><EmptyState tone="error" icon="error" title="Não foi possível carregar os FCAs" description={error}/></Panel>}
    {!loading&&!error&&<Panel className="fca-results">
      {filtered.length===0?<EmptyState title="Nenhum FCA encontrado" description="Ajuste os filtros ou a busca para consultar outros registros."/>:<div className="table-wrap embedded"><table className="fca-table responsive-data-table"><thead><tr><th scope="col">FCA</th><th scope="col">Data</th><th scope="col">Depositante</th><th scope="col">KPI</th><th scope="col">Supervisor</th><th scope="col">Módulo</th><th scope="col">Status</th></tr></thead><tbody>{filtered.map(row=>{const derived=deriveFcaStatus(row),overdue=isFcaOverdue(row),display=overdue?'VENCIDO':derived;return <tr key={row.id}><td data-label="FCA" data-primary="true"><Link className="fca-number-link" to={`/fca/${row.id}`}>#{String(row.numero).padStart(5,'0')}</Link></td><td data-label="Data">{new Date(`${row.data_reuniao}T12:00:00`).toLocaleDateString('pt-BR')}</td><td data-label="Depositante"><strong>{row.depositante_nome}</strong></td><td data-label="KPI">{row.indicador_nome}</td><td data-label="Supervisor">{row.supervisor_nome}</td><td data-label="Módulo"><span className="module-badge">{row.modulo_id}</span></td><td data-label="Status"><StatusBadge status={display}/></td></tr>})}</tbody></table></div>}
    </Panel>}
  </section>
}
