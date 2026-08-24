import { PageHeader } from '../components/PageHeader'
import { SubstitutionManager } from '../components/SubstitutionManager'
import type { HubBootstrap } from '../types/hub'

export function AdminSubstitutionsPage({hub,onRefresh}:{hub:HubBootstrap;onRefresh:()=>Promise<void>}){
 const isGovernanceAdmin=hub.profile.governanceRole==='OWNER'||hub.profile.governanceRole==='ADMIN'
 if(!isGovernanceAdmin)return <div className="notice notice-error">Área exclusiva para administradores.</div>
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date())
 const active=hub.substituicoes.filter(s=>s.ativo).length
 const future=hub.substituicoes.filter(s=>s.status==='ATIVA'&&!s.ativo&&s.dataInicio>today).length
 return <section className="admin-substitutions-page">
   <PageHeader eyebrow="ADMINISTRAÇÃO" title="Substituições" description="Cadastre pessoas substitutas e gerencie coberturas temporárias de supervisão. O acesso ao módulo é liberado somente durante uma cobertura vigente."/>
   <div className="admin-summary-grid"><div className="admin-summary-card"><span className="material-symbols-rounded">person</span><div><small>Substitutos cadastrados</small><strong>{hub.substitutos.length}</strong></div></div><div className="admin-summary-card"><span className="material-symbols-rounded">event_available</span><div><small>Coberturas em vigor</small><strong>{active}</strong></div></div><div className="admin-summary-card"><span className="material-symbols-rounded">event_upcoming</span><div><small>Coberturas futuras</small><strong>{future}</strong></div></div></div>
   <div className="admin-guidance"><span className="material-symbols-rounded">info</span><div><strong>Como cadastrar</strong><p>Cadastre primeiro a pessoa substituta com ID, nome e e-mail. Depois crie a cobertura associando supervisor titular, módulo e período. O e-mail é a chave usada para liberar o acesso temporário.</p></div></div>
   <SubstitutionManager hub={hub} onRefresh={onRefresh} startOpen/>
 </section>
}
