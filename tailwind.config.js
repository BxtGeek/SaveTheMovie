/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#121110',
          card: '#1b1a17',
          hover: '#262420',
        },
        primary: '#ece8e1',
        secondary: '#9d968a',
        border: '#2e2b26',
        accent: {
          DEFAULT: '#e3b341',
          hover: '#f0c85f',
        },
      },
    },
  },
  plugins: [],
}