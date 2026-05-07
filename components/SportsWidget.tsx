'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type Game = {
  league: string
  name: string
  status: string
  state: 'pre' | 'in' | 'post'
  home: { abbr: string; score: string }
  away: { abbr: string; score: string }
}

const STATE_COLOR: Record<string, string> = {
  pre:  '#5A6880',
  in:   '#10B981',
  post: '#4A5568',
}

const LEAGUE_COLOR: Record<string, string> = {
  NBA: '#F59E0B',
  NFL: '#3B82F6',
  MLB: '#10B981',
  NHL: '#8B5CF6',
  MLS: '#06B6D4',
}

export default function SportsWidget() {
  const { data, isLoading } = useSWR('/api/sports', fetcher, { refreshInterval: 120_000 })
  const games: Game[] = data?.games || []

  return (
    <div className="card noise p-6 h-full flex flex-col gap-3"
      style={{ boxShadow: '0 0 30px rgba(245,158,11,0.08)' }}>

      <div className="flex items-center justify-between">
        <span className="widget-label">Scores</span>
        <div className="live-dot" />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ scrollbarWidth: 'none' }}>
        {isLoading ? (
          [1,2,3,4].map(i => (
            <div key={i} className="shimmer h-12 rounded-lg" style={{ opacity: 0.3 }} />
          ))
        ) : games.length === 0 ? (
          <div style={{ color: '#4A5568', fontSize: 12, fontFamily: 'var(--font-body)', marginTop: 8 }}>
            No games scheduled today
          </div>
        ) : (
          games.map((game, i) => (
            <div key={i} className="rounded-lg px-3 py-2 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.04)' }}>

              {/* League badge */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                letterSpacing: '0.1em',
                color: LEAGUE_COLOR[game.league] || '#5A6880',
                width: 28,
                flexShrink: 0,
              }}>
                {game.league}
              </div>

              {/* Teams + scores */}
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="flex justify-between">
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: '#F0F4F8' }}>
                      {game.away.abbr}
                    </span>
                    {game.state !== 'pre' && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#F0F4F8' }}>
                        {game.away.score}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: '#8B98A8' }}>
                      {game.home.abbr}
                    </span>
                    {game.state !== 'pre' && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#8B98A8' }}>
                        {game.home.score}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: STATE_COLOR[game.state],
                textAlign: 'right',
                maxWidth: 60,
                lineHeight: 1.3,
              }}>
                {game.state === 'in' && (
                  <span style={{
                    display: 'inline-block', width: 5, height: 5,
                    borderRadius: '50%', background: '#10B981',
                    marginRight: 4, verticalAlign: 'middle',
                    animation: 'pulseGlow 2s infinite',
                  }} />
                )}
                {game.status}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, #F59E0B33, #F59E0B88, #F59E0B33)',
        borderRadius: '0 0 16px 16px',
      }} />
    </div>
  )
}
