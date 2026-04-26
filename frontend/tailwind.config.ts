import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#111111',
          surface: '#1A1A1A',
          elevated: '#2A2A2A',
        },
        maroon: {
          DEFAULT: '#8B0000',
          dark: '#5a0000',
          light: '#a30000',
        },
        red: {
          DEFAULT: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.15)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A3A3A3',
        },
        border: {
          default: 'rgba(255, 255, 255, 0.1)',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
      },
      boxShadow: {
        'red-glow': '0 0 20px rgba(239, 68, 68, 0.15)',
        'maroon-glow': '0 0 15px rgba(139, 0, 0, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      animation: {
        'spin-fast': 'spin 0.6s linear infinite',
        'fade-in': 'fadeIn 0.4s ease forwards',
      },
    },
  },
  plugins: [],
}

export default config
