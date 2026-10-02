import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    // maplibre-gl saturates the lazy-loaded vendor chunk at ~1 MB. That chunk
    // is NOT part of the initial load — it is only fetched when the user
    // scrolls to the interactive map (LazyAppInterfaceSection in App.tsx) —
    // so raise the default 500 kB warning threshold to cover it.
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        // Split heavy third-party libraries into cacheable vendor chunks so no
        // single chunk crosses Vite's 500 kB warning threshold.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;

          if (
            id.includes("maplibre") ||
            id.includes("geojson-vt") ||
            id.includes("supercluster") ||
            id.includes("kdbush") ||
            id.includes("potpack") ||
            id.includes("earcut") ||
            id.includes("quickselect") ||
            id.includes("tinyqueue") ||
            id.includes("pbf") ||
            id.includes("murmurhash")
          ) {
            return "maplibre";
          }
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("lucide-react")) return "lucide";
          // NOTE: must check lucide-react before the react match below, since
          // "lucide-react" contains the substring "react".
          if (id.includes("react") || id.includes("scheduler")) return "react";
          return "vendor";
        },
      },
    },
  },
});
