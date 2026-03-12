export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': new URL(request.url).origin,
  };

  try {
    const body = await request.json();
    const { nombre, telefono, servicio, fecha, hora, duracion, notas } = body;

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
    } else {
      // Split nombre into nombre/apellidos if there's a space
      const parts = nombre.trim().split(/\s+/);
      const primerNombre = parts[0];
      const apellidos = parts.length > 1 ? parts.slice(1).join(' ') : '';

      const insertResult = await db
        .prepare('INSERT INTO pacientes (nombre, apellidos, telefono) VALUES (?, ?, ?)')
        .bind(primerNombre, apellidos, telefono)
        .run();

      pacienteId = insertResult.meta.last_row_id;
    }

    // Create cita with estado='pendiente'
    const result = await db
      .prepare('INSERT INTO citas (paciente_id, fecha, hora, duracion, servicio, estado, notas) VALUES (?, ?, ?, ?, ?, \'pendiente\', ?)')
      .bind(pacienteId, fecha, hora, duracion || 60, servicio || null, notas || null)
      .run();

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
