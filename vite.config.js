import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    optimizeDeps: {
      exclude: ['.git/**']
    },
    hmr: {
      overlay: false
    },
    allowedHosts: [
      'cosmomessenger.ru',
      'www.cosmomessenger.ru',
    ],
    proxy: {
      '/api': {
        target: 'http://backend:4000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})