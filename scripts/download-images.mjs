import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const ROOT = path.resolve(import.meta.dirname, '..');
const BLOG_DIR = path.join(ROOT, 'public/images/blog');
const SERVICES_DIR = path.join(ROOT, 'public/images/services');

mkdirSync(BLOG_DIR, { recursive: true });
mkdirSync(SERVICES_DIR, { recursive: true });

function download(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadAndConvert(url, outputPath, width, height) {
  console.log(`Downloading: ${path.basename(outputPath)}...`);
  const buf = await download(url);
  await sharp(buf)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .webp({ quality: 80 })
    .toFile(outputPath);
  console.log(`  ✓ ${path.basename(outputPath)}`);
}

// Blog images (800x500)
const blogImages = [
  { url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop&crop=center&q=80', name: 'dolor-hombro.webp' },
  { url: 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800&h=500&fit=crop&crop=center&q=80', name: 'ejercicios-lumbar.webp' },
  { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=500&fit=crop', name: 'contracturas-cervicales.webp' },
  { url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=500&fit=crop&crop=center&q=80', name: 'osteopatia-deportistas.webp' },
  { url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=500&fit=crop&crop=center&q=80', name: 'osteopatia-craneal.webp' },
  { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=500&fit=crop', name: 'masaje-terapeutico.webp' },
  { url: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=500&fit=crop', name: 'masaje-tailandes.webp' },
  { url: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=800&h=500&fit=crop', name: 'estres-tension.webp' },
  { url: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&h=500&fit=crop', name: 'masaje-embarazadas.webp' },
  { url: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800&h=500&fit=crop', name: 'osteopatia-fisioterapia.webp' },
  { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=500&fit=crop', name: 'ciatica.webp' },
];

// Service images - card size (300x300) and landing page size (600x400)
const serviceImages = [
  { url: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop&crop=center&q=80', name: 'osteopatia.webp', cardName: 'osteopatia-card.webp' },
  { url: 'https://images.pexels.com/photos/8219058/pexels-photo-8219058.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', name: 'masaje-deportivo.webp', cardName: 'masaje-deportivo-card.webp' },
  { url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop&crop=center&q=80', name: 'masaje-corporal.webp', cardName: 'masaje-corporal-card.webp' },
  { url: 'https://images.pexels.com/photos/6186763/pexels-photo-6186763.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', name: 'masaje-tailandes.webp', cardName: 'masaje-tailandes-card.webp' },
  { url: 'https://images.pexels.com/photos/6187421/pexels-photo-6187421.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', name: 'pindas-herbales.webp', cardName: 'pindas-herbales-card.webp' },
  { url: 'https://images.unsplash.com/photo-1493894473891-10fc1e5dbd22?w=600&h=400&fit=crop&crop=center&q=80', name: 'embarazadas.webp', cardName: 'embarazadas-card.webp' },
];

async function main() {
  console.log('=== Downloading blog images ===');
  for (const img of blogImages) {
    await downloadAndConvert(img.url, path.join(BLOG_DIR, img.name), 800, 500);
  }

  console.log('\n=== Downloading service images ===');
  for (const svc of serviceImages) {
    // Landing page size (600x400)
    await downloadAndConvert(svc.url, path.join(SERVICES_DIR, svc.name), 600, 400);
    // Card size (300x300)
    await downloadAndConvert(svc.url, path.join(SERVICES_DIR, svc.cardName), 300, 300);
  }

  // Generate favicons from logo
  console.log('\n=== Generating favicons ===');
  const logoPath = path.join(ROOT, 'public/images/logo.png');

  await sharp(logoPath).resize(32, 32).png().toFile(path.join(ROOT, 'public/favicon-32x32.png'));
  console.log('  ✓ favicon-32x32.png');

  await sharp(logoPath).resize(16, 16).png().toFile(path.join(ROOT, 'public/favicon-16x16.png'));
  console.log('  ✓ favicon-16x16.png');

  await sharp(logoPath).resize(180, 180).png().toFile(path.join(ROOT, 'public/apple-touch-icon.png'));
  console.log('  ✓ apple-touch-icon.png');

  await sharp(logoPath).resize(192, 192).png().toFile(path.join(ROOT, 'public/android-chrome-192x192.png'));
  console.log('  ✓ android-chrome-192x192.png');

  await sharp(logoPath).resize(512, 512).png().toFile(path.join(ROOT, 'public/android-chrome-512x512.png'));
  console.log('  ✓ android-chrome-512x512.png');

  // Generate favicon.ico (32x32 PNG works as ico for modern browsers)
  // For true .ico, we just use the 32x32 PNG since modern browsers accept it
  const ico32 = await sharp(logoPath).resize(32, 32).png().toBuffer();
  writeFileSync(path.join(ROOT, 'public/favicon.ico'), ico32);
  console.log('  ✓ favicon.ico');

  console.log('\n✅ All done!');
}

main().catch(console.error);
