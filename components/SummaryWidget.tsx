'use client'
import useSWR from 'swr'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type Tab = 'wins' | 'progress' | 'next'

const TABS: { key: Tab; label: string; color: string }[] = [
  { key: 'wins',     label: 'Wins',        color: '#10B981' },
  { key: 'progress', label: 'In Progress', color: '#F59E0B' },
  { key: 'next',     label: 'Next Steps',  color: '#8B5CF6' },
]

export default function SummaryWidget() {
  const { data, isLoading } = useSWR('/api/summary', fetcher, { refreshInterval: 3_600_000 })
  const [tab, setTab] = useState<Tab>('wins')

  const summary = data?.summary || {}

  const listMap: Record<Tab, string[]> = {
    wins:     summary.accomplishments || [],
    progress: summary.in_progress    || [],
    next:     summary.next_steps      || [],
  }

  const activeColor = TABS.find(t => t.key === tab)?.color || '#10B981'

  return (
    <div className="card noise p-6 h-full flex flex-col gap-4"
      style={{ boxShadow: `0 0 30px ${activeColor}14, 0 0 60px ${activeColor}08` }}>

      <div className="flex items-center justify-between">
        <span className="widget-label">Weekly Summary</span>
        <div className="flex items-center gap-2">
          {data?.demo && <span className="widget-label" style={{ color: '#8B5CF6' }}>demo</span>}
          <span className="widget-label" style={{ color: activeColor }}>
            {summary.week_label || ''}
          </span>
        </div>
      </div>

      {/* Headline */}
      {isLoading ? (
        <div className="shimmer h-5 rounded" style={{ width: '80%', opacity: 0.3 }} />
      ) : (
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(0.8rem,1.1vw,1rem)',
          fontWeight: 600,
          color: '#F0F4F8',
          lineHeight: 1.4,
          paddingBottom: 12,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {summary.headline}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background:   tab === t.key ? `${t.color}22` : 'transparent',
              color:        tab === t.key ? t.color : '#4A5568',
              transition:   'all 0.2s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ scrollbarWidth: 'none' }}>
        {isLoading ? (
          [70,85,65,90].map((w,i) => (
            <div key={i} className="shimmer h-4 rounded" style={{ width: `${w}%`, opacity: 0.3 }} />
          ))
        ) : (
          listMap[tab].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: activeColor, flexShrink: 0, marginTop: 6,
                boxShadow: `0 0 6px ${activeColor}`,
              }} />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                color: '#8B98A8',
                lineHeight: 1.6,
              }}>
                {item}
              </span>
            </div>
          ))
        )}
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${activeColor}33, ${activeColor}88, ${activeColor}33)`,
        borderRadius: '0 0 16px 16px',
        transition: 'background 0.3s ease',
      }} />
    </div>
  )
}
