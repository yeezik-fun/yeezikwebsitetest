// Configurazione Astro: sito statico, con React pronto per le "isole" (componenti React Bits).
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static',
  integrations: [react()],
});
