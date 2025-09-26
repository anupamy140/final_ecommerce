import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // Create a separate chunk for the three.js library
          if (id.includes('three')) {
            return 'three';
          }
          // Create a separate chunk for the gsap library
          if (id.includes('gsap')) {
            return 'gsap';
          }
        },
      },
    },
  },
})