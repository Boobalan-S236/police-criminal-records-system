/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020818',
          900: '#040d24',
          800: '#071230',
          700: '#0a1840'
        }
      },
      fontFamily: {
        display: ["Exo 2", 'sans-serif'],
        body: ["IBM Plex Sans", 'sans-serif'],
        mono: ["IBM Plex Mono", 'monospace']
      }
    }
  },
  plugins: []
}

