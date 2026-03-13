/**
 * Notification system for new bookings
 * Sends alerts to Katy via Email (Resend) and Telegram
 */

interface BookingData {
  nombre: string;
  telefono: string;
  servicio: string;
  fecha: string;
  hora: string;
  duracion: number;
  notas?: string;
}

interface NotifyResult {
  email: { sent: boolean; error?: string };
  telegram: { sent: boolean; error?: string };
}

// Get settings from D1 configuracion table
async function getNotifySettings(db: any): Promise<Record<string, string>> {
  try {
    const rows = (await db.prepare('SELECT clave, valor FROM configuracion').all()).results as { clave: string; valor: string }[];
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.clave] = row.valor;
    }
    return settings;
  } catch {
    return {};
  }
}

function formatFechaES(fecha: string): string {
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const d = new Date(fecha + 'T00:00:00');
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
}

// === EMAIL (Resend) ===

async function sendEmailNotification(settings: Record<string, string>, booking: BookingData): Promise<{ sent: boolean; error?: string }> {
  const apiKey = settings.email_api_key;
  const adminEmail = settings.notificacion_email_destino || settings.email_clinica;
  const emailFrom = settings.email_from || 'Katy Caballero <onboarding@resend.dev>';

  if (!apiKey || !adminEmail) {
    return { sent: false, error: 'Email no configurado' };
  }

  const fechaDisplay = formatFechaES(booking.fecha);

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#f5f5f5;">
<div style="max-width:500px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:#4a6548;padding:18px 24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:18px;font-weight:500;">Nueva reserva web</h1>
  </div>
  <div style="padding:24px;line-height:1.7;color:#333;font-size:14px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#888;width:100px;">Paciente</td><td style="padding:6px 0;font-weight:600;">${booking.nombre}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Teléfono</td><td style="padding:6px 0;"><a href="tel:${booking.telefono}" style="color:#4a6548;">${booking.telefono}</a></td></tr>
      <tr><td style="padding:6px 0;color:#888;">Servicio</td><td style="padding:6px 0;">${booking.servicio || 'No especificado'}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Fecha</td><td style="padding:6px 0;font-weight:600;">${fechaDisplay}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Hora</td><td style="padding:6px 0;font-weight:600;">${booking.hora}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Duración</td><td style="padding:6px 0;">${booking.duracion} min</td></tr>
      ${booking.notas ? `<tr><td style="padding:6px 0;color:#888;">Notas</td><td style="padding:6px 0;">${booking.notas}</td></tr>` : ''}
    </table>
    <div style="margin-top:20px;text-align:center;">
      <a href="https://katycaballeroosteopata.com/admin/citas" style="display:inline-block;padding:10px 24px;background:#4a6548;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Ver en el panel</a>
    </div>
  </div>
  <div style="padding:12px 24px;background:#f9f9f9;text-align:center;font-size:11px;color:#999;">
    Katy Caballero · Osteópata y Masajista · Alpedrete
  </div>
</div>
</body></html>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [adminEmail],
        subject: `Nueva reserva: ${booking.nombre} — ${fechaDisplay} ${booking.hora}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { sent: false, error: `Resend error: ${err}` };
    }
    return { sent: true };
  } catch (e: any) {
    return { sent: false, error: e.message };
  }
}

// === TELEGRAM ===

async function sendTelegramNotification(settings: Record<string, string>, booking: BookingData): Promise<{ sent: boolean; error?: string }> {
  const botToken = settings.telegram_bot_token;
  const chatId = settings.telegram_chat_id;

  if (!botToken || !chatId) {
    return { sent: false, error: 'Telegram no configurado' };
  }

  const fechaDisplay = formatFechaES(booking.fecha);

  const text = [
    `📅 *Nueva reserva web*`,
    ``,
    `👤 *Paciente:* ${escapeMarkdown(booking.nombre)}`,
    `📞 *Teléfono:* ${escapeMarkdown(booking.telefono)}`,
    `💆 *Servicio:* ${escapeMarkdown(booking.servicio || 'No especificado')}`,
    `📆 *Fecha:* ${escapeMarkdown(fechaDisplay)}`,
    `🕐 *Hora:* ${booking.hora}`,
    `⏱ *Duración:* ${booking.duracion} min`,
    booking.notas ? `📝 *Notas:* ${escapeMarkdown(booking.notas)}` : '',
    ``,
    `[Ver en el panel](https://katycaballeroosteopata.com/admin/citas)`,
  ].filter(Boolean).join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { sent: false, error: `Telegram error: ${err}` };
    }
    return { sent: true };
  } catch (e: any) {
    return { sent: false, error: e.message };
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

// === MAIN FUNCTION ===

export async function notifyNewBooking(db: any, booking: BookingData): Promise<NotifyResult> {
  const settings = await getNotifySettings(db);

  const emailEnabled = settings.notificacion_email_activo === 'true';
  const telegramEnabled = settings.notificacion_telegram_activo === 'true';

  const [emailResult, telegramResult] = await Promise.all([
    emailEnabled ? sendEmailNotification(settings, booking) : { sent: false, error: 'Desactivado' },
    telegramEnabled ? sendTelegramNotification(settings, booking) : { sent: false, error: 'Desactivado' },
  ]);

  return { email: emailResult, telegram: telegramResult };
}
