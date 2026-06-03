/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0088ff',
          hover: '#0077ee',
          50:  '#e6f3ff',
          100: '#cce7ff',
          200: '#99ceff',
          300: '#66b5ff',
          400: '#339cff',
          500: '#0088ff',
          600: '#006ecc',
          700: '#005299',
          800: '#003766',
          900: '#001b33',
        },
        background: 'var(--background)',
        'text-main': 'var(--text-main)',
      },
      boxShadow: {
        premium: 'var(--shadow-premium)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
