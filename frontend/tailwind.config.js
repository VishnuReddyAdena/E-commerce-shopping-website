/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fk-blue': '#2874f0',
        'fk-yellow': '#ffe11b',
        'fk-dark': '#212121',
        'fk-grey': '#878787',
        'fk-light-grey': '#f1f3f6',
        'fk-green': '#388e3c',
        'blue-650': '#2874f0',
        'indigo-650': '#1e5cc2',
        'red-650': '#dc2626'
      },
      boxShadow: {
        'fk-card': '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
        'fk-hover': '0 4px 16px 0 rgba(0, 0, 0, 0.12)'
      }
    },
  },
  plugins: [],
}
