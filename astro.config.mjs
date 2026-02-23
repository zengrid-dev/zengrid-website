// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [
    expressiveCode({
      themes: ['github-dark'],
      styleOverrides: {
        borderColor: '#1e293b',
        borderRadius: '0.5rem',
        codeFontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
        codeFontSize: '0.875rem',
        codeBackground: '#0d1117',
        frames: {
          shadowColor: 'transparent',
        },
      },
    }),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@zengrid/core', '@zengrid/shared']
    },
    optimizeDeps: {
      include: ['@zengrid/core', '@zengrid/shared']
    }
  }
});
