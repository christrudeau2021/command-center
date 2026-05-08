import { NextResponse } from 'next/server'

const WMO: Record<number,{label:string;icon:string}> = {
  0:{label:'Clear',icon:'☀️'},1:{label:'Mostly Clear',icon:'🌤️'},2:{label:'Partly Cloudy',icon:'⛅'},
  3:{label:'Overcast',icon:'☁️'},45:{label:'Foggy',icon:'🌫️'},48:{label:'Icy Fog',icon:'🌫️'},
  51:{label:'Light Drizzle',icon:'🌦️'},61:{label:'Light Rain',icon:'🌧️'},63:{label:'Rain',icon:'🌧️'},
  65:{label:'Heavy Rain',icon:'🌧️'},71:{label:'Light Snow',icon:'🌨️'},73:{label:'Snow',icon:'❄️'},
  80:{label:'Showers',icon:'🌦️'},95:{label:'Thunderstorms',icon:'⛈️'},99:{label:'Hail Storm',icon:'⛈️'},
}

// Geocode city name → lat/lon using Open-Meteo geocoding (free, no key)
async function geocode(city: string): Promise<{lat:number;lon:number;name:string}|null> {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`)
    const data = await res.json()
    const r = data?.results?.[0]
    if (!r) return null
    return { lat: r.latitude, lon: r.longitude, name: `${r.name}${r.admin1?', '+r.admin1:''}` }
  } catch { return null }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const cityParam = searchParams.get('city')

    let lat = process.env.NEXT_PUBLIC_LAT || '34.1015'
    let lon = process.env.NEXT_PUBLIC_LON || '-84.5194'
    let city = process.env.NEXT_PUBLIC_CITY || 'Woodstock, GA'

    if (cityParam) {
      const geo = await geocode(cityParam)
      if (geo) { lat = String(geo.lat); lon = String(geo.lon); city = geo.name }
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/New_York&forecast_days=5`
    const res = await fetch(url, { next: { revalidate: 900 } })
    const data = await res.json()
    const cur = data.current
    const wmo = WMO[cur.weather_code] || {label:'Unknown',icon:'🌡️'}

    const forecast = data.daily.time.slice(0,5).map((date:string,i:number)=>({
      date, high:Math.round(data.daily.temperature_2m_max[i]),
      low:Math.round(data.daily.temperature_2m_min[i]),
      icon:(WMO[data.daily.weather_code[i]]||{icon:'🌡️'}).icon,
      label:(WMO[data.daily.weather_code[i]]||{label:''}).label,
      precip:data.daily.precipitation_probability_max[i],
    }))

    return NextResponse.json({ city, temp:Math.round(cur.temperature_2m), feels_like:Math.round(cur.apparent_temperature), condition:wmo.label, icon:wmo.icon, humidity:cur.relative_humidity_2m, wind:Math.round(cur.wind_speed_10m), forecast })
  } catch {
    return NextResponse.json({ error:'Weather unavailable' }, { status:500 })
  }
}
