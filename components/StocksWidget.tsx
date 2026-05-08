'use client'
import useSWR from 'swr'
import { useState, useEffect } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type Stock = {
  symbol: string
  name: string
  price: number
  change: number
  pct: number
}

export default function StocksWidget() {
  const { data, isLoading } = useSWR('/api/stocks', fetcher, { refreshInterval: 300_000 })
  const stocks: Stock[] = data?.stocks || []
  const [timeStr, setTimeStr] = useState('')

  useEffect(() => {
    const update = () => setTimeStr(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    update()
    const t = setInterval(update, 60_000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="card noise p-6 h-full flex flex-col gap-4"
      style={{ boxShadow: '0 0 30px rgba(16,185,129,0.08)' }}>

      <div className="flex items-center justify-between">
        <span className="widget-label">Markets</span>
        <div className="flex items-center gap-2">
          <div className="live-dot" />
          <span className="widget-label" style={{ color: '#4A5568' }}>{timeStr}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ scrollbarWidth: 'none' }}>
        {isLoading ? (
          [1,2,3,4,5,6].map(i => (
            <div key={i} className="shimmer h-10 rounded-lg" style={{ opacity: 0.3 }} />
          ))
        ) : (
          stocks.map((s, i) => {
            const up = s.change >= 0
            const color = up ? '#10B981' : '#EF4444'
            return (
              <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 3, height: 28, borderRadius: 2, background: color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#F0F4F8' }}>
                      {s.symbol}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: '#5A6880', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 }}>
                      {s.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-end flex-col gap-0.5">
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: '#F0F4F8' }}>
                    ${s.price.toLocaleString()}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color }}>
                    {up ? '▲' : '▼'} {Math.abs(s.pct).toFixed(2)}%
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, #10B98133, #10B98188, #10B98133)',
        borderRadius: '0 0 16px 16px',
      }} />
    </div>
  )
}
