import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ]/* ,
  server: {
    allowedHosts: ["localhost", "5173-oussamaouzakri-ragbot-4umcox64x8e.ws-eu118.gitpod.io"]
  } */
})
