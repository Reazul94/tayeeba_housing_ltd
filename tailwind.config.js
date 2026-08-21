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
        tayeeba: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        forest: {
          950: '#041610',
          900: '#06231a',
          850: '#082c1e',
          800: '#0c3b28',
          700: '#0e4a33',
          600: '#125d40',
          500: '#1b7a54',
          400: '#289e6e',
        },
        gold: {
          300: '#dfc282',
          400: '#d4af37',
          500: '#c5a059',
          600: '#b38838',
          700: '#9c7225',
          800: '#7a571a',
        },
        ivory: {
          50: '#fdfdfc',
          100: '#f8faf7',
          200: '#f0f4ee',
          300: '#e5ebd8',
          400: '#d5ded0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Hind Siliguri', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
