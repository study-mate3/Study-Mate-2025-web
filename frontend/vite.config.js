import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false, // Try another port if 5173 is in use
  },
  optimizeDeps: {
    force: false, // Set to true to force re-optimization on every start
    esbuildOptions: {
      target: 'es2020',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  }
})
