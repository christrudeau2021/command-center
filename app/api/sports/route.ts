import { NextResponse } from 'next/server'

// Leagues to fetch — configure in .env.local as SPORTS_LEAGUES (comma-separated)
// Options: nfl, nba, mlb, nhl, ncaaf, ncaab, mls
const DEFAULT_LEAGUES = ['nba', 'mlb', 'nfl']

interface EspnEvent {
  name: string
  shortName: string
  status: { type: { completed: boolean; description: string; state: string } }
  competitions: Array<{
    competitors: Array<{
      homeAway: string
      team: { abbreviation: string; logo: string }
      score: string
    }>
  }>
}

async function fetchLeague(league: string) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${getESPNPath(league)}/scoreboard`
  const res  = await fetch(url, { next: { revalidate: 120 } })
  const data = await res.json()

  return (data.events || []).slice(0, 6).map((event: EspnEvent) => {
    const comp = event.competitions[0]
    const home = comp.competitors.find((c) => c.homeAway === 'home')
    const away = comp.competitors.find((c) => c.homeAway === 'away')
    return {
      league:  league.toUpperCase(),
      name:    event.shortName,
      status:  event.status.type.description,
      state:   event.status.type.state, // pre / in / post
      home:    { abbr: home?.team.abbreviation, score: home?.score },
      away:    { abbr: away?.team.abbreviation, score: away?.score },
    }
  })
}

function getESPNPath(league: string) {
  const map: Record<string, string> = {
    nba:   'basketball/nba',
    nfl:   'football/nfl',
    mlb:   'baseball/mlb',
    nhl:   'hockey/nhl',
    ncaaf: 'football/college-football',
    ncaab: 'basketball/mens-college-basketball',
    mls:   'soccer/usa.1',
  }
  return map[league] || 'basketball/nba'
}

export async function GET() {
  try {
    const leagues = process.env.SPORTS_LEAGUES
      ? process.env.SPORTS_LEAGUES.split(',').map(l => l.trim())
      : DEFAULT_LEAGUES

    const results = await Promise.allSettled(leagues.map(fetchLeague))
    const games = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => (r as PromiseFulfilledResult<unknown[]>).value)

    return NextResponse.json({ games })
  } catch (e) {
    return NextResponse.json({ error: 'Sports unavailable' }, { status: 500 })
  }
}
