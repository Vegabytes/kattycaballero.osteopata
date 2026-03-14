export const prerender = false;

import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../lib/auth';

export const GET: APIRoute = async (context) => {
  const { request, locals } = context;

  const valid = await isAuthenticated(context);
  if (!valid) {
    return new Response('No autorizado', { status: 401 });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response('Falta el parametro id', { status: 400 });
  }

  const db = (locals as any).runtime.env.DB;

  try {
    const cita = await db.prepare(
      `SELECT c.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos
       FROM citas c
       LEFT JOIN pacientes p ON c.paciente_id = p.id
       WHERE c.id = ?`
    ).bind(Number(id)).first();

    if (!cita) {
      return new Response('Cita no encontrada', { status: 404 });
    }

    const duracion = cita.duracion || 60;
    const servicio = cita.servicio || 'Consulta';
    const pacienteNombre = [cita.paciente_nombre, cita.paciente_apellidos].filter(Boolean).join(' ');
    const summary = `${servicio} - ${pacienteNombre}`;
    const location = 'Calle Rio Guadarrama 2, Alpedrete, Madrid, Spain';

    // Parse date and time
    // cita.fecha = 'YYYY-MM-DD', cita.hora = 'HH:MM'
    const fecha = (cita.fecha as string).replace(/-/g, '');
    const horaParts = (cita.hora as string).split(':');
    const horaStart = horaParts[0].padStart(2, '0') + horaParts[1].padStart(2, '0') + '00';

    // Calculate end time
    const startDate = new Date(`${cita.fecha}T${cita.hora}:00`);
    const endDate = new Date(startDate.getTime() + duracion * 60 * 1000);
    const horaEnd = endDate.getHours().toString().padStart(2, '0')
      + endDate.getMinutes().toString().padStart(2, '0') + '00';
    const fechaEnd = endDate.toISOString().split('T')[0].replace(/-/g, '');

    const now = new Date();
    const dtstamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const notas = cita.notas ? (cita.notas as string).replace(/\n/g, '\\n') : '';

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Katy Caballero Osteopatia//Admin//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${fecha}T${horaStart}`,
      `DTEND:${fechaEnd}T${horaEnd}`,
      `DTSTAMP:${dtstamp}`,
      `UID:cita-${id}@katycaballeroosteopata.com`,
      `SUMMARY:${escIcs(summary)}`,
      `LOCATION:${escIcs(location)}`,
      ...(notas ? [`DESCRIPTION:${escIcs(notas)}`] : []),
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const filename = `cita-${id}-${cita.fecha}.ics`;

    return new Response(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

function escIcs(val: string): string {
  return val
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}
