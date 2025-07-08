import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: "./src/main-mobile.tsx",
    },
  },
  define: {
    "process.env.VITE_APP_MODE": JSON.stringify("mobile"),
  },
});
