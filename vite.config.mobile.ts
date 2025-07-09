import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
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
    // Garantir que as variáveis de ambiente sejam incluídas no build
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.VITE_SUPABASE_URL ||
        "https://ogyvioeeaknagslworyz.supabase.co",
    ),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
      process.env.VITE_SUPABASE_ANON_KEY ||
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neXZpb2VlYWtuYWdzbHdvcnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDg0MTMsImV4cCI6MjA2NTgyNDQxM30.tvWZHrK-OwIPjHgjAq8PA1Wr95OFmfPi89X6gmDB5Lw",
    ),
  },
}));
