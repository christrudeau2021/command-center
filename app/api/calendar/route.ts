import { NextResponse } from 'next/server'

// This route uses Google Calendar API.
// Set GOOGLE_CALENDAR_API_KEY and GOOGLE_CALENDAR_ID in .env.local
// For a public calendar, an API key is sufficient.
// For a private calendar, you'll need OAuth2 (see README for setup).

export async function GET() {
  const apiKey     = process.env.GOOGLE_CALENDAR_API_KEY
  const calendarId = process.env.GOOGLE_CALENDAR_ID

  if (!apiKey || !calendarId) {
    // Return demo data when not configured
    return NextResponse.json({ events: getDemoEvents(), demo: true })
  }

  try {
    const now       = new Date().toISOString()
    const twoWeeks  = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${now}&timeMax=${twoWeeks}&singleEvents=true&orderBy=startTime&maxResults=15`

    const res  = await fetch(url, { next: { revalidate: 300 } })
    const data = await res.json()

    if (data.error) {
      return NextResponse.json({ events: getDemoEvents(), demo: true })
    }

    const events = (data.items || []).map((item: Record<string, unknown>) => {
      const start = item.start as Record<string, string>
      const end   = item.end   as Record<string, string>
      const isAllDay = !!start.date
      return {
        id:       item.id,
        title:    item.summary,
        start:    start.dateTime || start.date,
        end:      end?.dateTime  || end?.date,
        allDay:   isAllDay,
        location: item.location || null,
        color:    item.colorId   || null,
      }
    })

    return NextResponse.json({ events })
  } catch (e) {
    return NextResponse.json({ events: getDemoEvents(), demo: true })
  }
}

function getDemoEvents() {
  const now = new Date()
  const day = (offset: number, h: number, m = 0) => {
    const d = new Date(now)
    d.setDate(d.getDate() + offset)
    d.setHours(h, m, 0, 0)
    return d.toISOString()
  }
  return [
    { id: '1', title: 'Team Standup',         start: day(0, 9),  allDay: false, color: '1' },
    { id: '2', title: 'Product Review',        start: day(0, 14), allDay: false, color: '2' },
    { id: '3', title: 'Weekly 1:1 — Jessica',  start: day(1, 10), allDay: false, color: '5' },
    { id: '4', title: 'Security Review Board', start: day(1, 15), allDay: false, color: '6' },
    { id: '5', title: 'Tabletop Exercise',     start: day(3, 9),  allDay: false, color: '4' },
    { id: '6', title: 'Focus Block',           start: day(4, 8),  allDay: false, color: '8' },
    { id: '7', title: 'Sprint Planning',       start: day(7, 10), allDay: false, color: '1' },
  ]
}
