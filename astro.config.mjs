import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://katycaballeroosteopata.com',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      lastmod: new Date(),
      serialize(item) {
        if (item.url === 'https://katycaballeroosteopata.com/') {
          item.priority = 1.0;
        } else if (item.url.includes('/servicios')) {
          item.priority = 0.9;
        } else if (item.url.includes('/blog/') && item.url !== 'https://katycaballeroosteopata.com/blog/') {
          item.priority = 0.8;
        } else {
          item.priority = 0.7;
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
