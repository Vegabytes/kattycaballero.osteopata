/**
 * Notification system for bookings
 * - Admin alerts: Email (Resend) + Telegram to Katy
 * - Patient confirmation: Email to patient
 * - Google Calendar link in notifications
 */

interface BookingData {
  nombre: string;
  telefono: string;
  email?: string;
  servicio: string;
  fecha: string;
  hora: string;
  duracion: number;
  notas?: string;
}

interface NotifyResult {
  email: { sent: boolean; error?: string };
  telegram: { sent: boolean; error?: string };
  patientEmail: { sent: boolean; error?: string };
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
  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const d = new Date(fecha + 'T00:00:00');
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
}

// === GOOGLE CALENDAR URL ===

function generateGoogleCalendarUrl(booking: BookingData): string {
  const [hh, mm] = booking.hora.split(':').map(Number);
  const startDate = new Date(booking.fecha + 'T00:00:00');
  startDate.setHours(hh, mm, 0);

  const endDate = new Date(startDate.getTime() + booking.duracion * 60000);

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${y}${mo}${da}T${h}${mi}00`;
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${booking.servicio || 'Cita'} - ${booking.nombre}`,
    dates: `${fmt(startDate)}/${fmt(endDate)}`,
    details: `Paciente: ${booking.nombre}\nTelefono: ${booking.telefono}${booking.email ? '\nEmail: ' + booking.email : ''}${booking.notas ? '\nNotas: ' + booking.notas : ''}`,
    location: 'C/ Rio Guadarrama 2, 28430 Alpedrete, Madrid',
    ctz: 'Europe/Madrid',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// === ADMIN EMAIL (Resend) ===

async function sendEmailNotification(settings: Record<string, string>, booking: BookingData): Promise<{ sent: boolean; error?: string }> {
  const apiKey = settings.email_api_key;
  const adminEmail = settings.notificacion_email_destino || settings.email_clinica;
  const emailFrom = settings.email_from || 'Katy Caballero <onboarding@resend.dev>';

  if (!apiKey || !adminEmail) {
    return { sent: false, error: 'Email no configurado' };
  }

  const fechaDisplay = formatFechaES(booking.fecha);
  const calendarUrl = generateGoogleCalendarUrl(booking);

  const html = `<!DOCTYPE html>
<html lang="es"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#f5f5f5;">
<div style="max-width:500px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:#4a6548;padding:18px 24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:18px;font-weight:500;">Nueva reserva web</h1>
  </div>
  <div style="padding:24px;line-height:1.7;color:#333;font-size:14px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;color:#888;width:100px;">Paciente</td><td style="padding:6px 0;font-weight:600;">${booking.nombre}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Telefono</td><td style="padding:6px 0;"><a href="tel:${booking.telefono}" style="color:#4a6548;">${booking.telefono}</a></td></tr>
      ${booking.email ? `<tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;">${booking.email}</td></tr>` : ''}
      <tr><td style="padding:6px 0;color:#888;">Servicio</td><td style="padding:6px 0;">${booking.servicio || 'No especificado'}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Fecha</td><td style="padding:6px 0;font-weight:600;">${fechaDisplay}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Hora</td><td style="padding:6px 0;font-weight:600;">${booking.hora}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Duracion</td><td style="padding:6px 0;">${booking.duracion} min</td></tr>
      ${booking.notas ? `<tr><td style="padding:6px 0;color:#888;">Notas</td><td style="padding:6px 0;">${booking.notas}</td></tr>` : ''}
    </table>
    <div style="margin-top:20px;text-align:center;">
      <a href="https://katycaballeroosteopata.com/admin/citas" style="display:inline-block;padding:10px 24px;background:#4a6548;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Ver en el panel</a>
      <a href="${calendarUrl}" style="display:inline-block;padding:10px 24px;background:#4285f4;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;margin-left:8px;">Agregar al calendario</a>
    </div>
  </div>
  <div style="padding:12px 24px;background:#f9f9f9;text-align:center;font-size:11px;color:#999;">
    Katy Caballero - Osteopata y Masajista - Alpedrete
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
        subject: `Nueva reserva: ${booking.nombre} - ${fechaDisplay} ${booking.hora}`,
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
  const calendarUrl = generateGoogleCalendarUrl(booking);
  const waUrl = `https://wa.me/34${booking.telefono.replace(/\D/g, '').replace(/^34/, '')}`;

  const text = [
    `Nueva reserva web`,
    ``,
    `Paciente: ${booking.nombre}`,
    `Telefono: ${booking.telefono}`,
    booking.email ? `Email: ${booking.email}` : '',
    `Servicio: ${booking.servicio || 'No especificado'}`,
    `Fecha: ${fechaDisplay}`,
    `Hora: ${booking.hora}`,
    `Duracion: ${booking.duracion} min`,
    booking.notas ? `Notas: ${booking.notas}` : '',
    ``,
    `WhatsApp paciente: ${waUrl}`,
    `Agregar al calendario: ${calendarUrl}`,
  ].filter(Boolean).join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
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

// === PATIENT CONFIRMATION EMAIL ===

async function sendPatientConfirmation(settings: Record<string, string>, booking: BookingData): Promise<{ sent: boolean; error?: string }> {
  const apiKey = settings.email_api_key;
  const emailFrom = settings.email_from || 'Katy Caballero <onboarding@resend.dev>';

  if (!apiKey || !booking.email) {
    return { sent: false, error: booking.email ? 'Email no configurado' : 'Paciente sin email' };
  }

  const fechaDisplay = formatFechaES(booking.fecha);

  const html = `<!DOCTYPE html>
<html lang="es"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:0;background:#f5f5f5;">
<div style="max-width:500px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:#4a6548;padding:18px 24px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:18px;font-weight:500;">Confirmacion de tu cita</h1>
  </div>
  <div style="padding:24px;line-height:1.7;color:#333;font-size:14px;">
    <p style="margin:0 0 16px;">Hola ${booking.nombre.split(' ')[0]},</p>
    <p style="margin:0 0 16px;">He recibido tu solicitud de cita. Te confirmare la disponibilidad por telefono o WhatsApp en las proximas horas.</p>
    <div style="background:#f8f6f0;border-radius:10px;padding:16px;border-left:4px solid #4a6548;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#888;width:90px;">Servicio</td><td style="padding:4px 0;font-weight:600;">${booking.servicio || 'No especificado'}</td></tr>
        <tr><td style="padding:4px 0;color:#888;">Fecha</td><td style="padding:4px 0;font-weight:600;">${fechaDisplay}</td></tr>
        <tr><td style="padding:4px 0;color:#888;">Hora</td><td style="padding:4px 0;font-weight:600;">${booking.hora}</td></tr>
        <tr><td style="padding:4px 0;color:#888;">Duracion</td><td style="padding:4px 0;">${booking.duracion} min</td></tr>
      </table>
    </div>
    <div style="margin-top:20px;padding:14px;background:#f0f5f0;border-radius:10px;">
      <p style="margin:0;font-size:13px;color:#555;"><strong>Direccion:</strong> C/ Rio Guadarrama 2, 28430 Alpedrete (Madrid)</p>
      <p style="margin:6px 0 0;font-size:13px;color:#555;"><strong>Contacto:</strong> <a href="https://wa.me/34643961065" style="color:#25D366;">643 961 065 (WhatsApp)</a></p>
    </div>
    <p style="margin:20px 0 0;font-size:13px;color:#888;text-align:center;">Si necesitas cancelar o cambiar la cita, avisame con al menos 24h de antelacion.</p>
  </div>
  <div style="padding:12px 24px;background:#f9f9f9;text-align:center;font-size:11px;color:#999;">
    Katy Caballero - Osteopata y Masajista - Alpedrete
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
        to: [booking.email],
        subject: `Tu cita: ${fechaDisplay} a las ${booking.hora} - Katy Caballero`,
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

function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

// === MAIN FUNCTION ===

export async function notifyNewBooking(db: any, booking: BookingData): Promise<NotifyResult> {
  const settings = await getNotifySettings(db);

  const emailEnabled = settings.notificacion_email_activo === 'true';
  const telegramEnabled = settings.notificacion_telegram_activo === 'true';

  const [emailResult, telegramResult, patientResult] = await Promise.all([
    emailEnabled ? sendEmailNotification(settings, booking) : { sent: false, error: 'Desactivado' },
    telegramEnabled ? sendTelegramNotification(settings, booking) : { sent: false, error: 'Desactivado' },
    booking.email ? sendPatientConfirmation(settings, booking) : { sent: false, error: 'Sin email' },
  ]);

  return { email: emailResult, telegram: telegramResult, patientEmail: patientResult };
}
