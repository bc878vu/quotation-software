import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.svg',
        'icons.svg',
        'letterhead.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
      ],

      manifest: {
        name: 'Al Falah Coal Trader - Quotation Software',
        short_name: 'Al Falah Quotation',

        description:
          'Offline quotation management software for Al Falah Coal Trader',

        theme_color: '#143361',
        background_color: '#edf3f9',

        display: 'standalone',

        orientation: 'portrait-primary',

        start_url: '/',
        scope: '/',

        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,

        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}',
        ],

        navigateFallback: 'index.html',
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],
});