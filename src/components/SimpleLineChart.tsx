import { useEffect, useMemo, useState } from 'react'
import { Chart } from 'primereact/chart'
import { pct, periodKey, periodLabel } from '../lib/dashboard'
import { EmptyState } from './ui/Feedback'
import './SimpleLineChart.css'

interface SeriesPoint {
  periodo: string
  value: number | null
}

interface Series {
  label: string
  values: SeriesPoint[]
  tone?: 'red' | 'gray' | 'blue' | 'yellow' | 'green'
}

interface SimpleLineChartProps {
  series: Series[]
  height?: number
}

const colors = {
  red:'#DB0812',
  gray:'#494A56',
  blue:'#8B9099',
  yellow:'#A87900',
  green:'#3F7C59',
}
const fallbackTones: Array<keyof typeof colors> = ['red','gray','blue','yellow','green']

function axisLabel(periodo:string,index:number){
  const key=periodKey(periodo)
  if(!/^\d{4}-\d{2}$/.test(key)) return periodLabel(periodo)
  const [year,month]=key.split('-')
  const monthText=periodLabel(periodo).replace(/\s\d{4}$/,'')
  return index===0||month==='01'?`${monthText}/${year.slice(-2)}`:monthText
}

function shouldShowAxisLabel(periodo:string,index:number,total:number){
  if(total<=1||index===0||index===total-1)return true
  if(periodKey(periodo).endsWith('-01'))return true
  const step=total>15?3:total>10?2:1
  return index%step===0
}

export function SimpleLineChart({series,height=248}:SimpleLineChartProps){
  const [hiddenSeries,setHiddenSeries]=useState<Set<string>>(()=>new Set())

  useEffect(()=>{
    const validLabels=new Set(series.map(item=>item.label))
    setHiddenSeries(current=>new Set([...current].filter(label=>validLabels.has(label))))
  },[series])

  const visibleSeries=series.filter(item=>!hiddenSeries.has(item.label))
  const hasData=series.some(s=>s.values.some(v=>v.value!=null))

  const periods=useMemo(
    ()=>Array.from(new Set(series.flatMap(s=>s.values.map(v=>v.periodo)))),
    [series],
  )
  const scaleValues=visibleSeries.flatMap(s=>s.values.map(v=>v.value).filter((v):v is number=>v!=null))
  const safeScaleValues=scaleValues.length?scaleValues:[0,1]
  const min=Math.max(0,Math.min(...safeScaleValues)-.04)
  const max=Math.max(1,Math.max(...safeScaleValues)+.02)

  const seriesByPeriod=useMemo(()=>series.map(item=>({
    label:item.label,
    values:new Map(item.values.map(point=>[point.periodo,point.value])),
  })),[series])

  const chartData=useMemo(()=>({
    labels:periods,
    datasets:visibleSeries.map((item,visibleIndex)=>{
      const originalIndex=series.findIndex(candidate=>candidate.label===item.label)
      const tone=item.tone??fallbackTones[(originalIndex>=0?originalIndex:visibleIndex)%fallbackTones.length]
      const color=colors[tone]
      const byPeriod=new Map(item.values.map(point=>[point.periodo,point.value]))
      return {
        label:item.label,
        data:periods.map(period=>byPeriod.get(period)??null),
        borderColor:color,
        backgroundColor:color,
        pointBackgroundColor:'#fff',
        pointBorderColor:color,
        pointBorderWidth:2,
        pointRadius:2.5,
        pointHoverRadius:4,
        borderWidth:2,
        tension:.28,
        spanGaps:true,
      }
    }),
  }),[periods,series,visibleSeries])

  const chartOptions=useMemo(()=>({
    responsive:true,
    maintainAspectRatio:false,
    animation:false as const,
    normalized:true,
    interaction:{mode:'nearest' as const,intersect:false},
    layout:{padding:{top:4,right:8,bottom:0,left:2}},
    plugins:{
      legend:{display:false},
      tooltip:{
        backgroundColor:'#242a36',
        titleColor:'#fff',
        bodyColor:'#fff',
        borderColor:'rgba(255,255,255,.08)',
        borderWidth:1,
        padding:10,
        displayColors:true,
        callbacks:{
          title:(contexts:any[])=>periodLabel(String(contexts[0]?.label??'')),
          label:(context:any)=>` ${context.dataset.label}: ${pct(context.parsed.y)}`,
        },
      },
    },
    scales:{
      x:{
        grid:{display:false},
        border:{display:false},
        ticks:{
          color:'#858A93',
          font:{size:9,family:'Roboto, Arial, sans-serif'},
          padding:7,
          autoSkip:false,
          maxRotation:0,
          minRotation:0,
          callback:(_value:any,index:number)=>{
            const period=periods[index]
            return period&&shouldShowAxisLabel(period,index,periods.length)?axisLabel(period,index):''
          },
        },
      },
      y:{
        min,
        max,
        grid:{color:'#ECEEF1'},
        border:{display:false},
        ticks:{
          color:'#858A93',
          font:{size:9,family:'Roboto, Arial, sans-serif'},
          padding:6,
          callback:(value:any)=>pct(Number(value)),
        },
      },
    },
  }),[max,min,periods])

  function toggleSeries(label:string){
    setHiddenSeries(current=>{
      const next=new Set(current)
      if(next.has(label)){
        next.delete(label)
        return next
      }
      const visibleCount=series.length-next.size
      if(visibleCount<=1)return current
      next.add(label)
      return next
    })
  }

  if(!hasData)return <EmptyState icon="query_stats" title="Sem histórico disponível" description="Não há pontos de série para o período e o escopo selecionados. Ajuste os filtros para consultar outro recorte."/>

  return <div className="simple-chart">
    <div className="simple-chart-stage nx-chart-stage" style={{height}} aria-hidden="true">
      <Chart type="line" data={chartData} options={chartOptions}/>
    </div>
    <table className="sr-only">
      <caption>Evolução histórica dos indicadores</caption>
      <thead><tr><th scope="col">Período</th>{seriesByPeriod.map(item=><th scope="col" key={item.label}>{item.label}</th>)}</tr></thead>
      <tbody>{periods.map(period=><tr key={period}><th scope="row">{periodLabel(period)}</th>{seriesByPeriod.map(item=>{const value=item.values.get(period);return <td key={item.label}>{value==null?'Sem dado':pct(value)}</td>})}</tr>)}</tbody>
    </table>
    <div className="chart-legend" aria-label="Séries do gráfico">{series.map((item,index)=>{
      const tone=item.tone??fallbackTones[index%fallbackTones.length]
      const visible=!hiddenSeries.has(item.label)
      const canHide=visibleSeries.length>1||!visible
      return <button type="button" key={item.label} className={visible?'is-visible':'is-hidden'} aria-pressed={visible} aria-label={`${visible?'Ocultar':'Exibir'} série ${item.label}`} disabled={!canHide} onClick={()=>toggleSeries(item.label)}><i style={{background:colors[tone]}} />{item.label}</button>
    })}</div>
  </div>
}
