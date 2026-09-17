// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// Dev-time proxy so the browser talks to http://localhost:5173/api/*
// and Vite forwards it to your ASP.NET Core API. This sidesteps CORS
// entirely during local development. Point VITE_API_PROXY_TARGET at
// whatever port `dotnet run` prints for Matrix.Api (see .env.example).
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173,
//     proxy: {
//       "/api": {
//         target: process.env.VITE_API_PROXY_TARGET ?? "https://localhost:7099",
//         changeOrigin: true,
//         secure: false, // dev-cert is self-signed
//       },
//     },
//   },
// });
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://localhost:7099",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
