'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function WeatherWidget() {
  const { data, isLoading } = useSWR('/api/weather', fetcher, { refreshInterval: 900_000 })

  if (isLoading) return (
    <div className="card glow-amber noise p-6 h-full flex flex-col gap-3">
      <span className="widget-label">Weather</span>
      {[80, 60, 90, 70].map((w, i) => (
        <div key={i} className="shimmer rounded h-4" style={{ width: `${w}%`, opacity: 0.3 }} />
      ))}
    </div>
  )

  const w = data || {}

  return (
    <div className="card glow-amber noise p-6 h-full flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <span className="widget-label">Weather · {w.city}</span>
        <div className="live-dot" />
      </div>

      {/* Current temp */}
      <div className="flex items-center gap-4">
        <span style={{ fontSize: 'clamp(2rem,3.5vw,3.2rem)' }}>{w.icon}</span>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem,4vw,3.8rem)',
            fontWeight: 800,
            color: '#F0F4F8',
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}>
            {w.temp}°
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#8B98A8', marginTop: 2 }}>
            {w.condition} · Feels {w.feels_like}°
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
        {[
          { label: 'Humidity', val: `${w.humidity}%` },
          { label: 'Wind',     val: `${w.wind} mph`  },
        ].map(s => (
          <div key={s.label}>
            <div className="widget-label" style={{ marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#F0F4F8' }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* 5-day forecast */}
      <div className="flex gap-2 overflow-hidden">
        {(w.forecast || []).slice(0, 5).map((day: Record<string, unknown>, i: number) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <span className="widget-label">
              {i === 0 ? 'Today' : new Date(day.date as string + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
            <span style={{ fontSize: 16 }}>{day.icon as string}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#F0F4F8' }}>{day.high as number}°</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#4A5568' }}>{day.low as number}°</span>
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, #F59E0B33, #F59E0B88, #F59E0B33)',
        borderRadius: '0 0 16px 16px',
      }} />
    </div>
  )
}
