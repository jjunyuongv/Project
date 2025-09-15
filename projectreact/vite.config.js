// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // ✅ LAN에서 접속 가능 (http://<호스트IP>:5173)
    port: 5173,
    proxy: {
      '/api':     { target: 'http://localhost:8081', changeOrigin: true },
      '/ws-chat': { target: 'http://localhost:8081', changeOrigin: true, ws: true },
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
