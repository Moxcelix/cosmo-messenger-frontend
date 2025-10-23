import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root:'./',
  plugins: [react()],
  server: {
    host: true,
    port: 3000
  },
  // Просто укажи publicDir
  publicDir: './public',
})