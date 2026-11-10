
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "NEON RUSH",
        short_name: "Neon Rush",
        description: "Offline Endless Runner Game",

        theme_color: "#DCE8DF",
        background_color: "#DCE8DF",

        display: "standalone",
        orientation: "landscape",

        start_url: "./",
        scope: "./",

        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },

      workbox: {
        globPatterns: [
          "**/*.{js,css,html,png,svg,webp,ico,woff2}"
        ]
      }
    })
  ]
});
