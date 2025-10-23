import { defineConfig } from 'vite';

/**
 * Si publicas en GitHub Pages bajo:
 *   https://<usuario>.github.io/scientific-journal-formatter/
 * usa base = '/scientific-journal-formatter/'
 * Si usas dominio propio o Vercel/Netlify, cambia a base: '/'
 */
export default defineConfig({
  base: '/scientific-journal-formatter/',
  server: { port: 5173, open: false },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
});
