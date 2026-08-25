import { useEffect, useState } from 'react'
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

interface ActivePoint {
  id: string
  label: string
  periodo: string
  value: number
  color: string
  leftPct: number
  topPct: number
  align: 'left' | 'center' | 'right'
}

interface SimpleLineChartProps {
  series: Series[]
  height?: number
}

const colors = { red:'#DB0812', gray:'#494A56', blue:'#719c9a', yellow:'#b78a00', green:'#3f7c59' }
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

export function SimpleLineChart({series,height=230}:SimpleLineChartProps){
  const [activePoint,setActivePoint]=useState<ActivePoint|null>(null)
  const [hiddenSeries,setHiddenSeries]=useState<Set<string>>(()=>new Set())

  useEffect(()=>{
    const validLabels=new Set(series.map(item=>item.label))
    setHiddenSeries(current=>new Set([...current].filter(label=>validLabels.has(label))))
  },[series])

  const visibleSeries=series.filter(item=>!hiddenSeries.has(item.label))
  const all=visibleSeries.flatMap(s=>s.values.map(v=>v.value).filter((v):v is number=>v!=null))
  const hasData=series.some(s=>s.values.some(v=>v.value!=null))
  if(!hasData)return <EmptyState icon="query_stats" title="Sem histórico disponível" description="Não há pontos de série para o período e o escopo selecionados. Ajuste os filtros para consultar outro recorte."/>

  const periods=Array.from(new Set(series.flatMap(s=>s.values.map(v=>v.periodo))))
  const scaleValues=all.length?all:[0,1]
  const min=Math.max(0,Math.min(...scaleValues)-.04), max=Math.max(1,Math.max(...scaleValues)+.02)
  const W=720,H=height,padX=42,padY=24
  const x=(i:number)=>periods.length<=1?W/2:padX+i*(W-2*padX)/(periods.length-1)
  const y=(v:number)=>padY+(max-v)*(H-2*padY)/(max-min||1)

  function activatePoint(label:string,periodo:string,value:number,color:string,px:number,py:number,id:string){
    setActivePoint({id,label,periodo,value,color,leftPct:(px/W)*100,topPct:(py/H)*100,align:px<150?'left':px>W-150?'right':'center'})
  }

  function toggleSeries(label:string){
    setActivePoint(null)
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

  return <div className="simple-chart">
    <div className="simple-chart-plot">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Evolução dos indicadores em ${periods.length} período(s)`}>
        <title>Evolução histórica dos indicadores</title>
        {[0,.25,.5,.75,1].map(t=>{const yy=padY+t*(H-2*padY); const v=max-t*(max-min);return <g key={t}><line x1={padX} x2={W-padX} y1={yy} y2={yy} className="chart-grid"/><text x={4} y={yy+4} className="chart-axis">{pct(v)}</text></g>})}
        {visibleSeries.map((s,si)=>{
          const pts=s.values.map(v=>({i:periods.indexOf(v.periodo),v:v.value,periodo:v.periodo})).filter((p):p is {i:number;v:number;periodo:string}=>p.v!=null)
          const d=pts.map((p,i)=>`${i?'L':'M'} ${x(p.i)} ${y(p.v)}`).join(' ')
          const originalIndex=series.findIndex(item=>item.label===s.label)
          const tone=s.tone??fallbackTones[(originalIndex>=0?originalIndex:si)%fallbackTones.length]
          const c=colors[tone]
          return <g key={s.label}>
            <path d={d} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {pts.map((p,pointIndex)=>{
              const px=x(p.i),py=y(p.v),id=`${s.label}-${p.periodo}-${pointIndex}`
              return <g key={id}>
                <circle cx={px} cy={py} r="4" fill="#fff" stroke={c} strokeWidth="2" aria-hidden="true"/>
                <circle cx={px} cy={py} r="12" fill="transparent" className="chart-point-hit" tabIndex={0} role="button" aria-label={`${s.label}, ${periodLabel(p.periodo)}, ${pct(p.v)}`} onMouseEnter={()=>activatePoint(s.label,p.periodo,p.v,c,px,py,id)} onMouseLeave={()=>setActivePoint(current=>current?.id===id?null:current)} onFocus={()=>activatePoint(s.label,p.periodo,p.v,c,px,py,id)} onBlur={()=>setActivePoint(current=>current?.id===id?null:current)}/>
              </g>
            })}
          </g>
        })}
        {periods.map((p,i)=>shouldShowAxisLabel(p,i,periods.length)?<text key={p} x={x(i)} y={H-4} textAnchor="middle" className={`chart-axis chart-x ${periodKey(p).endsWith('-01')?'chart-year-start':''}`}>{axisLabel(p,i)}</text>:null)}
      </svg>
      {activePoint&&<div className={`chart-tooltip chart-tooltip-${activePoint.align}`} role="tooltip" style={{left:`${activePoint.leftPct}%`,top:`${activePoint.topPct}%`}}><div className="chart-tooltip-head"><i style={{background:activePoint.color}}/><strong>{activePoint.label}</strong></div><span>{periodLabel(activePoint.periodo)}</span><b>{pct(activePoint.value)}</b></div>}
    </div>
    <div className="chart-legend" aria-label="Séries do gráfico">{series.map((s,i)=>{const tone=s.tone??fallbackTones[i%fallbackTones.length];const visible=!hiddenSeries.has(s.label);const canHide=visibleSeries.length>1||!visible;return <button type="button" key={s.label} className={visible?'is-visible':'is-hidden'} aria-pressed={visible} aria-label={`${visible?'Ocultar':'Exibir'} série ${s.label}`} disabled={!canHide} onClick={()=>toggleSeries(s.label)}><i style={{background:colors[tone]}} />{s.label}</button>})}</div>
  </div>
}
