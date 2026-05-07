'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function timeAgo(iso: string) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NewsWidget() {
  const { data, isLoading } = useSWR('/api/news', fetcher, { refreshInterval: 600_000 })
  const articles: Record<string, string>[] = data?.articles || []

  return (
    <div className="card noise p-6 h-full flex flex-col gap-4"
      style={{ boxShadow: '0 0 30px rgba(139,92,246,0.08)' }}>

      <div className="flex items-center justify-between">
        <span className="widget-label">News Feed</span>
        <div className="live-dot" />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1" style={{ scrollbarWidth: 'none' }}>
        {isLoading ? (
          [85,70,90,75,80,65].map((w,i) => (
            <div key={i} className="shimmer h-10 rounded-lg mb-1" style={{ width: `${w}%`, opacity: 0.3 }} />
          ))
        ) : (
          articles.slice(0, 12).map((article, i) => (
            <a
              key={i}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-1 rounded-lg px-3 py-2 group"
              style={{
                background: 'transparent',
                textDecoration: 'none',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 12,
                color: '#D1D9E0',
                fontWeight: 500,
                lineHeight: 1.4,
              }}>
                {article.title}
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#8B5CF6', letterSpacing: '0.08em' }}>
                  {article.source?.split(' ')[0]}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 9 }}>·</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#4A5568' }}>
                  {timeAgo(article.pubDate)}
                </span>
              </div>
            </a>
          ))
        )}
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, #8B5CF633, #8B5CF688, #8B5CF633)',
        borderRadius: '0 0 16px 16px',
      }} />
    </div>
  )
}
