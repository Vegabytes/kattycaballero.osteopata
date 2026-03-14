export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': new URL(request.url).origin,
  };

  try {
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
