import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://federicoviglione.com',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
});
