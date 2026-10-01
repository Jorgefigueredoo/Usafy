import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { colors } from './src/theme/colors.ts';

// O chunk do Mapbox GL (~1,9 MB) passa do limite padrão do Workbox para precache (2 MB com folga
// pequena) e do aviso de tamanho do Vite. Ele já é carregado sob demanda, só na página do mapa.
const MAX_PRECACHE_BYTES = 5 * 1024 * 1024;
const MAPBOX_CHUNK_WARNING_KB = 2000;

export default defineConfig({
  build: {
    chunkSizeWarningLimit: MAPBOX_CHUNK_WARNING_KB,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Usafy',
        short_name: 'Usafy',
        description: 'Rotas urbanas que priorizam sua segurança. Chegue com segurança.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: colors.surface,
        background_color: colors.background,
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        maximumFileSizeToCacheInBytes: MAX_PRECACHE_BYTES,
      },
    }),
  ],
});
