export const prerender = false;

import { isAuthenticated } from '../../lib/auth';

export async function POST(context: any) {
  const authenticated = await isAuthenticated(context);
  if (!authenticated) {
    return new Response('No autorizado', { status: 401 });
  }

  try {
    const body = await context.request.json();
    const { nombre, apellidos, telefono } = body;

    if (!nombre || !apellidos) {
      return new Response(JSON.stringify({ error: 'Nombre y apellidos requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = context.locals.runtime.env.DB;
    const result = await db.prepare(
      'INSERT INTO pacientes (nombre, apellidos, telefono) VALUES (?, ?, ?)'
    ).bind(nombre, apellidos, telefono || null).run();

    const id = result.meta?.last_row_id;

    return new Response(JSON.stringify({ ok: true, id, nombre, apellidos }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
