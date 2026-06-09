import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/cliente/',
  publicDir: 'public',

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Venda Fácil Cliente',
        short_name: 'Venda Fácil',
        description: 'Portal do Cliente Venda Fácil',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/cliente/',
        scope: '/cliente/',

        icons: [
          {
            src: '/cliente/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/cliente/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})