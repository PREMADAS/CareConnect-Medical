/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        meridian: {
          50: '#eefaf6',
          100: '#d3f1e6',
          200: '#a7e3cd',
          300: '#71cdb0',
          400: '#3fb090',
          500: '#249478',
          600: '#0e7c66', // primary
          700: '#0c6353',
          800: '#0d4f44',
          900: '#0b1f1c', // ink
          950: '#071411',
        },
        pulse: {
          50: '#fff3f1',
          100: '#ffe3de',
          200: '#ffc4ba',
          300: '#ff9c8c',
          400: '#ff6b5b', // accent
          500: '#f8462f',
          600: '#e02c17',
          700: '#bc2113',
          800: '#9a1e14',
          900: '#7f1d16',
        },
        surface: {
          light: '#f7f9f8',
          card: '#ffffff',
          dark: '#0d1b18',
          darkcard: '#122622',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(11, 31, 28, 0.08)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
        pulse: '0 0 0 4px rgba(255, 107, 91, 0.15)',
      },
      backdropBlur: {
        glass: '16px',
      },
      animation: {
        'pulse-line': 'pulseLine 2.4s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s ease-out both',
        'scale-in': 'scaleIn 0.2s ease-out both',
        shimmer: 'shimmer 1.8s linear infinite',
      },
      keyframes: {
        pulseLine: {
          '0%, 100%': { strokeDashoffset: '0' },
          '50%': { strokeDashoffset: '-24' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
