/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'],
      },
      colors: {
        brand: {
          50:  '#eef7ff',
          100: '#d9edff',
          200: '#b3dcff',
          300: '#85c6ff',
          400: '#54a9ff',
          500: '#2a8dff',
          600: '#186ee6',
          700: '#1457b4',
          800: '#114b94',
          900: '#0f3f78',
        }
      }
    },
  },
  plugins: [],
}
