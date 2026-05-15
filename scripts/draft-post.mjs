#!/usr/bin/env node
/**
 * Generador de borradores SEO para el blog.
 *
 * Uso:
 *   node scripts/draft-post.mjs <slug>            # imprime un prompt listo para Claude/ChatGPT
 *   node scripts/draft-post.mjs <slug> --auto     # llama a la API de Claude (necesita ANTHROPIC_API_KEY)
 *   node scripts/draft-post.mjs --list            # muestra todos los temas pendientes
 *   node scripts/draft-post.mjs --random          # elige un tema pendiente al azar
 *
 * El borrador se guarda en `drafts/<fecha>-<slug>.md`. Katy revisa,
 * personaliza con experiencia clínica real y lo mueve a `src/content/blog/`.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TOPICS_PATH = join(ROOT, 'src/data/blog-topics.ts');
const BLOG_DIR = join(ROOT, 'src/content/blog');
const DRAFTS_DIR = join(ROOT, 'drafts');

/**
 * Extrae los topics del .ts mediante un parser minimalista. Acepta el formato
 * actual de `blog-topics.ts`. Si cambias la estructura, ajusta esta función.
 */
async function loadTopics() {
  const src = await readFile(TOPICS_PATH, 'utf8');
  const arrayMatch = src.match(/export const blogTopics:[^=]+=\s*\[([\s\S]*?)\];\s*\n\s*export const pendingTopics/);
  if (!arrayMatch) throw new Error('No se pudo localizar el array blogTopics en blog-topics.ts');
  const body = arrayMatch[1];
  // Split por entradas separando en cierres `},` a nivel raíz del array.
  const topics = [];
  let depth = 0;
  let buf = '';
  for (const ch of body) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    buf += ch;
    if (depth === 0 && buf.trim().endsWith(',')) {
      topics.push(parseTopic(buf.trim().replace(/,$/, '')));
      buf = '';
    }
  }
  if (buf.trim()) topics.push(parseTopic(buf.trim()));
  return topics.filter(Boolean);
}

function parseTopic(raw) {
  // Extrae campos simples (strings/arrays/numbers/booleans). No es un parser TS
  // de verdad: confía en que el archivo siga la convención de comillas y JSON-ish.
  const get = (key) => {
    const re = new RegExp(`${key}:\\s*('([^']*)'|"([^"]*)"|(\\d+)|(true|false))`, 'm');
    const m = raw.match(re);
    if (!m) return undefined;
    return m[2] ?? m[3] ?? (m[4] !== undefined ? Number(m[4]) : undefined) ?? (m[5] === 'true');
  };
  const getArr = (key) => {
    const re = new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`, 'm');
    const m = raw.match(re);
    if (!m) return [];
    return [...m[1].matchAll(/'([^']*)'|"([^"]*)"/g)].map((mm) => mm[1] ?? mm[2]);
  };
  return {
    slug: get('slug'),
    title: get('title'),
    category: get('category'),
    primaryKeyword: get('primaryKeyword'),
    secondaryKeywords: getArr('secondaryKeywords'),
    searchIntent: get('searchIntent'),
    targetAudience: get('targetAudience'),
    outlineH2s: getArr('outlineH2s'),
    readTimeMin: get('readTimeMin'),
    internalLinks: getArr('internalLinks'),
    done: get('done') === true,
  };
}

function buildPrompt(topic) {
  const today = new Date().toISOString().slice(0, 10);
  const internalLinksList = topic.internalLinks.map((l) => `- ${l}`).join('\n');
  const outlineList = topic.outlineH2s.map((h, i) => `${i + 1}. ${h}`).join('\n');
  const secondaryList = topic.secondaryKeywords.join(', ');

  return `Eres Katy Caballero, osteópata y masajista profesional con más de 12 años de experiencia en Alpedrete (Sierra Noroeste de Madrid). Escribes en primera persona, de forma cercana pero profesional, con anécdotas reales de tu consulta cuando aporten valor.

Redacta un artículo de blog completo para mi web (https://katycaballeroosteopata.com/blog) sobre:

**Título:** ${topic.title}
**Slug:** ${topic.slug}
**Categoría:** ${topic.category}
**Palabra clave principal:** ${topic.primaryKeyword}
**Palabras clave secundarias:** ${secondaryList}
**Audiencia objetivo:** ${topic.targetAudience}
**Tiempo de lectura objetivo:** ${topic.readTimeMin} minutos (~${topic.readTimeMin * 200} palabras)

**Outline obligatorio (usa estos H2 en orden):**
${outlineList}

**Enlaces internos que DEBES integrar de forma natural en el cuerpo del artículo (en frases que aporten contexto, no como bloque al final):**
${internalLinksList}

**Reglas SEO y de estilo:**
- Frontmatter exacto al final (formato YAML como se indica abajo).
- Usa la palabra clave principal en el primer párrafo (de forma natural) y al menos 3 veces a lo largo del texto.
- Densidad de palabras clave razonable: NO keyword stuffing.
- Frases cortas (máx. 20 palabras de media), párrafos de 2-4 frases.
- Lenguaje accesible: si usas un término técnico, explícalo entre paréntesis la primera vez.
- Incluye al menos 2 listas con viñetas o numeradas dentro del artículo.
- Acaba con un CTA suave que invite a reservar cita en /reservar o consultar por WhatsApp al 643 961 065, SIN ser comercial agresivo.
- En posts médicos/de salud: no prometas curas, evita afirmaciones absolutas, recuerda que cada caso es único, y menciona cuándo es mejor acudir a otro profesional (médico, traumatólogo, ginecólogo, pediatra...) si procede.
- E-E-A-T: aporta experiencia personal ("en mi consulta veo a menudo...", "un caso reciente...") sin inventar datos clínicos concretos. Si añades una anécdota, déjala genérica/anonimizada.
- NO uses emojis. NO uses negrita excesivamente (máximo 5-6 negritas en todo el artículo). NO uses headings H1; el título va en frontmatter.

**Formato exacto del output (devuélvelo TAL CUAL, sin envoltorio de markdown ni explicaciones):**

\`\`\`
---
title: "${topic.title}"
excerpt: "<resumen de 140-160 caracteres ideal para meta description; debe enganchar y contener la keyword principal>"
date: ${today}
category: "${topic.category}"
image: "/images/blog/${topic.slug}.webp"
readTime: ${topic.readTimeMin}
author: "Katy Caballero"
---

<intro de 2-3 párrafos que enganche y use la keyword principal de forma natural>

## ${topic.outlineH2s[0] ?? 'Sección 1'}

<contenido>

## ${topic.outlineH2s[1] ?? 'Sección 2'}

<contenido>

... (el resto de los H2 del outline)

## ¿Te puedo ayudar?

<CTA suave de 2-3 frases con enlace a /reservar y mención a WhatsApp 643 961 065>
\`\`\`

Recuerda: integra los enlaces internos en frases naturales del cuerpo, no al final. Empieza directamente con el frontmatter; no añadas introducción.`;
}

async function callClaude(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Falta ANTHROPIC_API_KEY en el entorno.');

  let Anthropic;
  try {
    Anthropic = (await import('@anthropic-ai/sdk')).default;
  } catch {
    throw new Error('Falta el paquete @anthropic-ai/sdk. Instala con: npm install @anthropic-ai/sdk');
  }
  const client = new Anthropic({ apiKey });
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });
  const textBlock = msg.content.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('Respuesta vacía de Claude.');
  // Si la respuesta viene envuelta en ```...```, lo quitamos.
  return textBlock.text.replace(/^```(?:markdown|md)?\n?/, '').replace(/\n?```\s*$/, '').trim();
}

async function saveDraft(slug, content) {
  if (!existsSync(DRAFTS_DIR)) await mkdir(DRAFTS_DIR, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const filename = `${date}-${slug}.md`;
  const path = join(DRAFTS_DIR, filename);
  await writeFile(path, content, 'utf8');
  return path;
}

async function checkSlugAvailable(slug) {
  // Avisa si ya existe en src/content/blog.
  if (existsSync(join(BLOG_DIR, `${slug}.md`))) {
    console.warn(`⚠️  Ya existe src/content/blog/${slug}.md — el slug podría chocar al publicar.`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const topics = await loadTopics();

  if (args.includes('--list')) {
    const pending = topics.filter((t) => !t.done);
    console.log(`\n${pending.length} temas pendientes:\n`);
    for (const t of pending) {
      console.log(`  ${t.slug.padEnd(50)} — ${t.title}`);
    }
    console.log(`\nUso: node scripts/draft-post.mjs <slug>`);
    return;
  }

  let slug;
  if (args.includes('--random')) {
    const pending = topics.filter((t) => !t.done);
    slug = pending[Math.floor(Math.random() * pending.length)].slug;
    console.log(`🎲 Elegido al azar: ${slug}`);
  } else {
    slug = args.find((a) => !a.startsWith('--'));
  }
  if (!slug) {
    console.error('Falta el slug. Usa --list para ver los disponibles o --random para uno aleatorio.');
    process.exit(1);
  }

  const topic = topics.find((t) => t.slug === slug);
  if (!topic) {
    console.error(`No encuentro el tema "${slug}" en src/data/blog-topics.ts.`);
    process.exit(1);
  }

  await checkSlugAvailable(slug);
  const prompt = buildPrompt(topic);

  if (args.includes('--auto')) {
    console.log(`🤖 Llamando a Claude para "${topic.title}"...`);
    const draft = await callClaude(prompt);
    const path = await saveDraft(slug, draft);
    console.log(`✅ Borrador guardado en ${path}`);
    console.log(`\nRevísalo, personaliza con casos reales de la consulta y mueve a src/content/blog/ cuando esté listo.`);
  } else {
    console.log('\n' + '═'.repeat(80));
    console.log(`PROMPT para "${topic.title}"`);
    console.log('═'.repeat(80) + '\n');
    console.log(prompt);
    console.log('\n' + '═'.repeat(80));
    console.log('Cópialo en Claude.ai (claude.com/new) y pega la respuesta en drafts/' + new Date().toISOString().slice(0, 10) + `-${slug}.md`);
    console.log('O ejecuta con --auto y ANTHROPIC_API_KEY para que se genere automáticamente.');
    console.log('═'.repeat(80));
  }
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
