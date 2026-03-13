/**
 * Cloudflare Cron Worker: Daily reminders & review requests
 * Runs daily at 10:00 UTC (11:00/12:00 Madrid time)
 *
 * 1. Sends 24h reminders for tomorrow's appointments
 * 2. Sends review requests for completed appointments (2 days after)
 */

interface Env {
  DB: D1Database;
}

interface Settings {
  [key: string]: string;
}

interface Cita {
  id: number;
  fecha: string;
  hora: string;
  duracion: number;
  servicio: string;
  estado: string;
  notas: string | null;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string | null;
}

async function getSettings(db: D1Database): Promise<Settings> {
  const rows = (await db.prepare('SELECT clave, valor FROM configuracion').all()).results as { clave: string; valor: string }[];
  const settings: Settings = {};
  for (const row of rows) settings[row.clave] = row.valor;
  return settings;
}

function formatFechaES(fecha: string): string {
  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const d = new Date(fecha + 'T00:00:00');
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
}

function getDateInMadrid(offsetDays: number = 0): string {
  const now = new Date();
  // Approximate Madrid timezone: UTC+1 (winter) or UTC+2 (summer)
  const madridOffset = isSummerTime(now) ? 2 : 1;
  const madrid = new Date(now.getTime() + madridOffset * 3600000);
  madrid.setDate(madrid.getDate() + offsetDays);
  return madrid.toISOString().split('T')[0];
}

function isSummerTime(date: Date): boolean {
  // DST in Europe: last Sunday of March to last Sunday of October
  const year = date.getUTCFullYear();
  const marchLast = new Date(Date.UTC(year, 2, 31));
  const dstStart = new Date(Date.UTC(year, 2, 31 - marchLast.getUTCDay(), 1));
  const octLast = new Date(Date.UTC(year, 9, 31));
  const dstEnd = new Date(Date.UTC(year, 9, 31 - octLast.getUTCDay(), 1));
  return date.getTime() >= dstStart.getTime() && date.getTime() < dstEnd.getTime();
}

// === TELEGRAM ===

async function sendTelegram(botToken: string, chatId: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// === EMAIL (Resend) ===

async function sendEmail(apiKey: string, from: string, to: string, subject: string, html: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// === REMINDERS (24h before) ===

async function processReminders(db: D1Database, settings: Settings): Promise<string[]> {
  const tomorrow = getDateInMadrid(1);
  const logs: string[] = [];

  const citas = (await db.prepare(
    `SELECT c.id, c.fecha, c.hora, c.duracion, c.servicio, c.estado, c.notas,
            p.nombre, p.apellidos, p.telefono, p.email
     FROM citas c JOIN pacientes p ON c.paciente_id = p.id
     WHERE c.fecha = ? AND c.estado IN ('pendiente', 'confirmada') AND c.recordatorio_enviado = 0`
  ).bind(tomorrow).all()).results as Cita[];

  if (citas.length === 0) {
    logs.push('Recordatorios: no hay citas para manana');
    return logs;
  }

  logs.push(`Recordatorios: ${citas.length} citas para manana (${tomorrow})`);

  const botToken = settings.telegram_bot_token;
  const chatId = settings.telegram_chat_id;
  const apiKey = settings.email_api_key;
  const emailFrom = settings.email_from || 'Katy Caballero <onboarding@resend.dev>';

  // Send summary to Katy via Telegram
  if (botToken && chatId) {
    const lines = citas.map(c =>
      `- ${c.hora} ${c.nombre} ${c.apellidos} (${c.servicio || 'sin servicio'}) Tel: ${c.telefono}`
    );
    const text = `Citas de manana ${formatFechaES(tomorrow)}:\n\n${lines.join('\n')}`;
    await sendTelegram(botToken, chatId, text);
    logs.push('Telegram a Katy: enviado');
  }

  // Send individual reminders to patients with email
  for (const cita of citas) {
    if (cita.email && apiKey) {
      const fechaDisplay = formatFechaES(cita.fecha);
      const html = `<!DOCTYPE html>
<html lang="es"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#f5f5f5;">
<div style="max-width:500px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:#4a6548;padding:18px 24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:18px;font-weight:500;">Recordatorio de tu cita</h1>
  </div>
  <div style="padding:24px;line-height:1.7;color:#333;font-size:14px;">
    <p>Hola ${cita.nombre},</p>
    <p>Te recuerdo que manana tienes cita:</p>
    <div style="background:#f8f6f0;border-radius:10px;padding:16px;border-left:4px solid #4a6548;">
      <strong>${cita.servicio || 'Cita'}</strong><br>
      ${fechaDisplay} a las ${cita.hora}<br>
      Duracion: ${cita.duracion} min
    </div>
    <p style="margin-top:16px;font-size:13px;color:#555;"><strong>Direccion:</strong> C/ Rio Guadarrama 2, 28430 Alpedrete</p>
    <p style="font-size:13px;color:#888;">Si no puedes asistir, avisame con antelacion al <a href="https://wa.me/34643961065" style="color:#25D366;">643 961 065</a></p>
  </div>
</div>
</body></html>`;

      const sent = await sendEmail(apiKey, emailFrom, cita.email,
        `Recordatorio: tu cita manana ${cita.hora} - Katy Caballero`, html);
      logs.push(`Email recordatorio a ${cita.nombre}: ${sent ? 'ok' : 'error'}`);
    }

    // Mark as sent
    await db.prepare('UPDATE citas SET recordatorio_enviado = 1 WHERE id = ?').bind(cita.id).run();
  }

  return logs;
}

// === REVIEW REQUESTS (2 days after completed appointment) ===

async function processReviewRequests(db: D1Database, settings: Settings): Promise<string[]> {
  const twoDaysAgo = getDateInMadrid(-2);
  const logs: string[] = [];

  const citas = (await db.prepare(
    `SELECT c.id, c.fecha, c.hora, c.servicio, p.nombre, p.apellidos, p.telefono, p.email
     FROM citas c JOIN pacientes p ON c.paciente_id = p.id
     WHERE c.fecha = ? AND c.estado = 'completada' AND c.review_enviado = 0`
  ).bind(twoDaysAgo).all()).results as Cita[];

  if (citas.length === 0) {
    logs.push('Reviews: no hay citas completadas de hace 2 dias');
    return logs;
  }

  logs.push(`Reviews: ${citas.length} citas completadas el ${twoDaysAgo}`);

  const botToken = settings.telegram_bot_token;
  const chatId = settings.telegram_chat_id;
  const apiKey = settings.email_api_key;
  const emailFrom = settings.email_from || 'Katy Caballero <onboarding@resend.dev>';
  const googleReviewUrl = settings.google_review_url || 'https://g.page/r/review';

  for (const cita of citas) {
    // Send review request email to patient
    if (cita.email && apiKey) {
      const html = `<!DOCTYPE html>
<html lang="es"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#f5f5f5;">
<div style="max-width:500px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:#4a6548;padding:18px 24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:18px;font-weight:500;">Como te encuentras?</h1>
  </div>
  <div style="padding:24px;line-height:1.7;color:#333;font-size:14px;">
    <p>Hola ${cita.nombre},</p>
    <p>Espero que te encuentres bien despues de tu sesion de ${cita.servicio || 'tratamiento'}.</p>
    <p>Si la experiencia fue positiva, me ayudaria mucho que dejaras una resena en Google. Solo te llevara un momento:</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${googleReviewUrl}" style="display:inline-block;padding:12px 28px;background:#4a6548;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Dejar resena en Google</a>
    </div>
    <p style="font-size:13px;color:#888;text-align:center;">Gracias por confiar en mi. Nos vemos pronto!</p>
  </div>
</div>
</body></html>`;

      const sent = await sendEmail(apiKey, emailFrom, cita.email,
        `Como fue tu sesion? - Katy Caballero`, html);
      logs.push(`Email review a ${cita.nombre}: ${sent ? 'ok' : 'error'}`);
    }

    // Notify Katy via Telegram with WhatsApp link to send manually
    if (botToken && chatId && !cita.email) {
      const phone = cita.telefono.replace(/\D/g, '').replace(/^34/, '');
      const waText = encodeURIComponent(`Hola ${cita.nombre}! Espero que te encuentres bien despues de tu sesion. Si tienes un momento, me ayudaria mucho una resena en Google: ${googleReviewUrl} Gracias!`);
      const waUrl = `https://wa.me/34${phone}?text=${waText}`;
      await sendTelegram(botToken, chatId,
        `Pedir resena a ${cita.nombre} ${cita.apellidos} (sin email):\n${waUrl}`);
      logs.push(`Telegram review link para ${cita.nombre}`);
    }

    await db.prepare('UPDATE citas SET review_enviado = 1 WHERE id = ?').bind(cita.id).run();
  }

  return logs;
}

// === WORKER ENTRY ===

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const settings = await getSettings(env.DB);
    const logs: string[] = [];

    const reminderLogs = await processReminders(env.DB, settings);
    logs.push(...reminderLogs);

    const reviewLogs = await processReviewRequests(env.DB, settings);
    logs.push(...reviewLogs);

    console.log('Cron completed:', logs.join(' | '));
  },

  // Allow manual trigger via HTTP for testing
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');
    if (secret !== 'katy-cron-2024') {
      return new Response('Unauthorized', { status: 401 });
    }

    const settings = await getSettings(env.DB);
    const logs: string[] = [];

    const reminderLogs = await processReminders(env.DB, settings);
    logs.push(...reminderLogs);

    const reviewLogs = await processReviewRequests(env.DB, settings);
    logs.push(...reviewLogs);

    return new Response(JSON.stringify({ logs }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
