import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    'import.meta.env.VITE_FOURSQUARE_API_KEY': JSON.stringify('OMHCA2LDSZN5TKWPAGX4T1QOBHDHUQ1LKVMTZUIO1TLM3BFA'),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/fsq-proxy": {
        target: "https://places-api.foursquare.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fsq-proxy/, ""),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
