export const prerender = false;

import { isAuthenticated } from '../../lib/auth';

export async function GET(context: any) {
  const authenticated = await isAuthenticated(context);
  if (!authenticated) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  const url = new URL(context.request.url);
  const q = url.searchParams.get('q')?.trim();
  if (!q || q.length < 3) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = context.locals.runtime.env.DB;
    const rows = await db
      .prepare(
        `SELECT id, nombre, apellidos, telefono FROM pacientes
         WHERE nombre LIKE ? OR apellidos LIKE ? OR telefono LIKE ?
         LIMIT 5`
      )
      .bind(`%${q}%`, `%${q}%`, `%${q}%`)
      .all();

    return new Response(JSON.stringify(rows.results || []), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
