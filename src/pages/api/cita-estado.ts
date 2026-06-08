export const prerender = false;

import { isAuthenticated, isSameOrigin } from '../../lib/auth';

export async function POST(context: any) {
  const authenticated = await isAuthenticated(context);
  if (!authenticated) {
    return new Response('No autorizado', { status: 401 });
  }

  if (!isSameOrigin(context.request)) {
    return new Response('Origen no permitido', { status: 403 });
  }

  try {
    const body = await context.request.json();
    const { id, estado, metodo_pago } = body;

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
    const metodosValidos = ['efectivo', 'bizum', 'tarjeta', 'transferencia'];
    if (metodo_pago && metodosValidos.includes(metodo_pago)) {
      await db.prepare('UPDATE citas SET estado = ?, metodo_pago = ? WHERE id = ?').bind(estado, metodo_pago, id).run();
    } else {
      await db.prepare('UPDATE citas SET estado = ? WHERE id = ?').bind(estado, id).run();
    }

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
