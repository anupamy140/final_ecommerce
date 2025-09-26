// tailwind.config.js
import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      colors: {
        primary: {
          DEFAULT: '#1a1a1a', // A deep, near-black for primary elements
          foreground: '#f8f8f8', // White/off-white for text on primary backgrounds
        },
        accent: {
          DEFAULT: '#f59e0b', // A vibrant amber/yellow for accents
          foreground: '#1a1a1a', // Dark text for accent backgrounds
        }
      },
    },
  },
  plugins: [],
}