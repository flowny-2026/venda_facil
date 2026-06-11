import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/admin/',

  server: {
    port: 5180
  },

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Venda Fácil Admin',
        short_name: 'Venda Fácil',
        description: 'Painel Administrativo Venda Fácil',

        theme_color: '#2563eb',
        background_color: '#ffffff',

        display: 'standalone',

        start_url: '/admin/',
        scope: '/admin/',

        icons: [
          {
            src: '/admin/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/admin/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})