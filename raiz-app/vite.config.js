import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Raiz — Caderno digital da família',
        short_name: 'Raiz',
        description: 'Documentos, saúde e memórias da sua filha em um só lugar.',
        theme_color: '#2F6F62',
        background_color: '#F5F7F4',
        display: 'standalone',
        start_url: '/',
      },
    }),
  ],
})
