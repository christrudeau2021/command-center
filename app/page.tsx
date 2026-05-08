'use client'
import { useState, useEffect } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

// ── Clock ──────────────────────────────────────────────────────────
function ClockWidget() {
  const [time, setTime] = useState({ h: '12', m: '00', s: '00', ap: 'AM', day: '', date: '' })
  useEffect(() => {
    const update = () => {
      const n = new Date()
      const h = n.getHours(), m = n.getMinutes(), s = n.getSeconds()
      const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
      setTime({
        h: String(h % 12 || 12).padStart(2,'0'),
        m: String(m).padStart(2,'0'),
        s: String(s).padStart(2,'0'),
        ap: h >= 12 ? 'PM' : 'AM',
        day: DAYS[n.getDay()],
        date: `${MONTHS[n.getMonth()]} ${n.getDate()}, ${n.getFullYear()}`
      })
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="card glow-cyan noise flex flex-col justify-between p-6 h-full">
      <span className="widget-label">Local Time</span>
      <div className="flex items-end gap-2">
        <span style={{ fontFamily:'var(--font-display)', fontSize:'clamp(3rem,6vw,5.5rem)', fontWeight:800, color:'#F0F4F8', letterSpacing:'-0.03em', lineHeight:1 }}>
          {time.h}:{time.m}
        </span>
        <div className="flex flex-col items-start mb-2 gap-1">
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#00D4FF', letterSpacing:'.1em' }}>{time.ap}</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#4A5568' }}>:{time.s}</span>
        </div>
      </div>
      <div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(0.9rem,1.4vw,1.2rem)', fontWeight:600, color:'#8B98A8' }}>{time.day}</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#4A5568', marginTop:2 }}>{time.date}</div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#00D4FF33,#00D4FF88,#00D4FF33)', borderRadius:'0 0 16px 16px' }} />
    </div>
  )
}

// ── Weather ────────────────────────────────────────────────────────
function WeatherWidget() {
  const { data } = useSWR('/api/weather', fetcher, { refreshInterval: 900_000 })
  const w = data || {}
  if (!data) return (
    <div className="card glow-amber noise p-6 h-full flex flex-col gap-3">
      <span className="widget-label">Weather</span>
      {[80,60,90,70].map((w,i) => <div key={i} className="shimmer rounded h-4" style={{ width:`${w}%`, opacity:0.3 }} />)}
    </div>
  )
  return (
    <div className="card glow-amber noise p-6 h-full flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <span className="widget-label">Weather · {w.city}</span>
        <div className="live-dot" />
      </div>
      <div className="flex items-center gap-4">
        <span style={{ fontSize:'clamp(2rem,3.5vw,3.2rem)' }}>{w.icon}</span>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.5rem,4vw,3.8rem)', fontWeight:800, color:'#F0F4F8', lineHeight:1, letterSpacing:'-0.03em' }}>{w.temp}°</div>
          <div style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#8B98A8', marginTop:2 }}>{w.condition} · Feels {w.feels_like}°</div>
        </div>
      </div>
      <div className="flex gap-4" style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:12 }}>
        {[{label:'Humidity',val:`${w.humidity}%`},{label:'Wind',val:`${w.wind} mph`}].map(s => (
          <div key={s.label}>
            <div className="widget-label" style={{ marginBottom:2 }}>{s.label}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'#F0F4F8' }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 overflow-hidden">
        {(w.forecast || []).slice(0,5).map((day: Record<string,unknown>, i: number) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg" style={{ background:'rgba(255,255,255,0.04)' }}>
            <span className="widget-label">{i===0?'Today':new Date((day.date as string)+'T12:00:00').toLocaleDateString('en-US',{weekday:'short'})}</span>
            <span style={{ fontSize:16 }}>{day.icon as string}</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#F0F4F8' }}>{day.high as number}°</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#4A5568' }}>{day.low as number}°</span>
          </div>
        ))}
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#F59E0B33,#F59E0B88,#F59E0B33)', borderRadius:'0 0 16px 16px' }} />
    </div>
  )
}

// ── Stocks ─────────────────────────────────────────────────────────
function StocksWidget() {
  const { data } = useSWR('/api/stocks', fetcher, { refreshInterval: 300_000 })
  const [timeStr, setTimeStr] = useState('')
  useEffect(() => {
    const u = () => setTimeStr(new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}))
    u(); const t = setInterval(u, 60_000); return () => clearInterval(t)
  }, [])
  const stocks: {symbol:string;name:string;price:number;change:number;pct:number}[] = data?.stocks || []
  return (
    <div className="card noise p-6 h-full flex flex-col gap-4" style={{ boxShadow:'0 0 30px rgba(16,185,129,0.08)' }}>
      <div className="flex items-center justify-between">
        <span className="widget-label">Markets</span>
        <div className="flex items-center gap-2"><div className="live-dot" /><span className="widget-label" style={{ color:'#4A5568' }}>{timeStr}</span></div>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ scrollbarWidth:'none' }}>
        {!data ? [1,2,3,4,5,6].map(i => <div key={i} className="shimmer h-10 rounded-lg" style={{ opacity:0.3 }} />) :
          stocks.map((s,i) => {
            const up = s.change >= 0; const color = up ? '#10B981' : '#EF4444'
            return (
              <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background:'rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width:3, height:28, borderRadius:2, background:color, flexShrink:0 }} />
                  <div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color:'#F0F4F8' }}>{s.symbol}</div>
                    <div style={{ fontFamily:'var(--font-body)', fontSize:10, color:'#5A6880', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:90 }}>{s.name}</div>
                  </div>
                </div>
                <div className="flex items-end flex-col gap-0.5">
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:500, color:'#F0F4F8' }}>${s.price.toLocaleString()}</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color }}>{up?'▲':'▼'} {Math.abs(s.pct).toFixed(2)}%</div>
                </div>
              </div>
            )
          })
        }
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#10B98133,#10B98188,#10B98133)', borderRadius:'0 0 16px 16px' }} />
    </div>
  )
}

// ── Calendar ───────────────────────────────────────────────────────
const COLOR_MAP: Record<string,string> = {'1':'#3B82F6','2':'#10B981','3':'#8B5CF6','4':'#F59E0B','5':'#EF4444','6':'#06B6D4','7':'#EC4899','8':'#F97316'}
function CalendarWidget() {
  const { data } = useSWR('/api/calendar', fetcher, { refreshInterval: 300_000 })
  const events: Record<string,unknown>[] = Array.isArray(data?.events) ? data.events : []
  const groups: { label:string; events:Record<string,unknown>[] }[] = []
  const seen = new Set<string>()
  events.forEach(e => {
    const iso = e.start as string
    const d = new Date(iso.includes('T') ? iso : iso+'T12:00:00')
    const now = new Date()
    const diff = Math.floor((d.getTime()-now.getTime())/86400000)
    if (diff < 0) return
    const label = diff===0?'Today':diff===1?'Tomorrow':d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})
    if (!seen.has(label)) { seen.add(label); groups.push({label,events:[]}) }
    groups[groups.length-1].events.push(e)
  })
  return (
    <div className="card glow-blue noise p-6 h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="widget-label">Upcoming · Calendar</span>
        {data?.demo && <span className="widget-label" style={{ color:'#3B82F6' }}>demo</span>}
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-4" style={{ scrollbarWidth:'none' }}>
        {!data ? [1,2,3,4].map(i=><div key={i} className="shimmer h-10 rounded-lg" style={{ opacity:0.3 }} />) :
          groups.length===0 ? <div style={{ color:'#4A5568',fontSize:13 }}>No upcoming events</div> :
          groups.slice(0,4).map(group => (
            <div key={group.label}>
              <div className="widget-label" style={{ color:'#3B82F6',marginBottom:6 }}>{group.label}</div>
              <div className="flex flex-col gap-2">
                {group.events.map(event => (
                  <div key={event.id as string} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background:'rgba(255,255,255,0.04)' }}>
                    <div style={{ width:3, height:32, borderRadius:2, flexShrink:0, background:COLOR_MAP[event.color as string]||'#3B82F6' }} />
                    <div className="flex-1 min-w-0">
                      <div style={{ fontFamily:'var(--font-body)', fontSize:13, color:'#F0F4F8', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{event.title as string}</div>
                      {!event.allDay && <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6880', marginTop:1 }}>{new Date(event.start as string).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        }
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#3B82F633,#3B82F688,#3B82F633)', borderRadius:'0 0 16px 16px' }} />
    </div>
  )
}

// ── Summary ────────────────────────────────────────────────────────
type Tab = 'wins'|'progress'|'next'
const TABS = [{key:'wins' as Tab,label:'Wins',color:'#10B981'},{key:'progress' as Tab,label:'In Progress',color:'#F59E0B'},{key:'next' as Tab,label:'Next Steps',color:'#8B5CF6'}]
function SummaryWidget() {
  const { data } = useSWR('/api/summary', fetcher, { refreshInterval: 3_600_000 })
  const [tab, setTab] = useState<Tab>('wins')
  const summary = data?.summary || {}
  const listMap: Record<Tab,string[]> = { wins:summary.accomplishments||[], progress:summary.in_progress||[], next:summary.next_steps||[] }
  const activeColor = TABS.find(t=>t.key===tab)?.color||'#10B981'
  return (
    <div className="card noise p-6 h-full flex flex-col gap-4" style={{ boxShadow:`0 0 30px ${activeColor}14` }}>
      <div className="flex items-center justify-between">
        <span className="widget-label">Weekly Summary</span>
        <span className="widget-label" style={{ color:activeColor }}>{summary.week_label||''}</span>
      </div>
      {!data ? <div className="shimmer h-5 rounded" style={{ width:'80%',opacity:0.3 }} /> :
        <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(0.8rem,1.1vw,1rem)', fontWeight:600, color:'#F0F4F8', lineHeight:1.4, paddingBottom:12, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>{summary.headline}</div>
      }
      <div className="flex gap-1">
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)} style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer', background:tab===t.key?`${t.color}22`:'transparent', color:tab===t.key?t.color:'#4A5568', transition:'all 0.2s ease' }}>{t.label}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ scrollbarWidth:'none' }}>
        {!data ? [70,85,65,90].map((w,i)=><div key={i} className="shimmer h-4 rounded" style={{ width:`${w}%`,opacity:0.3 }} />) :
          listMap[tab].map((item,i) => (
            <div key={i} className="flex items-start gap-2">
              <div style={{ width:5, height:5, borderRadius:'50%', background:activeColor, flexShrink:0, marginTop:6, boxShadow:`0 0 6px ${activeColor}` }} />
              <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#8B98A8', lineHeight:1.6 }}>{item}</span>
            </div>
          ))
        }
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${activeColor}33,${activeColor}88,${activeColor}33)`, borderRadius:'0 0 16px 16px', transition:'background 0.3s ease' }} />
    </div>
  )
}

// ── News ───────────────────────────────────────────────────────────
function NewsWidget() {
  const { data } = useSWR('/api/news', fetcher, { refreshInterval: 600_000 })
  const articles: Record<string,string>[] = data?.articles || []
  const timeAgo = (iso: string) => { if(!iso) return ''; const d=Date.now()-new Date(iso).getTime(),m=Math.floor(d/60000); return m<60?`${m}m ago`:m<1440?`${Math.floor(m/60)}h ago`:`${Math.floor(m/1440)}d ago` }
  return (
    <div className="card noise p-6 h-full flex flex-col gap-4" style={{ boxShadow:'0 0 30px rgba(139,92,246,0.08)' }}>
      <div className="flex items-center justify-between"><span className="widget-label">News Feed</span><div className="live-dot" /></div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-1" style={{ scrollbarWidth:'none' }}>
        {!data ? [85,70,90,75,80,65].map((w,i)=><div key={i} className="shimmer h-10 rounded-lg mb-1" style={{ width:`${w}%`,opacity:0.3 }} />) :
          articles.slice(0,12).map((article,i) => (
            <a key={i} href={article.link} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1 rounded-lg px-3 py-2" style={{ textDecoration:'none' }}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.04)')}
              onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
              <div style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#D1D9E0', fontWeight:500, lineHeight:1.4 }}>{article.title}</div>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#8B5CF6' }}>{article.source?.split(' ')[0]}</span>
                <span style={{ fontSize:9, color:'#4A5568' }}>· {timeAgo(article.pubDate)}</span>
              </div>
            </a>
          ))
        }
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#8B5CF633,#8B5CF688,#8B5CF633)', borderRadius:'0 0 16px 16px' }} />
    </div>
  )
}

// ── Sports ─────────────────────────────────────────────────────────
type Game = { league:string; status:string; state:'pre'|'in'|'post'; home:{abbr:string;score:string}; away:{abbr:string;score:string} }
const LEAGUE_COLOR: Record<string,string> = {NBA:'#F59E0B',NFL:'#3B82F6',MLB:'#10B981',NHL:'#8B5CF6',MLS:'#06B6D4'}
function SportsWidget() {
  const { data } = useSWR('/api/sports', fetcher, { refreshInterval: 120_000 })
  const games: Game[] = data?.games || []
  return (
    <div className="card noise p-6 h-full flex flex-col gap-3" style={{ boxShadow:'0 0 30px rgba(245,158,11,0.08)' }}>
      <div className="flex items-center justify-between"><span className="widget-label">Scores · Live</span><div className="live-dot" /></div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ scrollbarWidth:'none' }}>
        {!data ? [1,2,3,4].map(i=><div key={i} className="shimmer h-12 rounded-lg" style={{ opacity:0.3 }} />) :
          games.length===0 ? <div style={{ color:'#4A5568',fontSize:12,marginTop:8 }}>No games today</div> :
          games.map((game,i) => (
            <div key={i} className="rounded-lg px-3 py-2 flex items-center gap-3" style={{ background:'rgba(255,255,255,0.04)' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', color:LEAGUE_COLOR[game.league]||'#5A6880', width:28, flexShrink:0 }}>{game.league}</div>
              <div className="flex-1 flex flex-col gap-0.5">
                <div className="flex justify-between">
                  <span style={{ fontFamily:'var(--font-display)', fontSize:12, fontWeight:700, color:'#F0F4F8' }}>{game.away.abbr}</span>
                  {game.state!=='pre' && <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#F0F4F8' }}>{game.away.score}</span>}
                </div>
                <div className="flex justify-between">
                  <span style={{ fontFamily:'var(--font-display)', fontSize:12, fontWeight:700, color:'#8B98A8' }}>{game.home.abbr}</span>
                  {game.state!=='pre' && <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#8B98A8' }}>{game.home.score}</span>}
                </div>
              </div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:game.state==='in'?'#10B981':'#5A6880', textAlign:'right', maxWidth:60, lineHeight:1.3 }}>{game.status}</div>
            </div>
          ))
        }
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#F59E0B33,#F59E0B88,#F59E0B33)', borderRadius:'0 0 16px 16px' }} />
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────
export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div style={{ background:'#080C12', width:'100vw', height:'100vh' }} />

  return (
    <div style={{ width:'100vw', height:'100vh', background:'#080C12', display:'grid', padding:'20px', gap:'14px', gridTemplateColumns:'280px 1fr 1fr 260px', gridTemplateRows:'180px 1fr 200px', overflow:'hidden', position:'relative' }}>
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, background:'radial-gradient(ellipse 60% 40% at 15% 20%,rgba(0,212,255,0.04) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 85% 80%,rgba(139,92,246,0.05) 0%,transparent 70%)' }} />

      {/* Row 1 */}
      <div style={{ gridColumn:'1 / -1', gridRow:'1', display:'grid', gridTemplateColumns:'280px 1fr 1fr 260px', gap:'14px', zIndex:1 }}>
        <div style={{ animation:'slideUp 0.5s ease 0s both' }}><ClockWidget /></div>
        <div style={{ gridColumn:'span 2', animation:'slideUp 0.5s ease 0.05s both' }}><WeatherWidget /></div>
        <div style={{ animation:'slideUp 0.5s ease 0.1s both' }}><StocksWidget /></div>
      </div>

      {/* Row 2 */}
      <div style={{ gridColumn:1, gridRow:2, zIndex:1, animation:'slideUp 0.5s ease 0.15s both' }}><CalendarWidget /></div>
      <div style={{ gridColumn:'2 / 4', gridRow:2, zIndex:1, animation:'slideUp 0.5s ease 0.2s both' }}><SummaryWidget /></div>
      <div style={{ gridColumn:4, gridRow:2, zIndex:1, animation:'slideUp 0.5s ease 0.25s both' }}><NewsWidget /></div>

      {/* Row 3 */}
      <div style={{ gridColumn:'1 / 4', gridRow:3, zIndex:1, animation:'slideUp 0.5s ease 0.3s both' }}><SportsWidget /></div>
      <div style={{ gridColumn:4, gridRow:3, zIndex:1, animation:'slideUp 0.5s ease 0.35s both' }}>
        <div className="card noise p-4 h-full flex flex-col justify-between" style={{ boxShadow:'0 0 20px rgba(59,130,246,0.06)' }}>
          <span className="widget-label">Quick Links</span>
          <div className="flex flex-col gap-2">
            {[{label:'Gmail',url:'https://mail.google.com',color:'#EF4444'},{label:'Google Calendar',url:'https://calendar.google.com',color:'#3B82F6'},{label:'GitHub',url:'https://github.com',color:'#F0F4F8'},{label:'Vercel',url:'https://vercel.com',color:'#F0F4F8'}].map(link => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ textDecoration:'none', background:'rgba(255,255,255,0.04)' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:link.color, flexShrink:0 }} />
                <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#8B98A8' }}>{link.label}</span>
              </a>
            ))}
          </div>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#3B82F633,#3B82F688,#3B82F633)', borderRadius:'0 0 16px 16px' }} />
        </div>
      </div>
    </div>
  )
}
