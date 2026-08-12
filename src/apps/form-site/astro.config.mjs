// @ts-check

import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),

  // No i18n prefix routing — this app has a single flat route space:
  //   /              → redirect to https://fenrirclub.be
  //   /{code}        → the public form
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});
