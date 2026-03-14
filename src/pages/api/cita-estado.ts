export const prerender = false;

import { isAuthenticated } from '../../lib/auth';

export async function POST(context: any) {
  const authenticated = await isAuthenticated(context);
  if (!authenticated) {
    return new Response('No autorizado', { status: 401 });
  }

  try {
    const body = await context.request.json();
    const { id, estado } = body;

    if (!id || !estado) {
      return new Response(JSON.stringify({ error: 'id y estado requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const estadosValidos = ['pendiente', 'confirmada', 'completada', 'cancelada', 'no_show'];
    if (!estadosValidos.includes(estado)) {
      return new Response(JSON.stringify({ error: 'Estado no válido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = context.locals.runtime.env.DB;
    await db.prepare('UPDATE citas SET estado = ? WHERE id = ?').bind(estado, id).run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
