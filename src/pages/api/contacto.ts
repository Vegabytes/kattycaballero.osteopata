export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': new URL(request.url).origin,
  };

  try {
    const body = await request.json();
    const { nombre, email, telefono, servicio, origen, mensaje } = body;

    if (!nombre || !mensaje || (!email && !telefono)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Faltan campos obligatorios' }),
        { status: 400, headers }
      );
    }

    const db = (locals as any).runtime.env.DB;

    // Get notification settings
    const rows = (await db.prepare('SELECT clave, valor FROM configuracion').all()).results as { clave: string; valor: string }[];
    const settings: Record<string, string> = {};
    for (const row of rows) settings[row.clave] = row.valor;

    const botToken = settings.telegram_bot_token;
    const chatId = settings.telegram_chat_id;
    const apiKey = settings.email_api_key;
    const adminEmail = settings.notificacion_email_destino || settings.email_clinica;
    const emailFrom = settings.email_from || 'Katy Caballero <onboarding@resend.dev>';

    // Send Telegram
    if (botToken && chatId) {
      const text = [
        'Nuevo mensaje desde la web',
        '',
        `Nombre: ${nombre}`,
        telefono ? `Telefono: ${telefono}` : '',
        email ? `Email: ${email}` : '',
        servicio ? `Servicio: ${servicio}` : '',
        origen ? `Nos encontro via: ${origen}` : '',
        '',
        `Mensaje: ${mensaje}`,
      ].filter(Boolean).join('\n');

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      });
    }

    // Send email
    if (apiKey && adminEmail) {
      const html = `<!DOCTYPE html>
<html lang="es"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#f5f5f5;">
<div style="max-width:500px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:#4a6548;padding:18px 24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:18px;font-weight:500;">Nuevo mensaje web</h1>
  </div>
  <div style="padding:24px;line-height:1.7;color:#333;font-size:14px;">
    <p><strong>Nombre:</strong> ${nombre}</p>
    ${telefono ? `<p><strong>Telefono:</strong> <a href="tel:${telefono}" style="color:#4a6548;">${telefono}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}" style="color:#4a6548;">${email}</a></p>` : ''}
    ${servicio ? `<p><strong>Servicio de inter&eacute;s:</strong> ${servicio}</p>` : ''}
    ${origen ? `<p><strong>Nos encontr&oacute; v&iacute;a:</strong> ${origen}</p>` : ''}
    <div style="background:#f8f6f0;padding:16px;border-radius:10px;border-left:4px solid #4a6548;margin-top:12px;">
      <p style="margin:0;white-space:pre-wrap;">${mensaje}</p>
    </div>
  </div>
</div>
</body></html>`;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: emailFrom,
          to: [adminEmail],
          subject: `Mensaje web: ${nombre}`,
          html,
          reply_to: email || undefined,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error contact form:', error);
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
