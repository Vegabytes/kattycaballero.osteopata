export const prerender = false;

import type { APIRoute } from 'astro';
import { isAuthenticated, isSameOrigin } from '../../lib/auth';

export const POST: APIRoute = async (context) => {
  const { request, locals } = context;

  const authenticated = await isAuthenticated(context);
  if (!authenticated) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  if (!isSameOrigin(request)) {
    return new Response(JSON.stringify({ error: 'Origen no permitido' }), { status: 403 });
  }

  try {
    const body = await request.json();
    const { paciente_id, servicio, duracion, precio, hora, fecha_inicio, frecuencia_dias, cantidad } = body;

    if (!paciente_id || !fecha_inicio || !hora || !frecuencia_dias || !cantidad) {
      return new Response(JSON.stringify({ error: 'Faltan campos obligatorios' }), { status: 400 });
    }

    if (cantidad < 1 || cantidad > 12) {
      return new Response(JSON.stringify({ error: 'Cantidad debe ser entre 1 y 12' }), { status: 400 });
    }

    const db = (locals as any).runtime.env.DB;
    const creadas: string[] = [];

    for (let i = 0; i < cantidad; i++) {
      const fecha = new Date(fecha_inicio + 'T00:00:00');
      fecha.setDate(fecha.getDate() + frecuencia_dias * (i + 1));
      const fechaStr = fecha.toISOString().split('T')[0];

      await db.prepare(
        'INSERT INTO citas (paciente_id, fecha, hora, duracion, servicio, estado, precio) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        paciente_id,
        fechaStr,
        hora,
        duracion || 60,
        servicio || null,
        'pendiente',
        precio || null
      ).run();

      creadas.push(fechaStr);
    }

    return new Response(JSON.stringify({ ok: true, creadas }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[citas-recurrentes]', e);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};
