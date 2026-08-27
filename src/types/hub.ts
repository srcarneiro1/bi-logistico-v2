export type PerfilAcesso = 'ADMIN' | 'USUARIO'
export type GovernanceRole = 'OWNER' | 'ADMIN' | 'USER'

export interface HubProfile { id:string; email:string; nome:string; perfil:PerfilAcesso; supervisorId:string|null; governanceRole:GovernanceRole }
export interface HubSupervisor { supervisorId:string; supervisor:string; nomeExibicao:string; email:string; fotoUrl:string|null; fotoSource?:'SUPABASE'|'HUB'|null; ativo:boolean; perfilAcesso:PerfilAcesso }
export interface HubSupervisorModulo { supervisorId:string; moduloId:string; ativo:boolean }
export interface HubDepositante { cnpj:string; nome:string; codAllStrategy:string|null; supervisorId:string; moduloId:string; ativo:boolean }
export interface HubIndicador { codigo:string; grupo:string; indicador:string; metaPct:number|null; criticoPct:number|null; ativo:boolean }
export interface HubSubstituto { id:string; codigo:string; nome:string; email:string|null; fotoUrl:string|null; ativo:boolean }
export interface HubSubstituicao {
  substituicaoId:string
  legacySubstituicaoId?:string|null
  supervisorTitularId:string
  supervisorSubstitutoId:string
  supervisorSubstituto:string
  supervisorSubstitutoEmail?:string|null
  supervisorSubstitutoFotoUrl?:string|null
  substitutoMasterId?:string|null
  moduloId:string
  dataInicio:string
  dataFim:string
  motivo:string|null
  status?:'ATIVA'|'ENCERRADA'|'CANCELADA'|string
  ativo:boolean
  origem?:'HUB'|'SUPABASE'
}

export interface HubKpiGeral { periodo:string; codigo:string; kpi:string; valorPct:number|null }
export interface HubKpiInventario { periodo:string; codigo:string; kpiTipo:string; valorPct:number|null }
export interface HubKpiOperacional { periodo:string; nomeDepositante:string; cnpj:string; supervisorId:string; moduloId:string; producaoPct:number|null; recebimentoPct:number|null }
export interface HubKpiInventarioDepositante { periodo:string; nomeDepositante:string; cnpj:string; supervisorId:string; moduloId:string; prazoPct:number|null; enderecoPct:number|null; unidadePct:number|null; skuPct:number|null; totalPct:number|null }
export interface HubReceita { periodo:string; nomeDepositante:string; cnpj:string; codAllStrategy:string; supervisorId:string; moduloId:string; receitaPlanejada:number|null; receitaRealizada:number|null }
export interface HubDespesa { periodo:string; codAllStrategy:string; despesaPlanejada:number|null; despesaRealizada:number|null }

export interface HubFacts {
  kpiGeral: HubKpiGeral[]
  kpiInventario: HubKpiInventario[]
  kpiOperacional: HubKpiOperacional[]
  kpiInventarioDepositante: HubKpiInventarioDepositante[]
  receita: HubReceita[]
  despesa: HubDespesa[]
}

export interface HubBootstrap {
  profile: HubProfile
  supervisors: HubSupervisor[]
  supervisorModules: HubSupervisorModulo[]
  depositantes: HubDepositante[]
  indicadores: HubIndicador[]
  substitutos: HubSubstituto[]
  substituicoes: HubSubstituicao[]
  facts: HubFacts
  analyticsReady: boolean
  sourceUpdatedAt: string
}
