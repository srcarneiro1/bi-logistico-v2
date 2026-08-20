import { useMemo, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { operationalRows, pct } from '../lib/dashboard'
import type { DashboardFilters } from '../types/dashboard'
import type { HubBootstrap } from '../types/hub'

export function DepositantesPage({hub,filters}:{hub:HubBootstrap;filters:DashboardFilters}){
 const [search,setSearch]=useState(()=>{const cnpj=sessionStorage.getItem('bi-logistico-v2:depositante')||'';if(cnpj)sessionStorage.removeItem('bi-logistico-v2:depositante');return cnpj}); const ops=operationalRows(hub,filters); const map=new Map(ops.map(r=>[r.cnpj,r]));
 const rows=useMemo(()=>hub.depositantes.filter(d=>(!filters.supervisorId||d.supervisorId===filters.supervisorId)&&(!filters.moduloId||d.moduloId===filters.moduloId)&&(!search||`${d.nome} ${d.cnpj} ${d.codAllStrategy??''}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))).sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR')),[hub.depositantes,filters,search])
 return <section><PageHeader eyebrow="CARTEIRA" title="Depositantes" description="Cadastro operacional e indicadores do período para cada depositante autorizado." actions={<div className="search-box"><span className="material-symbols-rounded">search</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar depositante…"/></div>}/>
 <div className="table-wrap"><table><thead><tr><th>Depositante</th><th>Supervisor</th><th>Módulo</th><th>Produção</th><th>Recebimento</th><th>Inventário</th><th>CNPJ</th></tr></thead><tbody>{rows.map(d=>{const op=map.get(d.cnpj),sup=hub.supervisors.find(s=>s.supervisorId===d.supervisorId);return <tr key={d.cnpj}><td><div className="table-primary"><strong>{d.nome}</strong><span>{d.codAllStrategy??'Sem código AllStrategy'}</span></div></td><td>{sup?.nomeExibicao??d.supervisorId}</td><td><span className="module-badge">{d.moduloId}</span></td><td>{pct(op?.producaoPct)}</td><td>{pct(op?.recebimentoPct)}</td><td>{pct(op?.inventario?.totalPct)}</td><td className="mono">{d.cnpj}</td></tr>})}{!rows.length&&<tr><td colSpan={7} className="table-empty">Nenhum depositante encontrado.</td></tr>}</tbody></table></div>
 </section>
}
