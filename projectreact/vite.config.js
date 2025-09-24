import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 80,
    proxy: {
      '/api': {
        target: 'http://backend:8081',
        changeOrigin: true,
      },
      '/ws-chat': {
        target: 'http://backend:8081',
        changeOrigin: true,
        ws: true,
      },
      '/public-api': {
        target: 'https://apis.data.go.kr', 
        changeOrigin: true,
        rewrite: path => path.replace(/^\/public-api/, ''),
      },
    },
  },
  define: { global: 'window' },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },
  optimizeDeps: { include: ['sockjs-client'] },
})
