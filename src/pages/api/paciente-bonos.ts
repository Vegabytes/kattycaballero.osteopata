export const prerender = false;

import { isAuthenticated } from '../../lib/auth';

export async function GET(context: any) {
  const authenticated = await isAuthenticated(context);
  if (!authenticated) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const url = new URL(context.request.url);
  const pacienteId = url.searchParams.get('id');
  if (!pacienteId) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = context.locals.runtime.env.DB;
    const rows = await db
      .prepare(
        `SELECT id, nombre, sesiones_total, sesiones_usadas, estado, fecha_caducidad
         FROM bonos WHERE paciente_id = ? AND estado = 'activo'
         ORDER BY fecha_compra DESC`
      )
      .bind(Number(pacienteId))
      .all();

    return new Response(JSON.stringify(rows.results || []), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
