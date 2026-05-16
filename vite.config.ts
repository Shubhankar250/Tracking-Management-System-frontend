import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // 👇 THIS is the key fix
  define: {
    global: "window",
  },

  server: {
    host: "127.0.0.1",
    port: 3000,
    proxy: {
      "/api-proxy": {
        target: "http://localhost:8091",
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ""),
      },
    },
  },
});
