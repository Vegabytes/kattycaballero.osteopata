export const prerender = false;

import type { APIRoute } from 'astro';

// Simple rate limiting: max 2 reviews per IP per hour
const rateLimitMap = new Map<string, number[]>();

export const POST: APIRoute = async ({ request, locals }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': new URL(request.url).origin,
  };

  try {
    // Rate limiting
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;
    const attempts = (rateLimitMap.get(ip) || []).filter(t => now - t < windowMs);
    if (attempts.length >= 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Demasiados envíos. Inténtalo de nuevo más tarde.' }),
        { status: 429, headers: { ...headers, 'Retry-After': '3600' } }
      );
    }
    attempts.push(now);
    rateLimitMap.set(ip, attempts);

    const body = await request.json();
    const { nombre, puntuacion, mensaje, website } = body;

    // Honeypot check - if website field is filled, it's a bot
    if (website) {
      // Silently accept to not tip off bots
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers }
      );
    }

    if (!nombre || !mensaje || !puntuacion) {
      return new Response(
        JSON.stringify({ success: false, error: 'Faltan campos obligatorios' }),
        { status: 400, headers }
      );
    }

    const rating = parseInt(puntuacion, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ success: false, error: 'Puntuación no válida' }),
        { status: 400, headers }
      );
    }

    if (nombre.length > 100 || mensaje.length > 2000) {
      return new Response(
        JSON.stringify({ success: false, error: 'Texto demasiado largo' }),
        { status: 400, headers }
      );
    }

    const db = (locals as any).runtime.env.DB;

    // Get Telegram settings
    const rows = (await db.prepare('SELECT clave, valor FROM configuracion').all()).results as { clave: string; valor: string }[];
    const settings: Record<string, string> = {};
    for (const row of rows) settings[row.clave] = row.valor;

    const botToken = settings.telegram_bot_token;
    const chatId = settings.telegram_chat_id;

    // Send to Telegram
    if (botToken && chatId) {
      const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
      const text = [
        '📝 Nueva reseña desde la web',
        '',
        `👤 Nombre: ${nombre}`,
        `${stars} (${rating}/5)`,
        '',
        `💬 Mensaje: ${mensaje}`,
      ].join('\n');

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error review form:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno' }),
      { status: 500, headers }
    );
  }
};

export const OPTIONS: APIRoute = async ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': new URL(request.url).origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
