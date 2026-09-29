import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  // Mirrors the /tts rewrite in vercel.json so the online voice works in `npm run dev`.
  server: {
    proxy: {
      "/tts": {
        target: "https://translate.google.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tts/, "/translate_tts"),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
