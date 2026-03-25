export const prerender = false;

import type { APIRoute } from 'astro';
import { notifyNewBooking } from '../../lib/notifications';

// Rate limiting: max 5 bookings per IP per hour
const rateLimitMap = new Map<string, number[]>();
// Cleanup stale entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of rateLimitMap) {
    const valid = times.filter(t => now - t < 60 * 60 * 1000);
    if (valid.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, valid);
  }
}, 60 * 60 * 1000);

function toMinutes(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + (m || 0);
}

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
    if (attempts.length >= 5) {
      return new Response(
        JSON.stringify({ success: false, error: 'Demasiados intentos. Inténtalo de nuevo más tarde.' }),
        { status: 429, headers: { ...headers, 'Retry-After': '3600' } }
      );
    }
    attempts.push(now);
    rateLimitMap.set(ip, attempts);

    const body = await request.json();
    const { nombre, telefono, email, servicio, fecha, hora, duracion, notas, website } = body;

    // Honeypot check
    if (website) {
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers }
      );
    }

    // Validate required fields
    if (!nombre || !telefono || !fecha || !hora) {
      return new Response(
        JSON.stringify({ success: false, error: 'Faltan campos obligatorios: nombre, telefono, fecha, hora' }),
        { status: 400, headers }
      );
    }

    // Validate input length
    if (nombre.length > 100 || (servicio && servicio.length > 100) || (notas && notas.length > 2000) || telefono.length > 20 || (email && email.length > 100)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Texto demasiado largo' }),
        { status: 400, headers }
      );
    }

    const db = (locals as any).runtime.env.DB;

    // Look for existing patient by telefono
    const existing = await db
      .prepare('SELECT id FROM pacientes WHERE telefono = ?')
      .bind(telefono)
      .first();

    let pacienteId: number;

    if (existing) {
      pacienteId = existing.id as number;
      // Update email if patient didn't have one
      if (email) {
        await db.prepare('UPDATE pacientes SET email = ? WHERE id = ? AND (email IS NULL OR email = ?)').bind(email, pacienteId, '').run();
      }
    } else {
      // Split nombre into nombre/apellidos if there's a space
      const parts = nombre.trim().split(/\s+/);
      const primerNombre = parts[0];
      const apellidos = parts.length > 1 ? parts.slice(1).join(' ') : '';

      const insertResult = await db
        .prepare('INSERT INTO pacientes (nombre, apellidos, telefono, email) VALUES (?, ?, ?, ?)')
        .bind(primerNombre, apellidos, telefono, email || null)
        .run();

      pacienteId = insertResult.meta.last_row_id;
    }

    // Check for conflicts before creating (considering duration + 30 min buffer)
    const existingCitas = await db
      .prepare("SELECT hora, duracion FROM citas WHERE fecha = ? AND estado != 'cancelada'")
      .bind(fecha)
      .all();

    const newStart = toMinutes(hora);
    const newEnd = newStart + (duracion || 60) + 30; // +30 min buffer

    for (const row of (existingCitas.results || []) as { hora: string; duracion: number }[]) {
      const existStart = toMinutes(row.hora);
      const existEnd = existStart + (row.duracion || 60) + 30;
      if (newStart < existEnd && newEnd > existStart) {
        return new Response(
          JSON.stringify({ success: false, error: 'Esa hora ya esta reservada. Por favor elige otra.' }),
          { status: 409, headers }
        );
      }
    }

    // Create cita with estado='pendiente'
    const result = await db
      .prepare('INSERT INTO citas (paciente_id, fecha, hora, duracion, servicio, estado, notas) VALUES (?, ?, ?, ?, ?, \'pendiente\', ?)')
      .bind(pacienteId, fecha, hora, duracion || 60, servicio || null, notas || null)
      .run();

    const citaId = result.meta.last_row_id;

    // Send notifications (await before responding — Workers closes after Response)
    try {
      await notifyNewBooking(db, { nombre, telefono, email, servicio, fecha, hora, duracion: duracion || 60, notas }, citaId);
    } catch (e) {
      console.error('Notification error:', e);
    }

    return new Response(
      JSON.stringify({ success: true, citaId: result.meta.last_row_id }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error saving booking:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Error interno del servidor' }),
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
