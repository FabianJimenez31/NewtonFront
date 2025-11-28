import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    include: ["lucide-svelte"],
  },
  server: {
    host: "0.0.0.0", // Escuchar en todas las interfaces
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "https://crm.inewton.ai",
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path,
      },
    },
  },
});
