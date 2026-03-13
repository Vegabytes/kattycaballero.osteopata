export const prerender = false;

import { isAuthenticated } from '../../lib/auth';

export async function GET(context: any) {
  const authenticated = await isAuthenticated(context);
  if (!authenticated) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const url = new URL(context.request.url);
  const fecha = url.searchParams.get('fecha');
  if (!fecha) {
    return new Response(JSON.stringify({ error: 'Falta parámetro fecha' }), { status: 400 });
  }

  try {
    const db = context.locals.runtime.env.DB;
    const rows = await db
      .prepare(`SELECT c.hora, c.duracion, c.servicio, c.estado, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos
        FROM citas c JOIN pacientes p ON c.paciente_id = p.id
        WHERE c.fecha = ? AND c.estado != 'cancelada'
        ORDER BY c.hora`)
      .bind(fecha)
      .all();

    return new Response(JSON.stringify(rows.results || []), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
