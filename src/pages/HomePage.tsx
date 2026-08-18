import type { HubBootstrap } from '../types/hub'

export function HomePage({ hub }: { hub: HubBootstrap }) {
  return (
    <section>
      <div className="page-header">
        <div>
          <span className="eyebrow">BI LOGÍSTICO V2</span>
          <h1>Visão geral</h1>
          <p>Base técnica conectada à HUB e ao novo banco de FCA.</p>
        </div>
      </div>
      <div className="metric-grid">
        <article className="metric-card"><span>Depositantes disponíveis</span><strong>{hub.depositantes.length}</strong></article>
        <article className="metric-card"><span>Supervisores disponíveis</span><strong>{hub.supervisors.length}</strong></article>
        <article className="metric-card"><span>Indicadores ativos</span><strong>{hub.indicadores.length}</strong></article>
      </div>
      <div className="panel">
        <h2>Contexto de acesso</h2>
        <dl className="details-grid">
          <div><dt>Usuário</dt><dd>{hub.profile.nome}</dd></div>
          <div><dt>Perfil</dt><dd>{hub.profile.perfil}</dd></div>
          <div><dt>SupervisorID</dt><dd>{hub.profile.supervisorId ?? 'Administrador'}</dd></div>
          <div><dt>Fonte</dt><dd>HUB_Dados_Unilog_REVISAO_PROPOSTA</dd></div>
        </dl>
      </div>
    </section>
  )
}
