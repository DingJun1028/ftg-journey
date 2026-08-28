import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FTG 永續旅程',
        short_name: 'FTG Journey',
        description: '紀錄永續旅程、準備清單、旅程表、心得與成果收集，打造永續旅遊最實用的 App',
        theme_color: '#10243f',
        background_color: '#f3ede1',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }
        ]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,ico}'] }
    })
  ]
});
