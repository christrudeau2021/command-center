'use client'
import { useState, useEffect } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

// ── Settings helpers ───────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  city: 'Woodstock, GA',
  lat: '34.1015',
  lon: '-84.5194',
  tickers: 'SPY,QQQ,AAPL,MSFT,NVDA,BTC-USD',
  leagues: 'nba,mlb,nfl',
  rssFeeds: 'https://feeds.bbci.co.uk/news/world/rss.xml,https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
  background: 'default',
  accentColor: '#00D4FF',
  widgets: 'clock,weather,stocks,calendar,summary,news,sports,links',
}
type Settings = typeof DEFAULT_SETTINGS

function useSettings(): [Settings, (s: Settings) => void] {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dashboard-settings')
      if (saved) setSettingsState({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) })
    } catch {}
  }, [])
  const setSettings = (s: Settings) => {
    setSettingsState(s)
    try { localStorage.setItem('dashboard-settings', JSON.stringify(s)) } catch {}
  }
  return [settings, setSettings]
}

// ── Background options ─────────────────────────────────────────────
const BACKGROUNDS: Record<string, string> = {
  default:  '#080C12',
  midnight: '#050508',
  navy:     '#060B18',
  forest:   '#060E0A',
  graphite: '#0A0A0A',
}

const BG_GRADIENTS: Record<string, string> = {
  default:  'radial-gradient(ellipse 60% 40% at 15% 20%,rgba(0,212,255,0.05) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 85% 80%,rgba(139,92,246,0.06) 0%,transparent 70%)',
  midnight: 'radial-gradient(ellipse 60% 40% at 20% 20%,rgba(139,92,246,0.07) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 80% 80%,rgba(59,130,246,0.05) 0%,transparent 70%)',
  navy:     'radial-gradient(ellipse 60% 40% at 10% 30%,rgba(59,130,246,0.07) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 90% 70%,rgba(0,212,255,0.04) 0%,transparent 70%)',
  forest:   'radial-gradient(ellipse 60% 40% at 20% 20%,rgba(16,185,129,0.06) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 80% 80%,rgba(6,182,212,0.04) 0%,transparent 70%)',
  graphite: 'radial-gradient(ellipse 60% 40% at 15% 20%,rgba(255,255,255,0.03) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 85% 80%,rgba(255,255,255,0.02) 0%,transparent 70%)',
}

// ── Clock ──────────────────────────────────────────────────────────
function ClockWidget({ accent }: { accent: string }) {
  const [time, setTime] = useState({ h:'12', m:'00', s:'00', ap:'AM', day:'', date:'' })
  useEffect(() => {
    const update = () => {
      const n = new Date(), h = n.getHours(), m = n.getMinutes(), s = n.getSeconds()
      const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      setTime({ h:String(h%12||12).padStart(2,'0'), m:String(m).padStart(2,'0'), s:String(s).padStart(2,'0'), ap:h>=12?'PM':'AM', day:DAYS[n.getDay()], date:`${MONTHS[n.getMonth()]} ${n.getDate()}, ${n.getFullYear()}` })
    }
    update(); const t = setInterval(update,1000); return () => clearInterval(t)
  }, [])
  return (
    <div className="card noise flex flex-col justify-between p-5 h-full" style={{ boxShadow:`0 0 30px ${accent}14` }}>
      <span className="widget-label">Local Time</span>
      <div style={{ display:'flex', alignItems:'flex-end', gap:6 }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:64, fontWeight:800, color:'#F0F4F8', letterSpacing:'-0.04em', lineHeight:1 }}>{time.h}:{time.m}</span>
        <div style={{ display:'flex', flexDirection:'column', marginBottom:8, gap:3 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:accent, letterSpacing:'.1em' }}>{time.ap}</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#4A5568' }}>:{time.s}</span>
        </div>
      </div>
      <div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:600, color:'#8B98A8' }}>{time.day}</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#4A5568', marginTop:2 }}>{time.date}</div>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${accent}33,${accent}99,${accent}33)`, borderRadius:'0 0 12px 12px' }} />
    </div>
  )
}

// ── Weather ────────────────────────────────────────────────────────
function WeatherWidget() {
  const { data } = useSWR('/api/weather', fetcher, { refreshInterval:900_000 })
  const w = data || {}
  if (!data) return (
    <div className="card noise p-5 h-full flex flex-col gap-3">
      <span className="widget-label">Weather</span>
      {[80,60,90,70].map((w,i) => <div key={i} className="shimmer rounded h-4" style={{ width:`${w}%`, opacity:0.3 }} />)}
    </div>
  )
  return (
    <div className="card noise p-5 h-full" style={{ display:'grid', gridTemplateRows:'auto 1fr auto auto', gap:10, boxShadow:'0 0 30px rgba(245,158,11,0.07)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span className="widget-label">Weather · {w.city}</span>
        <div className="live-dot" />
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <span style={{ fontSize:40 }}>{w.icon}</span>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:52, fontWeight:800, color:'#F0F4F8', lineHeight:1, letterSpacing:'-0.03em' }}>{w.temp}°</div>
          <div style={{ fontSize:12, color:'#8B98A8', marginTop:3 }}>{w.condition} · Feels {w.feels_like}°</div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:24 }}>
          {[{label:'Humidity',val:`${w.humidity}%`},{label:'Wind',val:`${w.wind} mph`}].map(s => (
            <div key={s.label}>
              <div className="widget-label" style={{ marginBottom:3 }}>{s.label}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:14, color:'#F0F4F8' }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }} />
      <div style={{ display:'flex', gap:8 }}>
        {(w.forecast||[]).slice(0,5).map((day: Record<string,unknown>,i:number) => (
          <div key={i} style={{ flex:1, background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'6px 4px', textAlign:'center' }}>
            <div className="widget-label">{i===0?'Today':new Date((day.date as string)+'T12:00:00').toLocaleDateString('en-US',{weekday:'short'})}</div>
            <div style={{ fontSize:18, margin:'4px 0' }}>{day.icon as string}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#F0F4F8' }}>{day.high as number}°</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#4A5568' }}>{day.low as number}°</div>
          </div>
        ))}
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#F59E0B33,#F59E0B99,#F59E0B33)', borderRadius:'0 0 12px 12px' }} />
    </div>
  )
}

// ── Stocks ─────────────────────────────────────────────────────────
function StocksWidget() {
  const { data } = useSWR('/api/stocks', fetcher, { refreshInterval:300_000 })
  const [timeStr, setTimeStr] = useState('')
  useEffect(() => { const u=()=>setTimeStr(new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})); u(); const t=setInterval(u,60_000); return()=>clearInterval(t) }, [])
  const stocks:{symbol:string;name:string;price:number;change:number;pct:number}[] = data?.stocks||[]
  return (
    <div className="card noise p-5 h-full flex flex-col gap-3" style={{ boxShadow:'0 0 30px rgba(16,185,129,0.07)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span className="widget-label">Markets</span>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}><div className="live-dot" /><span className="widget-label">{timeStr}</span></div>
      </div>
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:5, scrollbarWidth:'none' }}>
        {!data ? [1,2,3,4,5,6].map(i=><div key={i} className="shimmer h-9 rounded-lg" style={{ opacity:0.3 }} />) :
          stocks.map((s,i) => { const up=s.change>=0; const color=up?'#10B981':'#EF4444'; return (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 8px', borderRadius:7, background:'rgba(255,255,255,0.04)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <div style={{ width:3, height:26, borderRadius:2, background:color, flexShrink:0 }} />
                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:12, fontWeight:700, color:'#F0F4F8' }}>{s.symbol}</div>
                  <div style={{ fontSize:9, color:'#5A6880', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#F0F4F8' }}>${s.price.toLocaleString()}</div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color }}>{up?'▲':'▼'} {Math.abs(s.pct).toFixed(2)}%</div>
              </div>
            </div>
          )})
        }
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#10B98133,#10B98188,#10B98133)', borderRadius:'0 0 12px 12px' }} />
    </div>
  )
}

// ── Calendar ───────────────────────────────────────────────────────
const COLOR_MAP: Record<string,string> = {'1':'#3B82F6','2':'#10B981','3':'#8B5CF6','4':'#F59E0B','5':'#EF4444','6':'#06B6D4','7':'#EC4899','8':'#F97316'}
function CalendarWidget() {
  const { data } = useSWR('/api/calendar', fetcher, { refreshInterval:300_000 })
  const events: Record<string,unknown>[] = Array.isArray(data?.events) ? data.events : []
  const groups: {label:string;events:Record<string,unknown>[]}[] = []
  const seen = new Set<string>()
  events.forEach(e => {
    const iso = e.start as string
    const d = new Date(iso.includes('T')?iso:iso+'T12:00:00')
    const diff = Math.floor((d.getTime()-Date.now())/86400000)
    if (diff<0) return
    const label = diff===0?'Today':diff===1?'Tomorrow':d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})
    if (!seen.has(label)){seen.add(label);groups.push({label,events:[]})}
    groups[groups.length-1].events.push(e)
  })
  return (
    <div className="card noise p-5 h-full flex flex-col gap-3" style={{ boxShadow:'0 0 30px rgba(59,130,246,0.07)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span className="widget-label">Upcoming · Calendar</span>
        {data?.demo && <span className="widget-label" style={{ color:'#3B82F6' }}>demo</span>}
      </div>
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12, scrollbarWidth:'none' }}>
        {!data ? [1,2,3,4].map(i=><div key={i} className="shimmer h-10 rounded-lg" style={{ opacity:0.3 }} />) :
          groups.length===0 ? <div style={{ color:'#4A5568', fontSize:13 }}>No upcoming events</div> :
          groups.slice(0,5).map(group => (
            <div key={group.label}>
              <div className="widget-label" style={{ color:'#3B82F6', marginBottom:5 }}>{group.label}</div>
              {group.events.map(event => (
                <div key={event.id as string} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 8px', borderRadius:7, background:'rgba(255,255,255,0.04)', marginBottom:4 }}>
                  <div style={{ width:3, height:30, borderRadius:2, flexShrink:0, background:COLOR_MAP[event.color as string]||'#3B82F6' }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, color:'#F0F4F8', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{event.title as string}</div>
                    {!event.allDay && <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#5A6880', marginTop:1 }}>{new Date(event.start as string).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true})}</div>}
                  </div>
                </div>
              ))}
            </div>
          ))
        }
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#3B82F633,#3B82F688,#3B82F633)', borderRadius:'0 0 12px 12px' }} />
    </div>
  )
}

// ── Summary ────────────────────────────────────────────────────────
type Tab='wins'|'progress'|'next'
const TABS=[{key:'wins' as Tab,label:'Wins',color:'#10B981'},{key:'progress' as Tab,label:'In Progress',color:'#F59E0B'},{key:'next' as Tab,label:'Next Steps',color:'#8B5CF6'}]
function SummaryWidget() {
  const { data } = useSWR('/api/summary', fetcher, { refreshInterval:3_600_000 })
  const [tab,setTab] = useState<Tab>('wins')
  const summary = data?.summary||{}
  const listMap: Record<Tab,string[]> = {wins:summary.accomplishments||[],progress:summary.in_progress||[],next:summary.next_steps||[]}
  const activeColor = TABS.find(t=>t.key===tab)?.color||'#10B981'
  return (
    <div className="card noise p-5 h-full flex flex-col gap-3" style={{ boxShadow:`0 0 30px ${activeColor}14` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span className="widget-label">Weekly Summary</span>
        <span className="widget-label" style={{ color:activeColor }}>{summary.week_label||''}</span>
      </div>
      {!data ? <div className="shimmer h-5 rounded" style={{ width:'80%',opacity:0.3 }} /> :
        <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:600, color:'#F0F4F8', lineHeight:1.45, paddingBottom:10, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>{summary.headline}</div>
      }
      <div style={{ display:'flex', gap:4 }}>
        {TABS.map(t => <button key={t.key} onClick={()=>setTab(t.key)} style={{ fontFamily:'var(--font-mono)', fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer', background:tab===t.key?`${t.color}22`:'transparent', color:tab===t.key?t.color:'#4A5568', transition:'all 0.2s' }}>{t.label}</button>)}
      </div>
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8, scrollbarWidth:'none' }}>
        {!data ? [70,85,65,90].map((w,i)=><div key={i} className="shimmer h-4 rounded" style={{ width:`${w}%`,opacity:0.3 }} />) :
          listMap[tab].map((item,i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:activeColor, flexShrink:0, marginTop:6, boxShadow:`0 0 6px ${activeColor}` }} />
              <span style={{ fontSize:13, color:'#8B98A8', lineHeight:1.55 }}>{item}</span>
            </div>
          ))
        }
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${activeColor}33,${activeColor}88,${activeColor}33)`, borderRadius:'0 0 12px 12px', transition:'background 0.3s' }} />
    </div>
  )
}

// ── News ───────────────────────────────────────────────────────────
function NewsWidget() {
  const { data } = useSWR('/api/news', fetcher, { refreshInterval:600_000 })
  const articles: Record<string,string>[] = data?.articles||[]
  const timeAgo=(iso:string)=>{ if(!iso)return''; const d=Date.now()-new Date(iso).getTime(),m=Math.floor(d/60000); return m<60?`${m}m`:m<1440?`${Math.floor(m/60)}h`:`${Math.floor(m/1440)}d` }
  return (
    <div className="card noise p-5 h-full flex flex-col gap-3" style={{ boxShadow:'0 0 30px rgba(139,92,246,0.07)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}><span className="widget-label">News Feed</span><div className="live-dot" /></div>
      <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:2, scrollbarWidth:'none' }}>
        {!data ? [85,70,90,75,80].map((w,i)=><div key={i} className="shimmer h-10 rounded-lg mb-1" style={{ width:`${w}%`,opacity:0.3 }} />) :
          articles.slice(0,14).map((article,i) => (
            <a key={i} href={article.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', padding:'5px 6px', borderRadius:6, display:'block' }}
              onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.04)')}
              onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
              <div style={{ fontSize:12, color:'#D1D9E0', fontWeight:500, lineHeight:1.4 }}>{article.title}</div>
              <div style={{ display:'flex', gap:6, marginTop:2 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#8B5CF6' }}>{article.source?.split(' ')[0]}</span>
                <span style={{ fontSize:9, color:'#4A5568' }}>· {timeAgo(article.pubDate)} ago</span>
              </div>
            </a>
          ))
        }
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#8B5CF633,#8B5CF688,#8B5CF633)', borderRadius:'0 0 12px 12px' }} />
    </div>
  )
}

// ── Sports ─────────────────────────────────────────────────────────
type Game={league:string;status:string;state:'pre'|'in'|'post';home:{abbr:string;score:string};away:{abbr:string;score:string}}
const LEAGUE_COLOR: Record<string,string>={NBA:'#F59E0B',NFL:'#3B82F6',MLB:'#10B981',NHL:'#8B5CF6',MLS:'#06B6D4'}
function SportsWidget() {
  const { data } = useSWR('/api/sports', fetcher, { refreshInterval:120_000 })
  const games:Game[] = data?.games||[]
  return (
    <div className="card noise p-5 h-full flex flex-col gap-3" style={{ boxShadow:'0 0 30px rgba(245,158,11,0.07)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}><span className="widget-label">Scores · Live</span><div className="live-dot" /></div>
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:6, alignContent:'start', overflowY:'auto', scrollbarWidth:'none' }}>
        {!data ? [1,2,3,4,5,6].map(i=><div key={i} className="shimmer h-16 rounded-lg" style={{ opacity:0.3 }} />) :
          games.length===0 ? <div style={{ color:'#4A5568',fontSize:12,gridColumn:'1/-1' }}>No games today</div> :
          games.slice(0,9).map((game,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'7px 10px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:8, letterSpacing:'0.1em', color:LEAGUE_COLOR[game.league]||'#5A6880' }}>{game.league}</span>
                {game.state==='in' && <span style={{ width:5,height:5,borderRadius:'50%',background:'#10B981',boxShadow:'0 0 5px #10B981',display:'inline-block' }} />}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color:'#F0F4F8' }}>{game.away.abbr}</span>
                {game.state!=='pre'&&<span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#F0F4F8' }}>{game.away.score}</span>}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:700, color:'#8B98A8' }}>{game.home.abbr}</span>
                {game.state!=='pre'&&<span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#8B98A8' }}>{game.home.score}</span>}
              </div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:game.state==='in'?'#10B981':'#5A6880' }}>{game.status}</div>
            </div>
          ))
        }
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#F59E0B33,#F59E0B88,#F59E0B33)', borderRadius:'0 0 12px 12px' }} />
    </div>
  )
}

// ── Settings Panel ─────────────────────────────────────────────────
const RSS_PRESETS = [
  { label:'BBC World',   url:'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { label:'BBC Tech',    url:'https://feeds.bbci.co.uk/news/technology/rss.xml' },
  { label:'NYT Tech',    url:'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml' },
  { label:'NYT World',   url:'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' },
  { label:'WSJ Markets', url:'https://feeds.a.dj.com/rss/RSSMarketsMain.xml' },
  { label:'TechCrunch',  url:'https://techcrunch.com/feed/' },
  { label:'The Verge',   url:'https://www.theverge.com/rss/index.xml' },
  { label:'Reuters',     url:'https://feeds.reuters.com/reuters/topNews' },
  { label:'ESPN',        url:'https://www.espn.com/espn/rss/news' },
  { label:'Ars Technica',url:'https://feeds.arstechnica.com/arstechnica/index' },
]
const BG_OPTIONS = [
  { key:'default',  label:'Deep Space',  color:'#080C12' },
  { key:'midnight', label:'Midnight',    color:'#050508' },
  { key:'navy',     label:'Navy',        color:'#060B18' },
  { key:'forest',   label:'Forest',      color:'#060E0A' },
  { key:'graphite', label:'Graphite',    color:'#0A0A0A' },
]
const ACCENT_OPTIONS = [
  { label:'Cyan',   color:'#00D4FF' },
  { label:'Blue',   color:'#3B82F6' },
  { label:'Green',  color:'#10B981' },
  { label:'Purple', color:'#8B5CF6' },
  { label:'Amber',  color:'#F59E0B' },
  { label:'Pink',   color:'#EC4899' },
]
const LEAGUE_OPTIONS = ['nba','nfl','mlb','nhl','ncaaf','ncaab','mls']

function SettingsPanel({ settings, onSave, onClose }: { settings:Settings; onSave:(s:Settings)=>void; onClose:()=>void }) {
  const [draft, setDraft] = useState<Settings>({...settings})
  const [activeTab, setActiveTab] = useState<'location'|'feeds'|'appearance'|'sports'>('location')
  const set = (k: keyof Settings, v: string) => setDraft(d=>({...d,[k]:v}))

  const selectedFeeds = draft.rssFeeds ? draft.rssFeeds.split(',').filter(Boolean) : []
  const toggleFeed = (url: string) => {
    const feeds = selectedFeeds.includes(url) ? selectedFeeds.filter(f=>f!==url) : [...selectedFeeds, url]
    set('rssFeeds', feeds.join(','))
  }
  const selectedLeagues = draft.leagues ? draft.leagues.split(',').filter(Boolean) : []
  const toggleLeague = (l: string) => {
    const leagues = selectedLeagues.includes(l) ? selectedLeagues.filter(x=>x!==l) : [...selectedLeagues,l]
    set('leagues', leagues.join(','))
  }

  const TABS_S = [{key:'location' as const,label:'📍 Location'},{key:'feeds' as const,label:'📰 News'},{key:'appearance' as const,label:'🎨 Appearance'},{key:'sports' as const,label:'🏈 Sports'}]

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#131920', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, width:560, maxHeight:'80vh', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 0 60px rgba(0,0,0,0.8)' }}>

        {/* Header */}
        <div style={{ padding:'20px 24px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'#F0F4F8' }}>Dashboard Settings</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#4A5568', marginTop:2 }}>Customize your command center</div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.07)', border:'none', borderRadius:8, color:'#8B98A8', cursor:'pointer', width:32, height:32, fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>
          <div style={{ display:'flex', gap:4, paddingBottom:0 }}>
            {TABS_S.map(t => (
              <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{ fontFamily:'var(--font-mono)', fontSize:10, letterSpacing:'0.08em', padding:'7px 14px', borderRadius:'8px 8px 0 0', border:'none', cursor:'pointer', background:activeTab===t.key?'#1C2535':'transparent', color:activeTab===t.key?'#F0F4F8':'#5A6880', transition:'all 0.2s', borderBottom:activeTab===t.key?'2px solid #3B82F6':'2px solid transparent' }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:24, scrollbarWidth:'none' }}>

          {activeTab==='location' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <div className="widget-label" style={{ marginBottom:8 }}>City Display Name</div>
                <input value={draft.city} onChange={e=>set('city',e.target.value)} placeholder="e.g. Woodstock, GA" style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 12px', color:'#F0F4F8', fontSize:14, outline:'none', fontFamily:'var(--font-body)' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <div className="widget-label" style={{ marginBottom:8 }}>Latitude</div>
                  <input value={draft.lat} onChange={e=>set('lat',e.target.value)} placeholder="34.1015" style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 12px', color:'#F0F4F8', fontSize:14, outline:'none', fontFamily:'var(--font-mono)' }} />
                </div>
                <div>
                  <div className="widget-label" style={{ marginBottom:8 }}>Longitude</div>
                  <input value={draft.lon} onChange={e=>set('lon',e.target.value)} placeholder="-84.5194" style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 12px', color:'#F0F4F8', fontSize:14, outline:'none', fontFamily:'var(--font-mono)' }} />
                </div>
              </div>
              <div style={{ background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:8, padding:12 }}>
                <div style={{ fontSize:11, color:'#8B98A8', lineHeight:1.6 }}>
                  💡 Find your coordinates at <a href="https://latlong.net" target="_blank" rel="noopener noreferrer" style={{ color:'#3B82F6' }}>latlong.net</a> — search your city and copy the lat/lon values. Weather updates automatically every 15 minutes.
                </div>
              </div>
              <div>
                <div className="widget-label" style={{ marginBottom:8 }}>Stock Tickers</div>
                <input value={draft.tickers} onChange={e=>set('tickers',e.target.value)} placeholder="SPY,QQQ,AAPL,MSFT,NVDA" style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 12px', color:'#F0F4F8', fontSize:13, outline:'none', fontFamily:'var(--font-mono)' }} />
                <div style={{ fontSize:10, color:'#4A5568', marginTop:5 }}>Comma-separated. Use Yahoo Finance symbols (e.g. BTC-USD for Bitcoin)</div>
              </div>
            </div>
          )}

          {activeTab==='feeds' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ fontSize:12, color:'#8B98A8' }}>Select your preferred news sources. Toggle any on or off.</div>
              {RSS_PRESETS.map(preset => {
                const on = selectedFeeds.includes(preset.url)
                return (
                  <div key={preset.url} onClick={()=>toggleFeed(preset.url)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderRadius:8, background:on?'rgba(139,92,246,0.1)':'rgba(255,255,255,0.04)', border:`1px solid ${on?'rgba(139,92,246,0.3)':'rgba(255,255,255,0.07)'}`, cursor:'pointer', transition:'all 0.2s' }}>
                    <span style={{ fontSize:13, color:on?'#F0F4F8':'#8B98A8' }}>{preset.label}</span>
                    <div style={{ width:20, height:20, borderRadius:10, background:on?'#8B5CF6':'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>
                      {on && <span style={{ color:'white', fontSize:11 }}>✓</span>}
                    </div>
                  </div>
                )
              })}
              <div>
                <div className="widget-label" style={{ marginBottom:6 }}>Custom RSS Feed URL</div>
                <input placeholder="https://example.com/rss" onKeyDown={e=>{ if(e.key==='Enter'){ const v=(e.target as HTMLInputElement).value.trim(); if(v){toggleFeed(v);(e.target as HTMLInputElement).value=''} }}} style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'10px 12px', color:'#F0F4F8', fontSize:13, outline:'none', fontFamily:'var(--font-mono)' }} />
                <div style={{ fontSize:10, color:'#4A5568', marginTop:4 }}>Press Enter to add a custom feed URL</div>
              </div>
            </div>
          )}

          {activeTab==='appearance' && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div>
                <div className="widget-label" style={{ marginBottom:10 }}>Background Theme</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8 }}>
                  {BG_OPTIONS.map(bg => (
                    <div key={bg.key} onClick={()=>set('background',bg.key)} style={{ cursor:'pointer', borderRadius:10, overflow:'hidden', border:`2px solid ${draft.background===bg.key?'#3B82F6':'rgba(255,255,255,0.08)'}`, transition:'all 0.2s' }}>
                      <div style={{ height:44, background:bg.color }} />
                      <div style={{ padding:'5px 0', textAlign:'center', background:'rgba(255,255,255,0.04)' }}>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:8, color:draft.background===bg.key?'#3B82F6':'#8B98A8', letterSpacing:'0.08em' }}>{bg.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="widget-label" style={{ marginBottom:10 }}>Accent Color</div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {ACCENT_OPTIONS.map(ac => (
                    <div key={ac.color} onClick={()=>set('accentColor',ac.color)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer' }}>
                      <div style={{ width:36, height:36, borderRadius:'50%', background:ac.color, border:`3px solid ${draft.accentColor===ac.color?'white':'transparent'}`, boxShadow:draft.accentColor===ac.color?`0 0 14px ${ac.color}`:'none', transition:'all 0.2s' }} />
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'#5A6880' }}>{ac.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:10, padding:14 }}>
                <div className="widget-label" style={{ marginBottom:6 }}>Preview</div>
                <div style={{ height:32, borderRadius:8, background:BACKGROUNDS[draft.background]||'#080C12', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', paddingLeft:12, gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:draft.accentColor, boxShadow:`0 0 8px ${draft.accentColor}` }} />
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:draft.accentColor }}>Command Center</span>
                </div>
              </div>
            </div>
          )}

          {activeTab==='sports' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ fontSize:12, color:'#8B98A8', marginBottom:4 }}>Select leagues to show in the scores widget.</div>
              {LEAGUE_OPTIONS.map(l => {
                const on = selectedLeagues.includes(l)
                const labels: Record<string,string> = {nba:'🏀 NBA',nfl:'🏈 NFL',mlb:'⚾ MLB',nhl:'🏒 NHL',ncaaf:'🏈 NCAA Football',ncaab:'🏀 NCAA Basketball',mls:'⚽ MLS'}
                return (
                  <div key={l} onClick={()=>toggleLeague(l)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderRadius:8, background:on?'rgba(245,158,11,0.1)':'rgba(255,255,255,0.04)', border:`1px solid ${on?'rgba(245,158,11,0.3)':'rgba(255,255,255,0.07)'}`, cursor:'pointer', transition:'all 0.2s' }}>
                    <span style={{ fontSize:13, color:on?'#F0F4F8':'#8B98A8' }}>{labels[l]||l.toUpperCase()}</span>
                    <div style={{ width:20, height:20, borderRadius:10, background:on?'#F59E0B':'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      {on && <span style={{ color:'white', fontSize:11 }}>✓</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'flex-end', gap:10 }}>
          <button onClick={onClose} style={{ padding:'9px 20px', borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'#8B98A8', cursor:'pointer', fontSize:13, fontFamily:'var(--font-body)' }}>Cancel</button>
          <button onClick={()=>{onSave(draft);onClose()}} style={{ padding:'9px 20px', borderRadius:8, border:'none', background:'#3B82F6', color:'white', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'var(--font-body)', boxShadow:'0 0 20px rgba(59,130,246,0.3)' }}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────
export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useSettings()
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div style={{ background:'#080C12', width:'100vw', height:'100vh' }} />

  const bg = BACKGROUNDS[settings.background] || '#080C12'
  const gradient = BG_GRADIENTS[settings.background] || BG_GRADIENTS.default

  return (
    <div style={{ width:'100vw', height:'100vh', background:bg, overflow:'hidden', position:'relative' }}>

      {/* Ambient background */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, background:gradient }} />

      {/* Settings button */}
      <button onClick={()=>setShowSettings(true)} style={{ position:'fixed', top:14, right:14, zIndex:50, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#8B98A8', cursor:'pointer', width:36, height:36, fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', transition:'all 0.2s' }}
        onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.12)')}
        onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.07)')}>
        ⚙️
      </button>

      {/* Grid */}
      <div style={{ position:'relative', zIndex:1, width:'100%', height:'100%', display:'grid', padding:'16px', gap:'12px', gridTemplateColumns:'240px 1fr 1fr 220px', gridTemplateRows:'160px 1fr 175px' }}>

        {/* Row 1 */}
        <div style={{ animation:'slideUp 0.4s ease 0s both' }}><ClockWidget accent={settings.accentColor} /></div>
        <div style={{ gridColumn:'span 2', animation:'slideUp 0.4s ease 0.05s both' }}><WeatherWidget /></div>
        <div style={{ animation:'slideUp 0.4s ease 0.1s both' }}><StocksWidget /></div>

        {/* Row 2 */}
        <div style={{ animation:'slideUp 0.4s ease 0.15s both' }}><CalendarWidget /></div>
        <div style={{ gridColumn:'span 2', animation:'slideUp 0.4s ease 0.2s both' }}><SummaryWidget /></div>
        <div style={{ animation:'slideUp 0.4s ease 0.25s both' }}><NewsWidget /></div>

        {/* Row 3 */}
        <div style={{ gridColumn:'span 3', animation:'slideUp 0.4s ease 0.3s both' }}><SportsWidget /></div>
        <div style={{ animation:'slideUp 0.4s ease 0.35s both' }}>
          <div className="card noise p-4 h-full flex flex-col justify-between" style={{ boxShadow:'0 0 20px rgba(59,130,246,0.06)' }}>
            <span className="widget-label">Quick Links</span>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[{label:'Gmail',url:'https://mail.google.com',color:'#EF4444'},{label:'Google Calendar',url:'https://calendar.google.com',color:'#3B82F6'},{label:'GitHub',url:'https://github.com',color:'#F0F4F8'},{label:'Vercel',url:'https://vercel.com',color:'#8B5CF6'}].map(link => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 8px', borderRadius:7, textDecoration:'none', background:'rgba(255,255,255,0.04)', transition:'background 0.15s' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.08)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.04)')}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:link.color, flexShrink:0 }} />
                  <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'#8B98A8' }}>{link.label}</span>
                </a>
              ))}
            </div>
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${settings.accentColor}33,${settings.accentColor}88,${settings.accentColor}33)`, borderRadius:'0 0 12px 12px' }} />
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && <SettingsPanel settings={settings} onSave={setSettings} onClose={()=>setShowSettings(false)} />}
    </div>
  )
}
