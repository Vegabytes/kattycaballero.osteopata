export const prerender = false;

import type { APIRoute } from 'astro';
import { notifyNewBooking } from '../../lib/notifications';

export const POST: APIRoute = async ({ request, locals }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': new URL(request.url).origin,
  };

  try {
    const body = await request.json();
    const { nombre, telefono, email, servicio, fecha, hora, duracion, notas } = body;

    // Validate required fields
    if (!nombre || !telefono || !fecha || !hora) {
      return new Response(
        JSON.stringify({ success: false, error: 'Faltan campos obligatorios: nombre, telefono, fecha, hora' }),
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

    // Create cita with estado='pendiente'
    const result = await db
      .prepare('INSERT INTO citas (paciente_id, fecha, hora, duracion, servicio, estado, notas) VALUES (?, ?, ?, ?, ?, \'pendiente\', ?)')
      .bind(pacienteId, fecha, hora, duracion || 60, servicio || null, notas || null)
      .run();

    // Send notifications (await before responding — Workers closes after Response)
    try {
      await notifyNewBooking(db, { nombre, telefono, email, servicio, fecha, hora, duracion: duracion || 60, notas });
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
