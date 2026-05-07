'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const COLOR_MAP: Record<string, string> = {
  '1': '#3B82F6', '2': '#10B981', '3': '#8B5CF6',
  '4': '#F59E0B', '5': '#EF4444', '6': '#06B6D4',
  '7': '#EC4899', '8': '#F97316',
}

function formatEventTime(iso: string, allDay: boolean) {
  if (allDay) return 'All Day'
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function getDayLabel(iso: string) {
  const d   = new Date(iso.includes('T') ? iso : iso + 'T12:00:00')
  const now = new Date()
  const diff = Math.floor((d.getTime() - now.getTime()) / 86400000)
  if (diff < 0)  return null
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function CalendarWidget() {
  const { data, isLoading } = useSWR('/api/calendar', fetcher, { refreshInterval: 300_000 })

  const events: Record<string, unknown>[] = data?.events || []

  // Group by day label
  const groups: { label: string; events: Record<string, unknown>[] }[] = []
  const seen = new Set<string>()
  events.forEach(e => {
    const label = getDayLabel(e.start as string)
    if (!label) return
    if (!seen.has(label)) { seen.add(label); groups.push({ label, events: [] }) }
    groups[groups.size - 1].events.push(e)
  })

  return (
    <div className="card glow-blue noise p-6 h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="widget-label">Upcoming · Calendar</span>
        {data?.demo && <span className="widget-label" style={{ color: '#3B82F6' }}>demo</span>}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4" style={{ scrollbarWidth: 'none' }}>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1,2,3,4].map(i => <div key={i} className="shimmer h-10 rounded-lg" style={{ opacity: 0.3 }} />)}
          </div>
        ) : groups.length === 0 ? (
          <div style={{ color: '#4A5568', fontSize: 13, fontFamily: 'var(--font-body)' }}>
            No upcoming events
          </div>
        ) : (
          groups.slice(0, 4).map(group => (
            <div key={group.label}>
              <div className="widget-label" style={{ color: '#3B82F6', marginBottom: 6 }}>
                {group.label}
              </div>
              <div className="flex flex-col gap-2">
                {group.events.map(event => (
                  <div key={event.id as string}
                    className="flex items-center gap-3 rounded-lg px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div style={{
                      width: 3, height: 32, borderRadius: 2, flexShrink: 0,
                      background: COLOR_MAP[event.color as string] || '#3B82F6',
                    }} />
                    <div className="flex-1 min-w-0">
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: 13,
                        color: '#F0F4F8', fontWeight: 500,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {event.title as string}
                      </div>
                      {!event.allDay && (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#5A6880', marginTop: 1 }}>
                          {formatEventTime(event.start as string, false)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, #3B82F633, #3B82F688, #3B82F633)',
        borderRadius: '0 0 16px 16px',
      }} />
    </div>
  )
}
