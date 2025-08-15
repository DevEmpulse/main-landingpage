// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@lucide/astro'],
    },
  },
  integrations: [react(),
    sitemap({
      // Opciones por defecto generan sitemap.xml en /dist
      filter: (page) => !page.includes('/404'), // opcional: excluye páginas
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  
});