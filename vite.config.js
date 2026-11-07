import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      devOptions: {
        enabled: false,
      },
      workbox: {
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
      },
      manifest: {
        name: "Besto Jewel",
        short_name: "Besto",
        description: "Gold Retail ERP",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/apple-touch-icon.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/iapple-touch-icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@store": path.resolve(__dirname, "./src/store"),
      "@styles": path.resolve(__dirname, "./src/styles"),
    },
  },
  // server: {

  // },

  server: {
    port: 5001,
    open: true, // Automatically open the browser
  },

  build: {
    outDir: "dist",
    sourcemap: true,
  },
  // Enable Vite’s built-in cache busting
  rollupOptions: {
    output: {
      entryFileNames: "assets/[name].[hash].js",
      chunkFileNames: "assets/[name].[hash].js",
      assetFileNames: "assets/[name].[hash].[ext]",
      manualChunks: {
        react: ["react", "react-dom"],
        vendor: ["axios", "lodash"],
      },
    },
  },
});
