export interface MetricHelpContent {
  title: string
  description: string
  footer?: string
}

function normalize(value:string){
  return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')
}

const helpByMetric:Record<string,MetricHelpContent>={
  leadtimeproducao:{
    title:'Lead Time de Produção',
    description:'Percentual de atendimento da produção dentro do prazo esperado para o período e escopo selecionados. Quanto maior o percentual, melhor a aderência operacional.',
    footer:'O status considera meta e faixa crítica cadastradas na HUB.',
  },
  leadtimerecebimento:{
    title:'Lead Time de Recebimento',
    description:'Percentual de recebimentos concluídos dentro do prazo esperado no período e escopo selecionados. O indicador evidencia eficiência e eventuais atrasos no fluxo de entrada.',
    footer:'A comparação mensal usa o período imediatamente anterior disponível.',
  },
  inventario:{
    title:'Inventário',
    description:'Visão consolidada da qualidade do inventário, considerando os sub-KPIs de prazo, endereço, unidade e SKU quando disponíveis no escopo selecionado.',
    footer:'A distância da meta é exibida em pontos percentuais.',
  },
  prazo:{
    title:'Prazo de Inventário',
    description:'Mede a aderência do processo de inventário aos prazos definidos para execução e tratamento das contagens.',
  },
  endereco:{
    title:'Acuracidade por Endereço',
    description:'Mede a consistência entre o saldo esperado e o encontrado nos endereços físicos avaliados no inventário.',
  },
  unidade:{
    title:'Acuracidade por Unidade',
    description:'Avalia a precisão das quantidades físicas contabilizadas nas unidades inventariadas.',
  },
  sku:{
    title:'Acuracidade por SKU',
    description:'Avalia a consistência do inventário por item, destacando divergências de identificação ou saldo entre os SKUs.',
  },
  pontuacaototal:{
    title:'Pontuação Total de Inventário',
    description:'Consolida o desempenho dos sub-KPIs de inventário em uma leitura única para acompanhamento gerencial.',
  },
}

export function metricHelp(label:string):MetricHelpContent{
  return helpByMetric[normalize(label)] ?? {
    title:label,
    description:'Indicador calculado para o período, supervisor e módulo selecionados. Use a meta, a comparação mensal e a distância da meta para interpretar sua evolução.',
    footer:'O escopo respeita os filtros ativos do BI.',
  }
}
