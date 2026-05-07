'use client'
import { useState, useEffect } from 'react'

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function ClockWidget() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const h  = now.getHours()
  const m  = String(now.getMinutes()).padStart(2, '0')
  const s  = String(now.getSeconds()).padStart(2, '0')
  const ap = h >= 12 ? 'PM' : 'AM'
  const h12 = String(h % 12 || 12).padStart(2, '0')

  return (
    <div className="card glow-cyan noise flex flex-col justify-between p-6 h-full">
      {/* Label */}
      <span className="widget-label">Local Time</span>

      {/* Time */}
      <div className="flex items-end gap-2">
        <span
          className="leading-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 6vw, 5.5rem)',
            fontWeight: 800,
            color: '#F0F4F8',
            letterSpacing: '-0.03em',
          }}
        >
          {h12}:{m}
        </span>
        <div className="flex flex-col items-start mb-2 gap-1">
          <span className="widget-label text-accent-cyan" style={{ color: '#00D4FF', fontSize: 11 }}>
            {ap}
          </span>
          <span
            className="widget-label"
            style={{ fontSize: 11, color: '#4A5568', fontVariantNumeric: 'tabular-nums' }}
          >
            :{s}
          </span>
        </div>
      </div>

      {/* Date */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(0.9rem, 1.4vw, 1.2rem)',
            fontWeight: 600,
            color: '#8B98A8',
            letterSpacing: '0.01em',
          }}
        >
          {DAYS[now.getDay()]}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: '#4A5568',
            marginTop: 2,
          }}
        >
          {MONTHS[now.getMonth()]} {now.getDate()}, {now.getFullYear()}
        </div>
      </div>

      {/* Decorative accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 2,
          background: 'linear-gradient(90deg, #00D4FF33, #00D4FF88, #00D4FF33)',
          borderRadius: '0 0 16px 16px',
        }}
      />
    </div>
  )
}
