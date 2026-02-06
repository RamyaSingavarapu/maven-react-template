import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 1. Set the port to avoid conflicts
    port: 3000, 
    // 2. Proxy API requests to Spring Boot
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Output build files to a folder Maven can find them
    outDir: '../resources/static',
    // Clean old files on build
    emptyOutDir: true, 
  }
})