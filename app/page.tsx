'use client'
import ClockWidget    from '@/components/ClockWidget'
import WeatherWidget  from '@/components/WeatherWidget'
import CalendarWidget from '@/components/CalendarWidget'
import SummaryWidget  from '@/components/SummaryWidget'
import NewsWidget     from '@/components/NewsWidget'
import SportsWidget   from '@/components/SportsWidget'
import StocksWidget   from '@/components/StocksWidget'

export default function Dashboard() {
  return (
    <div
      style={{
        width:  '100vw',
        height: '100vh',
        background: '#080C12',
        display: 'grid',
        padding: '20px',
        gap: '14px',
        // 4-column, 3-row grid optimized for 1080p / 4K TV
        gridTemplateColumns: '280px 1fr 1fr 260px',
        gridTemplateRows: '180px 1fr 200px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background ambient glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 40% at 15% 20%, rgba(0,212,255,0.04) 0%, transparent 70%),
          radial-gradient(ellipse 50% 50% at 85% 80%, rgba(139,92,246,0.05) 0%, transparent 70%),
          radial-gradient(ellipse 40% 30% at 50% 50%, rgba(59,130,246,0.03) 0%, transparent 60%)
        `,
      }} />

      {/* Header bar — spans full width */}
      <div style={{
        gridColumn: '1 / -1',
        gridRow: '1',
        display: 'grid',
        gridTemplateColumns: '280px 1fr 1fr 260px',
        gap: '14px',
        zIndex: 1,
      }}>
        {/* Clock */}
        <div style={{ animation: 'slideUp 0.5s ease 0s both' }}>
          <ClockWidget />
        </div>

        {/* Weather — spans 2 cols */}
        <div style={{ gridColumn: 'span 2', animation: 'slideUp 0.5s ease 0.05s both' }}>
          <WeatherWidget />
        </div>

        {/* Stocks summary — right */}
        <div style={{ animation: 'slideUp 0.5s ease 0.1s both' }}>
          <StocksWidget />
        </div>
      </div>

      {/* Middle row */}
      {/* Calendar */}
      <div style={{ gridColumn: 1, gridRow: 2, zIndex: 1, animation: 'slideUp 0.5s ease 0.15s both' }}>
        <CalendarWidget />
      </div>

      {/* Weekly Summary — center spotlight */}
      <div style={{ gridColumn: '2 / 4', gridRow: 2, zIndex: 1, animation: 'slideUp 0.5s ease 0.2s both' }}>
        <SummaryWidget />
      </div>

      {/* News */}
      <div style={{ gridColumn: 4, gridRow: 2, zIndex: 1, animation: 'slideUp 0.5s ease 0.25s both' }}>
        <NewsWidget />
      </div>

      {/* Bottom row */}
      {/* Sports — full width bottom */}
      <div style={{ gridColumn: '1 / 4', gridRow: 3, zIndex: 1, animation: 'slideUp 0.5s ease 0.3s both' }}>
        <SportsWidget />
      </div>

      {/* Stocks detail — bottom right */}
      <div style={{ gridColumn: 4, gridRow: 3, zIndex: 1, animation: 'slideUp 0.5s ease 0.35s both' }}>
        <div className="card noise p-4 h-full flex flex-col justify-between"
          style={{ boxShadow: '0 0 20px rgba(59,130,246,0.06)' }}>
          <span className="widget-label">Quick Links</span>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Gmail',          url: 'https://mail.google.com',          color: '#EF4444' },
              { label: 'Google Calendar', url: 'https://calendar.google.com',     color: '#3B82F6' },
              { label: 'Weekly Summary', url: '/api/summary',                     color: '#8B5CF6' },
              { label: 'GitHub',         url: 'https://github.com',               color: '#F0F4F8' },
            ].map(link => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: link.color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#8B98A8' }}>
                  {link.label}
                </span>
              </a>
            ))}
          </div>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, #3B82F633, #3B82F688, #3B82F633)',
            borderRadius: '0 0 16px 16px',
          }} />
        </div>
      </div>
    </div>
  )
}
