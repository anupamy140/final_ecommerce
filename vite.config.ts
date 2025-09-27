import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // This refined strategy splits the largest libraries into their own chunks
          // to ensure the initial download is as small as possible.
          if (id.includes('node_modules')) {
            if (id.includes('three')) {
              return 'vendor-three'; // Isolate the huge three.js library
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            if (id.includes('react-router-dom') || id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('react-dom') || id.includes('react')) {
              return 'vendor-react';
            }
          }
        },
      },
    },
  },
})