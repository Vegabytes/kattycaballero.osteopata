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
    defaultStrategy: 'hover',
  },
  integrations: [
    sitemap({
      // No global lastmod: forcing the same timestamp on every URL on
      // each rebuild looks like spammy freshness. Per-page lastmod from
      // git/frontmatter would be ideal; absent that, we omit it.
      filter(page) {
        return !page.includes('/admin/') && !page.includes('/api/') && !page.includes('/politica-') && !page.includes('/gracias') && !page.includes('/404') && !page.includes('/offline');
      },
      serialize(item) {
        if (item.url === 'https://katycaballeroosteopata.com/') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (item.url === 'https://katycaballeroosteopata.com/blog/') {
          item.priority = 0.7;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/servicios/') && item.url !== 'https://katycaballeroosteopata.com/servicios/') {
          item.priority = 0.9;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/osteopata-') || item.url.includes('/masaje-')) {
          item.priority = 0.85;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/reservar') || item.url.includes('/tarifas') || item.url.includes('/contacto') || item.url.includes('/opiniones')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/promociones') || item.url.includes('/donde-te-duele') || item.url.includes('/test-') || item.url.includes('/guia-estiramientos')) {
          item.priority = 0.75;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/blog/')) {
          item.priority = 0.7;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/servicios') || item.url.includes('/sobre-mi') || item.url.includes('/primera-visita') || item.url.includes('/bonos')) {
          item.priority = 0.75;
          item.changefreq = 'monthly';
        } else {
          item.priority = 0.6;
          item.changefreq = 'yearly';
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
