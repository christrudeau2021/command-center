'use client'
import { useState, useEffect, useRef } from 'react'
import useSWR, { useSWRConfig } from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

// ── Settings ───────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  city: 'Woodstock, GA',
  tickers: 'SPY,QQQ,AAPL,MSFT,NVDA,BTC-USD',
  leagues: 'nba,mlb,nfl',
  rssFeeds: 'https://feeds.bbci.co.uk/news/world/rss.xml,https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
  background: 'default',
  accentColor: '#00D4FF',
  newsScrollSpeed: '40',
  newsFontSize: '13',
  fontStyle: 'default',
}
type Settings = typeof DEFAULT_SETTINGS

function useSettings(): [Settings, (s: Settings) => void] {
  const [s, setS] = useState<Settings>(DEFAULT_SETTINGS)
  useEffect(() => { try { const v = localStorage.getItem('cc-s'); if (v) setS({...DEFAULT_SETTINGS,...JSON.parse(v)}) } catch {} }, [])
  const save = (v: Settings) => { setS(v); try { localStorage.setItem('cc-s', JSON.stringify(v)) } catch {} }
  return [s, save]
}

const BG: Record<string,{bg:string;glow:string}> = {
  default:  {bg:'#080C12',glow:'radial-gradient(ellipse 60% 40% at 15% 20%,rgba(0,212,255,0.06) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 85% 80%,rgba(139,92,246,0.07) 0%,transparent 70%)'},
  midnight: {bg:'#050508',glow:'radial-gradient(ellipse 60% 40% at 20% 20%,rgba(139,92,246,0.09) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 80% 80%,rgba(59,130,246,0.06) 0%,transparent 70%)'},
  navy:     {bg:'#060B18',glow:'radial-gradient(ellipse 60% 40% at 10% 30%,rgba(59,130,246,0.09) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 90% 70%,rgba(0,212,255,0.05) 0%,transparent 70%)'},
  forest:   {bg:'#060E0A',glow:'radial-gradient(ellipse 60% 40% at 20% 20%,rgba(16,185,129,0.08) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 80% 80%,rgba(6,182,212,0.05) 0%,transparent 70%)'},
  graphite: {bg:'#0A0A0A',glow:'radial-gradient(ellipse 60% 40% at 15% 20%,rgba(255,255,255,0.04) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 85% 80%,rgba(255,255,255,0.02) 0%,transparent 70%)'},
}

// Font stacks per style
const FONTS: Record<string,{display:string;body:string;mono:string}> = {
  default:  {display:"'Syne', sans-serif",         body:"'DM Sans', sans-serif",         mono:"'JetBrains Mono', monospace"},
  clean:    {display:"'Inter', sans-serif",          body:"'Inter', sans-serif",            mono:"'Fira Code', monospace"},
  editorial:{display:"'Playfair Display', serif",   body:"'Source Sans 3', sans-serif",    mono:"'JetBrains Mono', monospace"},
  mono:     {display:"'JetBrains Mono', monospace", body:"'JetBrains Mono', monospace",    mono:"'JetBrains Mono', monospace"},
  rounded:  {display:"'Nunito', sans-serif",         body:"'Nunito', sans-serif",           mono:"'JetBrains Mono', monospace"},
}

// ── Clock ──────────────────────────────────────────────────────────
function ClockWidget({ accent, fonts }: { accent:string; fonts:typeof FONTS[string] }) {
  const [t, setT] = useState({h:'12',m:'00',s:'00',ap:'AM',day:'',date:''})
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const u = () => {
      const n=new Date(),h=n.getHours(),m=n.getMinutes(),s=n.getSeconds()
      const D=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      const M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      setT({h:String(h%12||12).padStart(2,'0'),m:String(m).padStart(2,'0'),s:String(s).padStart(2,'0'),ap:h>=12?'PM':'AM',day:D[n.getDay()],date:`${M[n.getMonth()]} ${n.getDate()}, ${n.getFullYear()}`})
    }
    u(); const i=setInterval(u,1000); return()=>clearInterval(i)
  }, [])

  // Auto-shrink font to fit card width
  useEffect(() => {
    const el = ref.current; if (!el) return
    el.style.fontSize = '10vw'
    while (el.scrollWidth > el.parentElement!.clientWidth - 32 && parseFloat(el.style.fontSize) > 1) {
      el.style.fontSize = (parseFloat(el.style.fontSize) - 0.2) + 'vw'
    }
  }, [t.h, t.m])

  return (
    <div className="card noise h-full" style={{display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'1.2vw',boxShadow:`0 0 2vw ${accent}22`,overflow:'hidden'}}>
      <span className="widget-label">Local Time</span>
      <div style={{display:'flex',alignItems:'flex-end',gap:'0.3vw',overflow:'hidden',minWidth:0}}>
        <span ref={ref} style={{fontFamily:fonts.display,fontWeight:800,color:'#F0F4F8',letterSpacing:'-0.04em',lineHeight:1,whiteSpace:'nowrap',display:'block'}}>{t.h}:{t.m}</span>
        <div style={{display:'flex',flexDirection:'column',marginBottom:'0.6vw',gap:3,flexShrink:0}}>
          <span style={{fontFamily:fonts.mono,fontSize:'clamp(8px,0.85vw,12px)',color:accent,letterSpacing:'.1em'}}>{t.ap}</span>
          <span style={{fontFamily:fonts.mono,fontSize:'clamp(7px,0.75vw,10px)',color:'#4A5568'}}>:{t.s}</span>
        </div>
      </div>
      <div>
        <div style={{fontFamily:fonts.display,fontSize:'clamp(0.75rem,1.3vw,1.2rem)',fontWeight:600,color:'#8B98A8'}}>{t.day}</div>
        <div style={{fontFamily:fonts.mono,fontSize:'clamp(7px,0.75vw,10px)',color:'#4A5568',marginTop:2}}>{t.date}</div>
      </div>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${accent}33,${accent}99,${accent}33)`,borderRadius:'0 0 12px 12px'}}/>
    </div>
  )
}

// ── Weather ────────────────────────────────────────────────────────
function WeatherWidget({ city, fonts }: { city:string; fonts:typeof FONTS[string] }) {
  const key = `/api/weather?city=${encodeURIComponent(city||'Woodstock, GA')}`
  const { data, mutate } = useSWR(key, fetcher, { refreshInterval:900_000, revalidateOnMount:true })
  const w = data||{}
  if (!data) return (
    <div className="card noise h-full" style={{padding:'1.2vw',display:'flex',flexDirection:'column',gap:'0.8vw'}}>
      <span className="widget-label">Weather</span>
      {[80,60,90,70].map((_,i)=><div key={i} className="shimmer rounded" style={{height:'clamp(10px,1.2vh,16px)',opacity:0.3}}/>)}
    </div>
  )
  return (
    <div className="card noise h-full" style={{padding:'1.2vw',display:'grid',gridTemplateRows:'auto 1fr auto auto',gap:'0.5vw',boxShadow:'0 0 2vw rgba(245,158,11,0.07)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span className="widget-label">Weather · {w.city}</span>
        <div className="live-dot"/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:'1.5vw'}}>
        <span style={{fontSize:'clamp(2rem,3.5vw,4.5rem)'}}>{w.icon}</span>
        <div>
          <div style={{fontFamily:fonts.display,fontSize:'clamp(2.2rem,4.5vw,5.5rem)',fontWeight:800,color:'#F0F4F8',lineHeight:1,letterSpacing:'-0.03em'}}>{w.temp}°</div>
          <div style={{fontFamily:fonts.body,fontSize:'clamp(9px,0.95vw,13px)',color:'#8B98A8',marginTop:3}}>{w.condition} · Feels {w.feels_like}°</div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:'2vw'}}>
          {[{l:'Humidity',v:`${w.humidity}%`},{l:'Wind',v:`${w.wind} mph`}].map(s=>(
            <div key={s.l}><div className="widget-label" style={{marginBottom:3}}>{s.l}</div>
            <div style={{fontFamily:fonts.mono,fontSize:'clamp(10px,1.1vw,15px)',color:'#F0F4F8'}}>{s.v}</div></div>
          ))}
        </div>
      </div>
      <div style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}/>
      <div style={{display:'flex',gap:'0.5vw'}}>
        {(w.forecast||[]).slice(0,5).map((day:Record<string,unknown>,i:number)=>(
          <div key={i} style={{flex:1,background:'rgba(255,255,255,0.04)',borderRadius:'0.5vw',padding:'0.4vw',textAlign:'center'}}>
            <div className="widget-label">{i===0?'Today':new Date((day.date as string)+'T12:00:00').toLocaleDateString('en-US',{weekday:'short'})}</div>
            <div style={{fontSize:'clamp(14px,1.6vw,22px)',margin:'0.3vw 0'}}>{day.icon as string}</div>
            <div style={{fontFamily:fonts.mono,fontSize:'clamp(8px,0.85vw,12px)',color:'#F0F4F8'}}>{day.high as number}°</div>
            <div style={{fontFamily:fonts.mono,fontSize:'clamp(7px,0.75vw,10px)',color:'#4A5568'}}>{day.low as number}°</div>
          </div>
        ))}
      </div>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#F59E0B33,#F59E0B99,#F59E0B33)',borderRadius:'0 0 12px 12px'}}/>
    </div>
  )
}

// ── Stocks ─────────────────────────────────────────────────────────
function StocksWidget({ fonts }: { fonts:typeof FONTS[string] }) {
  const { data } = useSWR('/api/stocks', fetcher, { refreshInterval:300_000 })
  const [ts,setTs] = useState('')
  useEffect(()=>{ const u=()=>setTs(new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})); u(); const i=setInterval(u,60_000); return()=>clearInterval(i) },[])
  const stocks:{symbol:string;name:string;price:number;change:number;pct:number}[] = data?.stocks||[]
  return (
    <div className="card noise h-full" style={{padding:'1.2vw',display:'flex',flexDirection:'column',gap:'0.5vw',boxShadow:'0 0 2vw rgba(16,185,129,0.07)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span className="widget-label">Markets</span>
        <div style={{display:'flex',alignItems:'center',gap:5}}><div className="live-dot"/><span className="widget-label">{ts}</span></div>
      </div>
      <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'0.35vw',scrollbarWidth:'none'}}>
        {!data?[1,2,3,4,5,6].map(i=><div key={i} className="shimmer rounded-lg" style={{height:'clamp(28px,3.2vh,38px)',opacity:0.3}}/>):
          stocks.map((s,i)=>{ const up=s.change>=0,c=up?'#10B981':'#EF4444'; return(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.3vw 0.55vw',borderRadius:'0.45vw',background:'rgba(255,255,255,0.04)'}}>
              <div style={{display:'flex',alignItems:'center',gap:'0.45vw'}}>
                <div style={{width:3,height:'clamp(18px,2.4vh,28px)',borderRadius:2,background:c,flexShrink:0}}/>
                <div>
                  <div style={{fontFamily:fonts.display,fontSize:'clamp(9px,0.95vw,13px)',fontWeight:700,color:'#F0F4F8'}}>{s.symbol}</div>
                  <div style={{fontFamily:fonts.body,fontSize:'clamp(7px,0.7vw,10px)',color:'#5A6880',maxWidth:'6.5vw',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:fonts.mono,fontSize:'clamp(9px,0.95vw,13px)',color:'#F0F4F8'}}>${s.price.toLocaleString()}</div>
                <div style={{fontFamily:fonts.mono,fontSize:'clamp(7px,0.75vw,10px)',color:c}}>{up?'▲':'▼'} {Math.abs(s.pct).toFixed(2)}%</div>
              </div>
            </div>
          )})
        }
      </div>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#10B98133,#10B98188,#10B98133)',borderRadius:'0 0 12px 12px'}}/>
    </div>
  )
}

// ── Calendar ───────────────────────────────────────────────────────
const CM:Record<string,string>={'1':'#3B82F6','2':'#10B981','3':'#8B5CF6','4':'#F59E0B','5':'#EF4444','6':'#06B6D4','7':'#EC4899','8':'#F97316'}
function CalendarWidget({ fonts }: { fonts:typeof FONTS[string] }) {
  const { data } = useSWR('/api/calendar', fetcher, { refreshInterval:300_000 })
  const events:Record<string,unknown>[] = Array.isArray(data?.events)?data.events:[]
  const groups:{label:string;events:Record<string,unknown>[]}[]=[]
  const seen=new Set<string>()
  events.forEach(e=>{
    const iso=e.start as string,d=new Date(iso.includes('T')?iso:iso+'T12:00:00'),diff=Math.floor((d.getTime()-Date.now())/86400000)
    if(diff<0)return
    const label=diff===0?'Today':diff===1?'Tomorrow':d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})
    if(!seen.has(label)){seen.add(label);groups.push({label,events:[]})}
    groups[groups.length-1].events.push(e)
  })
  return (
    <div className="card noise h-full" style={{padding:'1.2vw',display:'flex',flexDirection:'column',gap:'0.5vw',boxShadow:'0 0 2vw rgba(59,130,246,0.07)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span className="widget-label">Upcoming · Calendar</span>
        {data?.demo&&<span className="widget-label" style={{color:'#3B82F6'}}>demo</span>}
      </div>
      <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'0.7vw',scrollbarWidth:'none'}}>
        {!data?[1,2,3,4].map(i=><div key={i} className="shimmer rounded-lg" style={{height:'clamp(32px,4vh,44px)',opacity:0.3}}/>):
          groups.length===0?<div style={{color:'#4A5568',fontSize:'clamp(10px,1vw,13px)'}}>No upcoming events</div>:
          groups.slice(0,6).map(group=>(
            <div key={group.label}>
              <div className="widget-label" style={{color:'#3B82F6',marginBottom:'0.3vw'}}>{group.label}</div>
              {group.events.map(ev=>(
                <div key={ev.id as string} style={{display:'flex',alignItems:'center',gap:'0.5vw',padding:'0.35vw 0.55vw',borderRadius:'0.45vw',background:'rgba(255,255,255,0.04)',marginBottom:'0.25vw'}}>
                  <div style={{width:3,height:'clamp(20px,2.8vh,32px)',borderRadius:2,flexShrink:0,background:CM[ev.color as string]||'#3B82F6'}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:fonts.body,fontSize:'clamp(10px,1vw,13px)',color:'#F0F4F8',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ev.title as string}</div>
                    {!ev.allDay&&<div style={{fontFamily:fonts.mono,fontSize:'clamp(7px,0.72vw,10px)',color:'#5A6880',marginTop:1}}>{new Date(ev.start as string).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}</div>}
                  </div>
                </div>
              ))}
            </div>
          ))
        }
      </div>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#3B82F633,#3B82F688,#3B82F633)',borderRadius:'0 0 12px 12px'}}/>
    </div>
  )
}

// ── Summary ────────────────────────────────────────────────────────
type Tab='wins'|'progress'|'next'
const TABS=[{key:'wins' as Tab,label:'Wins',color:'#10B981'},{key:'progress' as Tab,label:'In Progress',color:'#F59E0B'},{key:'next' as Tab,label:'Next Steps',color:'#8B5CF6'}]
function SummaryWidget({ fonts }: { fonts:typeof FONTS[string] }) {
  const { data } = useSWR('/api/summary', fetcher, { refreshInterval:3_600_000 })
  const [tab,setTab]=useState<Tab>('wins')
  const s=data?.summary||{}
  const lists:Record<Tab,string[]>={wins:s.accomplishments||[],progress:s.in_progress||[],next:s.next_steps||[]}
  const ac=TABS.find(t=>t.key===tab)?.color||'#10B981'
  return (
    <div className="card noise h-full" style={{padding:'1.2vw',display:'flex',flexDirection:'column',gap:'0.5vw',boxShadow:`0 0 2vw ${ac}14`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span className="widget-label">Weekly Summary</span>
        <span className="widget-label" style={{color:ac}}>{s.week_label||''}</span>
      </div>
      {!data?<div className="shimmer rounded" style={{width:'80%',height:'clamp(12px,1.4vh,18px)',opacity:0.3}}/>:
        <div style={{fontFamily:fonts.display,fontSize:'clamp(0.8rem,1.15vw,1.05rem)',fontWeight:600,color:'#F0F4F8',lineHeight:1.45,paddingBottom:'0.5vw',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>{s.headline}</div>
      }
      <div style={{display:'flex',gap:'0.25vw'}}>
        {TABS.map(t=><button key={t.key} onClick={()=>setTab(t.key)} style={{fontFamily:fonts.mono,fontSize:'clamp(7px,0.72vw,10px)',letterSpacing:'0.12em',textTransform:'uppercase',padding:'3px 8px',borderRadius:6,border:'none',cursor:'pointer',background:tab===t.key?`${t.color}22`:'transparent',color:tab===t.key?t.color:'#4A5568',transition:'all 0.2s'}}>{t.label}</button>)}
      </div>
      <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:'0.45vw',scrollbarWidth:'none'}}>
        {!data?[70,85,65,90].map((w,i)=><div key={i} className="shimmer rounded" style={{width:`${w}%`,height:'clamp(10px,1.1vh,14px)',opacity:0.3}}/>):
          lists[tab].map((item,i)=>(
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'0.45vw'}}>
              <div style={{width:'clamp(4px,0.38vw,6px)',height:'clamp(4px,0.38vw,6px)',borderRadius:'50%',background:ac,flexShrink:0,marginTop:'0.4vw',boxShadow:`0 0 6px ${ac}`}}/>
              <span style={{fontFamily:fonts.body,fontSize:'clamp(10px,1vw,14px)',color:'#8B98A8',lineHeight:1.55}}>{item}</span>
            </div>
          ))
        }
      </div>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${ac}33,${ac}88,${ac}33)`,borderRadius:'0 0 12px 12px',transition:'background 0.3s'}}/>
    </div>
  )
}

// ── News — smooth auto-scroll ──────────────────────────────────────
function NewsWidget({ scrollSpeed, fontSize, fonts }: { scrollSpeed:number; fontSize:number; fonts:typeof FONTS[string] }) {
  const { data } = useSWR('/api/news', fetcher, { refreshInterval:600_000 })
  const articles:Record<string,string>[] = data?.articles||[]
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const rafRef   = useRef<number>(0)
  const posRef   = useRef(0)
  const pauseRef = useRef(false)
  const speedRef = useRef(scrollSpeed)
  speedRef.current = scrollSpeed

  const timeAgo=(iso:string)=>{ if(!iso)return''; const d=Date.now()-new Date(iso).getTime(),m=Math.floor(d/60000); return m<60?`${m}m`:m<1440?`${Math.floor(m/60)}h`:`${Math.floor(m/1440)}d` }

  // Scroll engine: starts after articles load and DOM paints
  useEffect(() => {
    if (articles.length === 0) return
    cancelAnimationFrame(rafRef.current)
    posRef.current = 0

    // Wait for DOM to fully paint article list
    const init = setTimeout(() => {
      const outer = outerRef.current
      const inner = innerRef.current
      if (!outer || !inner) return

      const tick = () => {
        const totalH = inner.scrollHeight
        const viewH  = outer.clientHeight
        if (totalH > viewH && !pauseRef.current) {
          posRef.current += totalH / (speedRef.current * 60)
          if (posRef.current >= totalH) posRef.current = 0
          outer.scrollTop = posRef.current
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }, 800)

    return () => { clearTimeout(init); cancelAnimationFrame(rafRef.current) }
  }, [articles.length])

  return (
    <div className="card noise h-full" style={{padding:'1.2vw',display:'flex',flexDirection:'column',gap:'0.5vw',boxShadow:'0 0 2vw rgba(139,92,246,0.07)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span className="widget-label">News Feed</span>
        <div className="live-dot"/>
      </div>
      <div ref={outerRef} style={{flex:1,overflow:'hidden',position:'relative'}}
        onMouseEnter={()=>pauseRef.current=true}
        onMouseLeave={()=>pauseRef.current=false}>
        <div ref={innerRef}>
          {!data?[85,70,90,75,80].map((w,i)=><div key={i} className="shimmer rounded mb-1" style={{width:`${w}%`,height:'clamp(28px,3.5vh,40px)',opacity:0.3}}/>):
            articles.slice(0,20).map((a,i)=>(
              <a key={i} href={a.link} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none',padding:'0.4vw 0.45vw',borderRadius:'0.4vw',display:'block',marginBottom:'0.15vw'}}
                onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.05)')}
                onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
                <div style={{fontFamily:fonts.body,fontSize,color:'#D1D9E0',fontWeight:500,lineHeight:1.4}}>{a.title}</div>
                <div style={{display:'flex',gap:6,marginTop:2}}>
                  <span style={{fontFamily:fonts.mono,fontSize:'clamp(7px,0.72vw,10px)',color:'#8B5CF6'}}>{a.source?.split(' ')[0]}</span>
                  <span style={{fontFamily:fonts.mono,fontSize:'clamp(7px,0.72vw,10px)',color:'#4A5568'}}>· {timeAgo(a.pubDate)} ago</span>
                </div>
              </a>
            ))
          }
        </div>
      </div>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#8B5CF633,#8B5CF688,#8B5CF633)',borderRadius:'0 0 12px 12px'}}/>
    </div>
  )
}

// ── Sports ─────────────────────────────────────────────────────────
type Game={league:string;status:string;state:'pre'|'in'|'post';home:{abbr:string;score:string};away:{abbr:string;score:string}}
const LC:Record<string,string>={NBA:'#F59E0B',NFL:'#3B82F6',MLB:'#10B981',NHL:'#8B5CF6',MLS:'#06B6D4'}
function SportsWidget({ fonts }: { fonts:typeof FONTS[string] }) {
  const { data } = useSWR('/api/sports', fetcher, { refreshInterval:120_000 })
  const games:Game[] = data?.games||[]
  return (
    <div className="card noise h-full" style={{padding:'1.2vw',display:'flex',flexDirection:'column',gap:'0.5vw',boxShadow:'0 0 2vw rgba(245,158,11,0.07)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span className="widget-label">Scores · Live</span><div className="live-dot"/></div>
      <div style={{flex:1,display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(clamp(100px,11vw,155px),1fr))',gap:'0.5vw',alignContent:'start',overflowY:'auto',scrollbarWidth:'none'}}>
        {!data?[1,2,3,4,5,6].map(i=><div key={i} className="shimmer rounded-lg" style={{height:'clamp(60px,8vh,90px)',opacity:0.3}}/>):
          games.length===0?<div style={{color:'#4A5568',fontSize:'clamp(10px,1vw,13px)',gridColumn:'1/-1'}}>No games today</div>:
          games.slice(0,12).map((g,i)=>(
            <div key={i} style={{background:'rgba(255,255,255,0.04)',borderRadius:'0.5vw',padding:'0.55vw 0.7vw'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.25vw'}}>
                <span style={{fontFamily:fonts.mono,fontSize:'clamp(7px,0.68vw,9px)',letterSpacing:'0.1em',color:LC[g.league]||'#5A6880'}}>{g.league}</span>
                {g.state==='in'&&<span style={{width:'clamp(4px,0.38vw,6px)',height:'clamp(4px,0.38vw,6px)',borderRadius:'50%',background:'#10B981',boxShadow:'0 0 5px #10B981',display:'inline-block'}}/>}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.2vw'}}>
                <span style={{fontFamily:fonts.display,fontSize:'clamp(10px,1.05vw,14px)',fontWeight:700,color:'#F0F4F8'}}>{g.away.abbr}</span>
                {g.state!=='pre'&&<span style={{fontFamily:fonts.mono,fontSize:'clamp(10px,1.05vw,14px)',color:'#F0F4F8'}}>{g.away.score}</span>}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.25vw'}}>
                <span style={{fontFamily:fonts.display,fontSize:'clamp(10px,1.05vw,14px)',fontWeight:700,color:'#8B98A8'}}>{g.home.abbr}</span>
                {g.state!=='pre'&&<span style={{fontFamily:fonts.mono,fontSize:'clamp(10px,1.05vw,14px)',color:'#8B98A8'}}>{g.home.score}</span>}
              </div>
              <div style={{fontFamily:fonts.mono,fontSize:'clamp(7px,0.68vw,9px)',color:g.state==='in'?'#10B981':'#5A6880'}}>{g.status}</div>
            </div>
          ))
        }
      </div>
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:'linear-gradient(90deg,#F59E0B33,#F59E0B88,#F59E0B33)',borderRadius:'0 0 12px 12px'}}/>
    </div>
  )
}

// ── Settings Panel ─────────────────────────────────────────────────
const RSS_PRESETS=[
  {label:'BBC World',   url:'https://feeds.bbci.co.uk/news/world/rss.xml'},
  {label:'BBC Tech',    url:'https://feeds.bbci.co.uk/news/technology/rss.xml'},
  {label:'NYT Tech',    url:'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml'},
  {label:'NYT World',   url:'https://rss.nytimes.com/services/xml/rss/nyt/World.xml'},
  {label:'WSJ Markets', url:'https://feeds.a.dj.com/rss/RSSMarketsMain.xml'},
  {label:'TechCrunch',  url:'https://techcrunch.com/feed/'},
  {label:'The Verge',   url:'https://www.theverge.com/rss/index.xml'},
  {label:'Reuters',     url:'https://feeds.reuters.com/reuters/topNews'},
  {label:'Ars Technica',url:'https://feeds.arstechnica.com/arstechnica/index'},
]
const BG_OPTIONS=[
  {key:'default', label:'Deep Space',color:'#080C12'},
  {key:'midnight',label:'Midnight',  color:'#050508'},
  {key:'navy',    label:'Navy',      color:'#060B18'},
  {key:'forest',  label:'Forest',    color:'#060E0A'},
  {key:'graphite',label:'Graphite',  color:'#0A0A0A'},
]
const AC_OPTIONS=[
  {label:'Cyan',  color:'#00D4FF'},{label:'Blue',  color:'#3B82F6'},
  {label:'Green', color:'#10B981'},{label:'Purple',color:'#8B5CF6'},
  {label:'Amber', color:'#F59E0B'},{label:'Pink',  color:'#EC4899'},
]
const FONT_OPTIONS=[
  {key:'default',   label:'Syne / DM Sans',        preview:'Aa'},
  {key:'clean',     label:'Inter (Clean)',           preview:'Aa'},
  {key:'editorial', label:'Playfair (Editorial)',    preview:'Aa'},
  {key:'mono',      label:'Monospace',               preview:'Aa'},
  {key:'rounded',   label:'Nunito (Rounded)',        preview:'Aa'},
]
const LEAGUES=['nba','nfl','mlb','nhl','ncaaf','ncaab','mls']
const LEAGUE_LABELS:Record<string,string>={nba:'🏀 NBA',nfl:'🏈 NFL',mlb:'⚾ MLB',nhl:'🏒 NHL',ncaaf:'🏈 NCAA Football',ncaab:'🏀 NCAA Basketball',mls:'⚽ MLS'}

type STab='location'|'news'|'appearance'|'sports'

// US States for dropdown
const US_STATES=['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

function SettingsPanel({ settings, onSave, onClose, onPreview }: { settings:Settings; onSave:(s:Settings)=>void; onClose:()=>void; onPreview:(s:Settings)=>void }) {
  const [d,setD] = useState<Settings>({...settings})
  const [st,setSt] = useState<STab>('location')
  const [cityInput,setCityInput] = useState(d.city.split(',')[0]?.trim()||'')
  const [stateInput,setStateInput] = useState(d.city.split(',')[1]?.trim()||'GA')
  const set=(k:keyof Settings,v:string)=>{ const n={...d,[k]:v}; setD(n); onPreview(n) }
  const selFeeds=d.rssFeeds?d.rssFeeds.split(',').filter(Boolean):[]
  const togFeed=(url:string)=>set('rssFeeds',(selFeeds.includes(url)?selFeeds.filter(f=>f!==url):[...selFeeds,url]).join(','))
  const selLeagues=d.leagues?d.leagues.split(',').filter(Boolean):[]
  const togLeague=(l:string)=>set('leagues',(selLeagues.includes(l)?selLeagues.filter(x=>x!==l):[...selLeagues,l]).join(','))
  const STABS=[{k:'location' as STab,l:'📍 Location'},{k:'news' as STab,l:'📰 News'},{k:'appearance' as STab,l:'🎨 Appearance'},{k:'sports' as STab,l:'🏈 Sports'}]
  const inp:React.CSSProperties={width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'10px 12px',color:'#F0F4F8',fontSize:14,outline:'none',fontFamily:'var(--font-body)'}

  const applyCity=()=>{ const c=`${cityInput.trim()}, ${stateInput}`; set('city',c) }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(10px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#131920',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,width:600,maxHeight:'84vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 0 80px rgba(0,0,0,0.9)'}}>
        {/* Header */}
        <div style={{padding:'20px 24px 0',borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div>
              <div style={{fontFamily:'var(--font-display)',fontSize:18,fontWeight:700,color:'#F0F4F8'}}>Dashboard Settings</div>
              <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'#4A5568',marginTop:2}}>Changes preview live — Save to keep them</div>
            </div>
            <button onClick={onClose} style={{background:'rgba(255,255,255,0.07)',border:'none',borderRadius:8,color:'#8B98A8',cursor:'pointer',width:32,height:32,fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
          </div>
          <div style={{display:'flex',gap:4}}>
            {STABS.map(t=><button key={t.k} onClick={()=>setSt(t.k)} style={{fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'0.08em',padding:'7px 14px',borderRadius:'8px 8px 0 0',border:'none',cursor:'pointer',background:st===t.k?'#1C2535':'transparent',color:st===t.k?'#F0F4F8':'#5A6880',transition:'all 0.2s',borderBottom:st===t.k?'2px solid #3B82F6':'2px solid transparent'}}>{t.l}</button>)}
          </div>
        </div>

        {/* Body */}
        <div style={{flex:1,overflowY:'auto',padding:24,scrollbarWidth:'none'}}>

          {st==='location'&&(
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <div className="widget-label" style={{marginBottom:10}}>Your Location</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:8,alignItems:'end'}}>
                  <div>
                    <div style={{fontSize:11,color:'#5A6880',marginBottom:5}}>City</div>
                    <input value={cityInput} onChange={e=>setCityInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&applyCity()} placeholder="e.g. Woodstock" style={inp}/>
                  </div>
                  <div>
                    <div style={{fontSize:11,color:'#5A6880',marginBottom:5}}>State</div>
                    <select value={stateInput} onChange={e=>setStateInput(e.target.value)} style={{...inp,width:'auto',padding:'10px 8px',cursor:'pointer'}}>
                      {US_STATES.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <button onClick={applyCity} style={{padding:'10px 16px',borderRadius:8,border:'none',background:'#3B82F6',color:'white',cursor:'pointer',fontSize:13,fontWeight:600,whiteSpace:'nowrap'}}>Update</button>
                </div>
                <div style={{marginTop:8,padding:'8px 12px',background:'rgba(0,212,255,0.07)',borderRadius:8,fontSize:11,color:'#8B98A8'}}>
                  Current: <span style={{color:'#00D4FF',fontFamily:'var(--font-mono)'}}>{d.city}</span> · Weather updates immediately after saving
                </div>
              </div>
              <div>
                <div className="widget-label" style={{marginBottom:8}}>Stock Tickers</div>
                <input value={d.tickers} onChange={e=>set('tickers',e.target.value)} placeholder="SPY,QQQ,AAPL,MSFT" style={{...inp,fontFamily:'var(--font-mono)'}}/>
                <div style={{fontSize:10,color:'#4A5568',marginTop:4}}>Comma-separated · Yahoo Finance symbols (BTC-USD for Bitcoin, etc.)</div>
              </div>
            </div>
          )}

          {st==='news'&&(
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:14,display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div>
                  <div className="widget-label" style={{marginBottom:8}}>Scroll Speed</div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <input type="range" min="15" max="120" value={d.newsScrollSpeed} onChange={e=>set('newsScrollSpeed',e.target.value)} style={{flex:1,accentColor:'#8B5CF6'}}/>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'#8B98A8',minWidth:32}}>{d.newsScrollSpeed}s</span>
                  </div>
                  <div style={{fontSize:10,color:'#4A5568',marginTop:3}}>Lower = faster scroll cycle</div>
                </div>
                <div>
                  <div className="widget-label" style={{marginBottom:8}}>Headline Font Size</div>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <input type="range" min="9" max="20" value={d.newsFontSize} onChange={e=>set('newsFontSize',e.target.value)} style={{flex:1,accentColor:'#8B5CF6'}}/>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'#8B98A8',minWidth:28}}>{d.newsFontSize}px</span>
                  </div>
                  <div style={{fontSize:10,color:'#4A5568',marginTop:3}}>News headline text size</div>
                </div>
              </div>
              <div style={{fontSize:12,color:'#8B98A8'}}>Select news sources:</div>
              {RSS_PRESETS.map(p=>{const on=selFeeds.includes(p.url);return(
                <div key={p.url} onClick={()=>togFeed(p.url)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',borderRadius:8,background:on?'rgba(139,92,246,0.1)':'rgba(255,255,255,0.04)',border:`1px solid ${on?'rgba(139,92,246,0.3)':'rgba(255,255,255,0.07)'}`,cursor:'pointer',transition:'all 0.2s'}}>
                  <span style={{fontSize:13,color:on?'#F0F4F8':'#8B98A8'}}>{p.label}</span>
                  <div style={{width:20,height:20,borderRadius:10,background:on?'#8B5CF6':'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{on&&<span style={{color:'white',fontSize:11}}>✓</span>}</div>
                </div>
              )})}
              <div>
                <div className="widget-label" style={{marginBottom:6}}>Custom RSS URL</div>
                <input placeholder="https://example.com/rss — press Enter to add" onKeyDown={e=>{if(e.key==='Enter'){const v=(e.target as HTMLInputElement).value.trim();if(v){togFeed(v);(e.target as HTMLInputElement).value=''}}}} style={{...inp,fontFamily:'var(--font-mono)',fontSize:12}}/>
              </div>
            </div>
          )}

          {st==='appearance'&&(
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              <div>
                <div className="widget-label" style={{marginBottom:10}}>Background Theme</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
                  {BG_OPTIONS.map(bg=>(
                    <div key={bg.key} onClick={()=>set('background',bg.key)} style={{cursor:'pointer',borderRadius:10,overflow:'hidden',border:`2px solid ${d.background===bg.key?'#3B82F6':'rgba(255,255,255,0.08)'}`,transition:'all 0.2s',transform:d.background===bg.key?'scale(1.06)':'scale(1)'}}>
                      <div style={{height:48,background:bg.color,display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {d.background===bg.key&&<span style={{fontSize:18,filter:'drop-shadow(0 0 4px white)'}}>✓</span>}
                      </div>
                      <div style={{padding:'5px 0',textAlign:'center',background:'rgba(255,255,255,0.04)'}}><span style={{fontFamily:'var(--font-mono)',fontSize:8,color:d.background===bg.key?'#3B82F6':'#8B98A8',letterSpacing:'0.08em'}}>{bg.label}</span></div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="widget-label" style={{marginBottom:10}}>Accent Color</div>
                <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                  {AC_OPTIONS.map(ac=>(
                    <div key={ac.color} onClick={()=>set('accentColor',ac.color)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer'}}>
                      <div style={{width:40,height:40,borderRadius:'50%',background:ac.color,border:`3px solid ${d.accentColor===ac.color?'white':'transparent'}`,boxShadow:d.accentColor===ac.color?`0 0 18px ${ac.color}`:'none',transition:'all 0.2s'}}/>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:8,color:'#5A6880'}}>{ac.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="widget-label" style={{marginBottom:10}}>Font Style</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
                  {FONT_OPTIONS.map(f=>(
                    <div key={f.key} onClick={()=>set('fontStyle',f.key)} style={{cursor:'pointer',borderRadius:10,padding:'10px 6px',textAlign:'center',background:d.fontStyle===f.key?'rgba(59,130,246,0.15)':'rgba(255,255,255,0.04)',border:`1px solid ${d.fontStyle===f.key?'#3B82F6':'rgba(255,255,255,0.08)'}`,transition:'all 0.2s'}}>
                      <div style={{fontFamily:FONTS[f.key].display,fontSize:20,fontWeight:700,color:d.fontStyle===f.key?'#F0F4F8':'#8B98A8',marginBottom:4}}>{f.preview}</div>
                      <div style={{fontFamily:'var(--font-mono)',fontSize:8,color:d.fontStyle===f.key?'#3B82F6':'#5A6880',letterSpacing:'0.06em',lineHeight:1.4}}>{f.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Live preview strip */}
              <div style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:14}}>
                <div className="widget-label" style={{marginBottom:8}}>Live Preview</div>
                <div style={{height:52,borderRadius:10,background:BG[d.background]?.bg||'#080C12',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',paddingLeft:16,gap:12,position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',inset:0,background:BG[d.background]?.glow||''}}/>
                  <div style={{width:10,height:10,borderRadius:'50%',background:d.accentColor,boxShadow:`0 0 12px ${d.accentColor}`,zIndex:1,flexShrink:0}}/>
                  <span style={{fontFamily:FONTS[d.fontStyle]?.display||'inherit',fontSize:16,fontWeight:700,color:d.accentColor,zIndex:1}}>Command Center</span>
                  <span style={{fontFamily:FONTS[d.fontStyle]?.body||'inherit',fontSize:12,color:'#8B98A8',marginLeft:'auto',marginRight:16,zIndex:1}}>Body text sample</span>
                </div>
              </div>
            </div>
          )}

          {st==='sports'&&(
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div style={{fontSize:12,color:'#8B98A8',marginBottom:4}}>Select leagues to show in the scores widget.</div>
              {LEAGUES.map(l=>{const on=selLeagues.includes(l);return(
                <div key={l} onClick={()=>togLeague(l)} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',borderRadius:8,background:on?'rgba(245,158,11,0.1)':'rgba(255,255,255,0.04)',border:`1px solid ${on?'rgba(245,158,11,0.3)':'rgba(255,255,255,0.07)'}`,cursor:'pointer',transition:'all 0.2s'}}>
                  <span style={{fontSize:13,color:on?'#F0F4F8':'#8B98A8'}}>{LEAGUE_LABELS[l]||l.toUpperCase()}</span>
                  <div style={{width:20,height:20,borderRadius:10,background:on?'#F59E0B':'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{on&&<span style={{color:'white',fontSize:11}}>✓</span>}</div>
                </div>
              )})}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:'16px 24px',borderTop:'1px solid rgba(255,255,255,0.07)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'#4A5568'}}>Changes preview live on dashboard</span>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>{onPreview(settings);onClose()}} style={{padding:'9px 20px',borderRadius:8,border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#8B98A8',cursor:'pointer',fontSize:13}}>Cancel</button>
            <button onClick={()=>{onSave(d);onClose()}} style={{padding:'9px 20px',borderRadius:8,border:'none',background:'#3B82F6',color:'white',cursor:'pointer',fontSize:13,fontWeight:600,boxShadow:'0 0 20px rgba(59,130,246,0.35)'}}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────
export default function Dashboard() {
  const [mounted,setMounted]=useState(false)
  const [showSettings,setShowSettings]=useState(false)
  const [settings,setSettings]=useSettings()
  const [preview,setPreview]=useState<Settings|null>(null)
  const { mutate } = useSWRConfig()
  useEffect(()=>setMounted(true),[])

  // When city changes, bust the weather cache immediately
  useEffect(()=>{
    if (!mounted) return
    const key = `/api/weather?city=${encodeURIComponent(settings.city||'Woodstock, GA')}`
    mutate(key)
  },[settings.city, mounted, mutate])
  if(!mounted)return <div style={{background:'#080C12',width:'100vw',height:'100vh'}}/>

  const active = preview||settings
  const {bg,glow} = BG[active.background]||BG.default
  const fonts = FONTS[active.fontStyle]||FONTS.default
  const scrollSpeed = parseInt(active.newsScrollSpeed)||40
  const fontSize = parseInt(active.newsFontSize)||13

  const handleSave=(s:Settings)=>{ setSettings(s); setPreview(null) }
  const handleClose=()=>{ setPreview(null); setShowSettings(false) }

  return (
    <div style={{width:'100vw',height:'100vh',background:bg,overflow:'hidden',position:'relative',transition:'background 0.4s ease'}}>
      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,background:glow,transition:'background 0.4s ease'}}/>

      {/* Gear */}
      <button onClick={()=>setShowSettings(true)} style={{position:'fixed',top:'0.9vw',right:'0.9vw',zIndex:50,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'0.6vw',color:'#8B98A8',cursor:'pointer',width:'clamp(28px,2.4vw,38px)',height:'clamp(28px,2.4vw,38px)',fontSize:'clamp(12px,1.1vw,17px)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}
        onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.13)')}
        onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.07)')}>⚙️</button>

      {/* Grid */}
      <div style={{position:'relative',zIndex:1,width:'100%',height:'100%',display:'grid',padding:'1.1vw',gap:'0.75vw',gridTemplateColumns:'18vw 1fr 1fr 17vw',gridTemplateRows:'22vh 1fr 21vh'}}>
        <div style={{animation:'slideUp 0.4s ease 0.00s both'}}><ClockWidget accent={active.accentColor} fonts={fonts}/></div>
        <div style={{gridColumn:'span 2',animation:'slideUp 0.4s ease 0.05s both'}}><WeatherWidget city={active.city} fonts={fonts}/></div>
        <div style={{animation:'slideUp 0.4s ease 0.10s both'}}><StocksWidget fonts={fonts}/></div>
        <div style={{animation:'slideUp 0.4s ease 0.15s both'}}><CalendarWidget fonts={fonts}/></div>
        <div style={{gridColumn:'span 2',animation:'slideUp 0.4s ease 0.20s both'}}><SummaryWidget fonts={fonts}/></div>
        <div style={{animation:'slideUp 0.4s ease 0.25s both'}}><NewsWidget scrollSpeed={scrollSpeed} fontSize={fontSize} fonts={fonts}/></div>
        <div style={{gridColumn:'span 3',animation:'slideUp 0.4s ease 0.30s both'}}><SportsWidget fonts={fonts}/></div>
        <div style={{animation:'slideUp 0.4s ease 0.35s both'}}>
          <div className="card noise h-full" style={{padding:'1.2vw',display:'flex',flexDirection:'column',justifyContent:'space-between',boxShadow:`0 0 2vw ${active.accentColor}11`}}>
            <span className="widget-label">Quick Links</span>
            <div style={{display:'flex',flexDirection:'column',gap:'0.45vw'}}>
              {[{l:'Gmail',u:'https://mail.google.com',c:'#EF4444'},{l:'Google Calendar',u:'https://calendar.google.com',c:'#3B82F6'},{l:'GitHub',u:'https://github.com',c:'#F0F4F8'},{l:'Vercel',u:'https://vercel.com',c:'#8B5CF6'}].map(lk=>(
                <a key={lk.l} href={lk.u} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:'0.45vw',padding:'0.38vw 0.55vw',borderRadius:'0.45vw',textDecoration:'none',background:'rgba(255,255,255,0.04)',transition:'background 0.15s'}}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.08)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.04)')}>
                  <div style={{width:'clamp(4px,0.45vw,7px)',height:'clamp(4px,0.45vw,7px)',borderRadius:'50%',background:lk.c,flexShrink:0}}/>
                  <span style={{fontFamily:fonts.body,fontSize:'clamp(9px,0.95vw,13px)',color:'#8B98A8'}}>{lk.l}</span>
                </a>
              ))}
            </div>
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${active.accentColor}33,${active.accentColor}88,${active.accentColor}33)`,borderRadius:'0 0 12px 12px'}}/>
          </div>
        </div>
      </div>

      {showSettings&&<SettingsPanel settings={settings} onSave={handleSave} onClose={handleClose} onPreview={setPreview}/>}
    </div>
  )
}
