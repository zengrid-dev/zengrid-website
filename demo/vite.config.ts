import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// Standalone Vite app for the ZenGrid showcase.
// Served by the Astro site under /demo/ — built output goes to ../public/demo
// so `astro build` copies it into the final dist. Resolves @zengrid/core from
// the website's node_modules (published package).
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/demo/',
  publicDir: false,
  build: {
    outDir: fileURLToPath(new URL('../public/demo', import.meta.url)),
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port: 5199,
    open: true,
  },
});
