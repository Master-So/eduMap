/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#152735',
        paper: '#f5f2ea',
        'paper-deep': '#ebe7dc',
        teal: {
          DEFAULT: '#0e8f86',
          dark: '#08766f',
        },
        moss: '#657365',
      },
      fontFamily: {
        serif: ['DM Serif Display', 'Georgia', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
