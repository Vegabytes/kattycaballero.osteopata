export const prerender = false;

import type { APIRoute } from 'astro';

/**
 * Devuelve los últimos posts del Instagram de Katy.
 *
 * Estrategia:
 *  - Si hay caché reciente (<15 min) en Cloudflare Cache API → la devuelve (rápido).
 *  - Si no, llama a Instagram Graph API con un Long-Lived Access Token y guarda el resultado.
 *  - Si falla todo, devuelve `{ posts: [] }` con HTTP 200 — el frontend muestra fallback.
 *
 * Configuración en Cloudflare Pages → Settings → Environment Variables:
 *   - INSTAGRAM_ACCESS_TOKEN: Long-Lived Token (60 días, hay que rotarlo).
 *   - INSTAGRAM_BUSINESS_ACCOUNT_ID: opcional. Si lo defines, usa Graph API (Business/Creator).
 *                                    Si no, usa Basic Display API (`me/media`).
 *
 * Ver docs/INSTAGRAM-API-SETUP.md para la guía completa.
 */

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

interface FeedResponse {
  posts: InstagramPost[];
  cachedAt: string;
  source: 'cache' | 'live' | 'empty';
  error?: string;
}

const CACHE_TTL_SECONDS = 15 * 60; // 15 min
const CACHE_KEY_URL = 'https://katycaballeroosteopata.com/__cache__/instagram-feed-v2';
const POST_LIMIT = 12;

export const GET: APIRoute = async ({ locals, request }) => {
  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': new URL(request.url).origin,
  };

  // 1) Intenta caché de Cloudflare primero
  // @ts-expect-error caches.default solo existe en runtime Cloudflare
  const cache = typeof caches !== 'undefined' && caches.default ? caches.default : null;
  const cacheKey = new Request(CACHE_KEY_URL);

  if (cache) {
    const cached = await cache.match(cacheKey);
    if (cached) {
      const body = await cached.json() as FeedResponse;
      return new Response(JSON.stringify({ ...body, source: 'cache' }), {
        status: 200,
        headers: { ...cors, 'X-Cache': 'HIT' },
      });
    }
  }

  // 2) Sin caché: pide a Instagram Graph API
  // @ts-expect-error runtime de Cloudflare Pages adapter
  const env = locals.runtime?.env as Record<string, string | undefined> | undefined;
  const token = env?.INSTAGRAM_ACCESS_TOKEN;
  const businessAccountId = env?.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!token) {
    // No configurado todavía: respondemos vacío en 200 para que el frontend muestre fallback
    return new Response(
      JSON.stringify({
        posts: [],
        cachedAt: new Date().toISOString(),
        source: 'empty',
        error: 'INSTAGRAM_ACCESS_TOKEN no configurado. Ver docs/INSTAGRAM-API-SETUP.md',
      } satisfies FeedResponse),
      { status: 200, headers: cors }
    );
  }

  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
  // Si hay business account ID → usamos Graph API (Business/Creator).
  // Si no → usamos Basic Display API (que sigue funcionando para perfiles personales con app dev).
  const apiUrl = businessAccountId
    ? `https://graph.facebook.com/v21.0/${businessAccountId}/media?fields=${fields}&limit=${POST_LIMIT}&access_token=${token}`
    : `https://graph.instagram.com/me/media?fields=${fields}&limit=${POST_LIMIT}&access_token=${token}`;

  try {
    const apiResp = await fetch(apiUrl, {
      headers: { 'User-Agent': 'KatyCaballeroOsteopata/1.0' },
      // Cloudflare runtime fetch admite cf cacheTtl, pero como ya cacheamos manualmente lo dejamos así.
    });

    if (!apiResp.ok) {
      const errText = await apiResp.text().catch(() => 'unknown');
      console.error('Instagram API error:', apiResp.status, errText);
      return new Response(
        JSON.stringify({
          posts: [],
          cachedAt: new Date().toISOString(),
          source: 'empty',
          error: `Instagram API ${apiResp.status}: revisa que el token siga vivo (60 días). ${errText.slice(0, 200)}`,
        } satisfies FeedResponse),
        { status: 200, headers: cors }
      );
    }

    const data = await apiResp.json() as { data?: InstagramPost[] };
    const posts = (data.data || []).slice(0, POST_LIMIT);

    const payload: FeedResponse = {
      posts,
      cachedAt: new Date().toISOString(),
      source: 'live',
    };

    const response = new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        ...cors,
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
        'X-Cache': 'MISS',
      },
    });

    // Guarda en caché Cloudflare
    if (cache) {
      // El TTL respeta el header Cache-Control de la response
      await cache.put(cacheKey, response.clone());
    }

    return response;
  } catch (err) {
    console.error('Instagram fetch failed:', err);
    return new Response(
      JSON.stringify({
        posts: [],
        cachedAt: new Date().toISOString(),
        source: 'empty',
        error: err instanceof Error ? err.message : 'unknown',
      } satisfies FeedResponse),
      { status: 200, headers: cors }
    );
  }
};
