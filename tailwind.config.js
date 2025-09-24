// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Make sure this path is correct for your project
  ],
  darkMode: 'class', // <-- THIS IS THE CRITICAL FIX
  theme: {
    extend: {},
  },
  plugins: [],
}