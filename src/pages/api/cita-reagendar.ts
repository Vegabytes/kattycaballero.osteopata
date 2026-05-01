export const prerender = false;

import type { APIRoute } from 'astro';
import { verifyCitaToken } from '../../lib/cita-token';

function toMinutes(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + (m || 0);
}

async function notifyKaty(env: any, action: 'reagendada' | 'cancelada', cita: any, paciente: any, extra?: { fecha?: string; hora?: string }) {
  try {
    const settings: Record<string, string> = {};
    const rows = (await env.DB.prepare('SELECT clave, valor FROM configuracion').all()).results as { clave: string; valor: string }[];
    for (const r of rows) settings[r.clave] = r.valor;
    const botToken = settings.telegram_bot_token;
    const chatId = settings.telegram_chat_id;
    if (!botToken || !chatId) return;

    let text: string;
    if (action === 'cancelada') {
      text = [
        '❌ Cita cancelada por el paciente',
        '',
        `${paciente.nombre} ${paciente.apellidos}`,
        `Tel: ${paciente.telefono}`,
        `Fecha original: ${cita.fecha} ${cita.hora}`,
        cita.servicio ? `Servicio: ${cita.servicio}` : '',
      ].filter(Boolean).join('\n');
    } else {
      text = [
        '🔄 Cita reagendada por el paciente',
        '',
        `${paciente.nombre} ${paciente.apellidos}`,
        `Tel: ${paciente.telefono}`,
        `Antes: ${cita.fecha} ${cita.hora}`,
        `Ahora: ${extra?.fecha} ${extra?.hora}`,
        cita.servicio ? `Servicio: ${cita.servicio}` : '',
      ].filter(Boolean).join('\n');
    }

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
  } catch (e) {
    console.error('notifyKaty error:', e);
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const env = (locals as any).runtime.env;
    const secret = env.BOOKING_TOKEN_SECRET;
    if (!secret) {
      return new Response(JSON.stringify({ ok: false, error: 'Reagendar no configurado' }), { status: 503, headers });
    }

    const body = await request.json();
    const { token, action, fecha, hora } = body;
    if (!token || !action) {
      return new Response(JSON.stringify({ ok: false, error: 'Faltan datos' }), { status: 400, headers });
    }

    const citaId = await verifyCitaToken(String(token), secret);
    if (!citaId) {
      return new Response(JSON.stringify({ ok: false, error: 'Enlace no válido' }), { status: 403, headers });
    }

    const db = env.DB;
    const cita = await db.prepare(
      `SELECT c.*, p.nombre, p.apellidos, p.telefono
       FROM citas c JOIN pacientes p ON c.paciente_id = p.id
       WHERE c.id = ?`,
    ).bind(citaId).first() as any;

    if (!cita) {
      return new Response(JSON.stringify({ ok: false, error: 'Cita no encontrada' }), { status: 404, headers });
    }
    if (cita.estado === 'cancelada' || cita.estado === 'completada' || cita.estado === 'no_show') {
      return new Response(JSON.stringify({ ok: false, error: 'Esta cita ya no se puede modificar' }), { status: 409, headers });
    }
    // No allow modifying past appointments
    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];
    if (cita.fecha < todayISO) {
      return new Response(JSON.stringify({ ok: false, error: 'Esta cita ya ha pasado' }), { status: 409, headers });
    }

    const paciente = { nombre: cita.nombre, apellidos: cita.apellidos, telefono: cita.telefono };

    if (action === 'cancel') {
      await db.prepare("UPDATE citas SET estado = 'cancelada' WHERE id = ?").bind(citaId).run();
      await notifyKaty(env, 'cancelada', cita, paciente);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    if (action === 'reschedule') {
      if (!fecha || !hora || !/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora)) {
        return new Response(JSON.stringify({ ok: false, error: 'Fecha u hora no válidas' }), { status: 400, headers });
      }
      if (fecha < todayISO) {
        return new Response(JSON.stringify({ ok: false, error: 'No puedes elegir una fecha pasada' }), { status: 400, headers });
      }

      // Conflict check (same logic as /api/reservar) — exclude self
      const others = await db.prepare(
        "SELECT id, hora, duracion FROM citas WHERE fecha = ? AND estado != 'cancelada' AND id != ?",
      ).bind(fecha, citaId).all();
      const newStart = toMinutes(hora);
      const newEnd = newStart + (cita.duracion || 60) + 30;
      for (const row of (others.results || []) as { id: number; hora: string; duracion: number }[]) {
        const oStart = toMinutes(row.hora);
        const oEnd = oStart + (row.duracion || 60) + 30;
        if (newStart < oEnd && newEnd > oStart) {
          return new Response(JSON.stringify({ ok: false, error: 'Esa hora ya está reservada. Elige otra.' }), { status: 409, headers });
        }
      }

      await db.prepare("UPDATE citas SET fecha = ?, hora = ?, estado = 'pendiente' WHERE id = ?").bind(fecha, hora, citaId).run();
      await notifyKaty(env, 'reagendada', cita, paciente, { fecha, hora });
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ ok: false, error: 'Acción no válida' }), { status: 400, headers });
  } catch (e: any) {
    console.error('cita-reagendar error:', e);
    return new Response(JSON.stringify({ ok: false, error: 'Error interno' }), { status: 500, headers });
  }
};
