import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const publicBackendUrl =
  process.env.VITE_SUPABASE_URL ?? "https://jetknvdnnthqxhmlslzh.supabase.co";

const publicBackendKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldGtudmRubnRocXhobWxzbHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTE1MjUsImV4cCI6MjA4ODE2NzUyNX0.hggO-u0O7KyGju_LEcL-WK_7STeysNiOhvQM_fqQ8MU";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(publicBackendUrl),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(publicBackendKey),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
