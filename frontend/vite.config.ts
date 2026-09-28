import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/new/' : '/',
  plugins: [react()],
  server: { proxy: { '/api': process.env.API_PROXY_TARGET || 'http://127.0.0.1:3000' } }
}))
