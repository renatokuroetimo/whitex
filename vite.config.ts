import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
          ui: ["@radix-ui/react-accordion", "@radix-ui/react-dialog"],
        },
      },
    },
    // Garantir que arquivos estáticos sejam copiados
    assetsDir: "assets",
    copyPublicDir: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
  // Configuração para desenvolvimento local
  publicDir: "public",
}));
