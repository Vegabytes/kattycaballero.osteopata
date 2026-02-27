import { writeFileSync, mkdirSync } from 'fs';
import https from 'https';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');
const FONTS_DIR = path.join(ROOT, 'public/fonts');
mkdirSync(FONTS_DIR, { recursive: true });

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

const fonts = [
  { url: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEtGmSq17w.woff2', name: 'cormorant-garamond-italic-latin-ext.woff2' },
  { url: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3ZmX5slCNuHLi8bLeY9MK7whWMhyjYrEtImSo.woff2', name: 'cormorant-garamond-italic-latin.woff2' },
  { url: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYp3tKgS4.woff2', name: 'cormorant-garamond-normal-latin-ext.woff2' },
  { url: 'https://fonts.gstatic.com/s/cormorantgaramond/v21/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2', name: 'cormorant-garamond-normal-latin.woff2' },
  { url: 'https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459Wdhyzbi.woff2', name: 'montserrat-normal-latin-ext.woff2' },
  { url: 'https://fonts.gstatic.com/s/montserrat/v31/JTUSjIg1_i6t8kCHKm459Wlhyw.woff2', name: 'montserrat-normal-latin.woff2' },
];

async function main() {
  for (const font of fonts) {
    console.log(`Downloading ${font.name}...`);
    const buf = await download(font.url);
    writeFileSync(path.join(FONTS_DIR, font.name), buf);
    console.log(`  ✓ ${font.name} (${(buf.length / 1024).toFixed(1)} KB)`);
  }
  console.log('\n✅ All fonts downloaded!');
}

main().catch(console.error);
