export function FcaFormStepper({mode='cadastro'}:{mode?:'cadastro'|'edição'}){
  return <div className="fca-form-stepper" role="list" aria-label={`Etapas da ${mode}`}>
    <div role="listitem"><i>01</i><strong>Identificação</strong><span>Contexto operacional</span></div>
    <div role="listitem"><i>02</i><strong>Análise</strong><span>Causa e desvio</span></div>
    <div role="listitem"><i>03</i><strong>Plano de ação</strong><span>Responsáveis e prazos</span></div>
  </div>
}
