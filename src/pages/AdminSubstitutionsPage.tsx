import { PageHeader } from '../components/PageHeader'
import { SubstitutionManager } from '../components/SubstitutionManager'
import { ContextNotice } from '../components/ui/ContextNotice'
import { EmptyState } from '../components/ui/Feedback'
import { SummaryMetrics } from '../components/ui/SummaryMetrics'
import type { HubBootstrap } from '../types/hub'

export function AdminSubstitutionsPage({hub,onRefresh}:{hub:HubBootstrap;onRefresh:()=>Promise<void>}){
 const isGovernanceAdmin=hub.profile.governanceRole==='OWNER'||hub.profile.governanceRole==='ADMIN'
 if(!isGovernanceAdmin)return <EmptyState tone="error" icon="lock" title="Área exclusiva para administradores" description="Somente Owner ou Administrador pode gerenciar substitutos e coberturas."/>
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date())
 const active=hub.substituicoes.filter(s=>s.ativo).length
 const future=hub.substituicoes.filter(s=>s.status==='ATIVA'&&!s.ativo&&s.dataInicio>today).length
 const closed=hub.substituicoes.filter(s=>!s.ativo&&s.dataInicio<=today).length
 return <section className="admin-substitutions-page">
   <PageHeader eyebrow="ADMINISTRAÇÃO" title="Substituições" description="Cadastre pessoas substitutas e gerencie coberturas temporárias de supervisão. O acesso ao módulo é liberado somente durante uma cobertura vigente."/>
   <SummaryMetrics ariaLabel="Resumo de substituições" items={[
     {key:'people',label:'Substitutos',value:hub.substitutos.length,detail:'pessoas cadastradas',icon:'person'},
     {key:'active',label:'Em vigor',value:active,detail:'coberturas ativas',icon:'event_available',tone:active?'success':'neutral'},
     {key:'future',label:'Futuras',value:future,detail:'coberturas programadas',icon:'event_upcoming',tone:future?'info':'neutral'},
     {key:'closed',label:'Encerradas',value:closed,detail:'histórico no cadastro',icon:'history'},
   ]}/>
   <ContextNotice title="Como funciona" description="Cadastre a pessoa substituta apenas uma vez. Depois, crie coberturas vinculando supervisor titular, módulo e período. O e-mail do substituto é usado para liberar o acesso temporário durante a vigência."/>
   <SubstitutionManager hub={hub} onRefresh={onRefresh}/>
 </section>
}
