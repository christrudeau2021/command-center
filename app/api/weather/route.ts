import { NextResponse } from 'next/server'

// Config: set your lat/lon in .env.local
const LAT  = process.env.NEXT_PUBLIC_LAT  || '34.1015'   // Woodstock, GA
const LON  = process.env.NEXT_PUBLIC_LON  || '-84.5194'
const CITY = process.env.NEXT_PUBLIC_CITY || 'Woodstock, GA'

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0:  { label: 'Clear',          icon: '☀️'  },
  1:  { label: 'Mostly Clear',   icon: '🌤️'  },
  2:  { label: 'Partly Cloudy',  icon: '⛅'  },
  3:  { label: 'Overcast',       icon: '☁️'  },
  45: { label: 'Foggy',          icon: '🌫️'  },
  48: { label: 'Icy Fog',        icon: '🌫️'  },
  51: { label: 'Light Drizzle',  icon: '🌦️'  },
  61: { label: 'Light Rain',     icon: '🌧️'  },
  63: { label: 'Rain',           icon: '🌧️'  },
  65: { label: 'Heavy Rain',     icon: '🌧️'  },
  71: { label: 'Light Snow',     icon: '🌨️'  },
  73: { label: 'Snow',           icon: '❄️'  },
  80: { label: 'Showers',        icon: '🌦️'  },
  95: { label: 'Thunderstorms',  icon: '⛈️'  },
  99: { label: 'Hail Storm',     icon: '⛈️'  },
}

export async function GET() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/New_York&forecast_days=5`

    const res  = await fetch(url, { next: { revalidate: 900 } })
    const data = await res.json()

    const current = data.current
    const wmo     = WMO_CODES[current.weather_code] || { label: 'Unknown', icon: '🌡️' }

    const forecast = data.daily.time.slice(0, 5).map((date: string, i: number) => ({
      date,
      high:  Math.round(data.daily.temperature_2m_max[i]),
      low:   Math.round(data.daily.temperature_2m_min[i]),
      code:  data.daily.weather_code[i],
      icon:  (WMO_CODES[data.daily.weather_code[i]] || { icon: '🌡️' }).icon,
      label: (WMO_CODES[data.daily.weather_code[i]] || { label: '' }).label,
      precip: data.daily.precipitation_probability_max[i],
    }))

    return NextResponse.json({
      city:        CITY,
      temp:        Math.round(current.temperature_2m),
      feels_like:  Math.round(current.apparent_temperature),
      condition:   wmo.label,
      icon:        wmo.icon,
      humidity:    current.relative_humidity_2m,
      wind:        Math.round(current.wind_speed_10m),
      forecast,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Weather unavailable' }, { status: 500 })
  }
}
