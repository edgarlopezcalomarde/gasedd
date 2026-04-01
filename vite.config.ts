import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import react, { reactCompilerPreset } from "@vitejs/plugin-react"
import babel from "@rolldown/plugin-babel"
import { VitePWA } from "vite-plugin-pwa"

const pwaOptions: Partial<import("vite-plugin-pwa").VitePWAOptions> = {
  registerType: "autoUpdate",
  includeAssets: ["favicon.ico", "robots.txt"],
  manifest: {
    name: "GasEdd - Precios Carburantes",
    short_name: "GasEdd",
    description: "Consulta los precios de carburantes en España",
    theme_color: "#000000",
    background_color: "#000000",
    display: "standalone",
    orientation: "portrait",
    start_url: "/gasedd/",
    scope: "/gasedd/",
    categories: ["transportation", "utilities"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/sedeaplicaciones\.minetur\.gob\.es\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /^https:\/\/tiles\.openfreemap\.org\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "map-tiles-cache",
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
    ],
  },
}

// https://vite.dev/config/
export default defineConfig({
  base: "/gasedd/",
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    VitePWA(pwaOptions),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
