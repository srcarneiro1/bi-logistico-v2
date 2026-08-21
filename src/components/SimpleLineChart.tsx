import { pct, periodKey, periodLabel } from '../lib/dashboard'

interface Series { label:string; values:Array<{periodo:string;value:number|null}>; tone?:'red'|'gray'|'blue'|'yellow'|'green' }
const colors={red:'#DB0812',gray:'#494A56',blue:'#719c9a',yellow:'#b78a00',green:'#3f7c59'}
function axisLabel(periodo:string,index:number){
  const key=periodKey(periodo)
  if(!/^\d{4}-\d{2}$/.test(key)) return periodLabel(periodo)
  const [year,month]=key.split('-')
  const monthText=periodLabel(periodo).replace(/\s\d{4}$/,'')
  return index===0||month==='01'?`${monthText}/${year.slice(-2)}`:monthText
}
export function SimpleLineChart({series,height=230}:{series:Series[];height?:number}){
  const all=series.flatMap(s=>s.values.map(v=>v.value).filter((v):v is number=>v!=null))
  if(!all.length) return <div className="empty-chart">Sem histórico disponível para os filtros selecionados.</div>
  const periods=Array.from(new Set(series.flatMap(s=>s.values.map(v=>v.periodo))))
  const min=Math.max(0,Math.min(...all)-.04), max=Math.max(1,Math.max(...all)+.02)
  const W=720,H=height,padX=42,padY=24
  const x=(i:number)=>periods.length<=1?W/2:padX+i*(W-2*padX)/(periods.length-1)
  const y=(v:number)=>padY+(max-v)*(H-2*padY)/(max-min||1)
  return <div className="simple-chart">
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Evolução dos indicadores">
      {[0,.25,.5,.75,1].map(t=>{const yy=padY+t*(H-2*padY); const v=max-t*(max-min);return <g key={t}><line x1={padX} x2={W-padX} y1={yy} y2={yy} className="chart-grid"/><text x={4} y={yy+4} className="chart-axis">{pct(v)}</text></g>})}
      {series.map((s,si)=>{const pts=s.values.map(v=>({i:periods.indexOf(v.periodo),v:v.value})).filter((p):p is {i:number;v:number}=>p.v!=null); const d=pts.map((p,i)=>`${i?'L':'M'} ${x(p.i)} ${y(p.v)}`).join(' '); const tone=s.tone??(['red','gray','blue','yellow','green'][si%5] as keyof typeof colors); const c=colors[tone];return <g key={s.label}><path d={d} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>{pts.map(p=><circle key={`${p.i}-${p.v}`} cx={x(p.i)} cy={y(p.v)} r="3.5" fill="#fff" stroke={c} strokeWidth="2"/>)}</g>})}
      {periods.map((p,i)=><text key={p} x={x(i)} y={H-4} textAnchor="middle" className={`chart-axis chart-x ${periodKey(p).endsWith('-01')?'chart-year-start':''}`}>{axisLabel(p,i)}</text>)}
    </svg>
    <div className="chart-legend">{series.map((s,i)=>{const tone=s.tone??(['red','gray','blue','yellow','green'][i%5] as keyof typeof colors);return <span key={s.label}><i style={{background:colors[tone]}} />{s.label}</span>})}</div>
  </div>
}
