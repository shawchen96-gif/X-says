import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: fileURLToPath(new URL("./github-pages-src", import.meta.url)),
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  base: "./",
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL("./docs", import.meta.url)),
    emptyOutDir: true,
  },
});
