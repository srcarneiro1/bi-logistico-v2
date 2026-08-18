export type PerfilAcesso = 'ADMIN' | 'USUARIO'

export interface HubProfile {
  id: string
  email: string
  nome: string
  perfil: PerfilAcesso
  supervisorId: string | null
}

export interface HubSupervisor {
  supervisorId: string
  supervisor: string
  nomeExibicao: string
  email: string
  fotoUrl: string | null
  ativo: boolean
  perfilAcesso: PerfilAcesso
}

export interface HubSupervisorModulo {
  supervisorId: string
  moduloId: string
  ativo: boolean
}

export interface HubDepositante {
  cnpj: string
  nome: string
  codAllStrategy: string | null
  supervisorId: string
  moduloId: string
  ativo: boolean
}

export interface HubIndicador {
  codigo: string
  grupo: string
  indicador: string
  metaPct: number | null
  criticoPct: number | null
  ativo: boolean
}

export interface HubSubstituicao {
  substituicaoId: string
  supervisorTitularId: string
  supervisorSubstitutoId: string
  supervisorSubstituto: string
  moduloId: string
  dataInicio: string
  dataFim: string
  ativo: boolean
}

export interface HubBootstrap {
  profile: HubProfile
  supervisors: HubSupervisor[]
  supervisorModules: HubSupervisorModulo[]
  depositantes: HubDepositante[]
  indicadores: HubIndicador[]
  substituicoes: HubSubstituicao[]
  sourceUpdatedAt: string
}
