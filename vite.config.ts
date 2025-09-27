/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'; // FIX: Import from 'vitest/config'
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: { // TypeScript will now recognize the 'test' property
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    css: false, 
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) {
              return 'vendor-three';
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
});