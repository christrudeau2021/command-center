/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        bg: {
          deep:    '#080C12',
          base:    '#0D1117',
          surface: '#131920',
          card:    '#161D27',
          hover:   '#1C2535',
        },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          DEFAULT: 'rgba(255,255,255,0.10)',
          bright: 'rgba(255,255,255,0.18)',
        },
        accent: {
          cyan:   '#00D4FF',
          blue:   '#3B82F6',
          amber:  '#F59E0B',
          green:  '#10B981',
          red:    '#EF4444',
          purple: '#8B5CF6',
        },
        text: {
          primary:   '#F0F4F8',
          secondary: '#8B98A8',
          muted:     '#4A5568',
          label:     '#5A6880',
        }
      },
      animation: {
        'fade-in':    'fadeIn 0.6s ease forwards',
        'slide-up':   'slideUp 0.5s ease forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'ticker':     'ticker 30s linear infinite',
        'shimmer':    'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGlow: { '0%,100%': { opacity: 0.6 }, '50%': { opacity: 1 } },
        ticker:    { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      }
    },
  },
  plugins: [],
}
