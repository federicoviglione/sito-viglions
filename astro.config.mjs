import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://federicoviglione.com',
  output: 'static',
  // Dev-only: honor an assigned PORT (e.g. from the editor's preview runner).
  server: process.env.PORT ? { port: Number(process.env.PORT) } : {},
  build: {
    inlineStylesheets: 'auto',
  },
});
