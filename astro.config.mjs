import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://katycaballeroosteopata.com',
  output: 'hybrid',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      persist: true,
    },
  }),
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  integrations: [
    sitemap({
      changefreq: 'weekly',
      lastmod: new Date(),
      filter(page) {
        return !page.includes('/admin/') && !page.includes('/api/') && !page.includes('/politica-');
      },
      serialize(item) {
        if (item.url === 'https://katycaballeroosteopata.com/') {
          item.priority = 1.0;
        } else if (item.url.includes('/servicios/') && item.url !== 'https://katycaballeroosteopata.com/servicios/') {
          item.priority = 0.9;
        } else if (item.url.includes('/osteopata-')) {
          item.priority = 0.85;
        } else if (item.url.includes('/reservar') || item.url.includes('/tarifas') || item.url.includes('/contacto')) {
          item.priority = 0.8;
        } else if (item.url.includes('/donde-te-duele') || item.url.includes('/test-') || item.url.includes('/guia-estiramientos')) {
          item.priority = 0.75;
        } else if (item.url.includes('/blog/') && item.url !== 'https://katycaballeroosteopata.com/blog/') {
          item.priority = 0.7;
        } else {
          item.priority = 0.6;
        }
        return item;
      },
    })
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
});
