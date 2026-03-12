export const prerender = false;

import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../lib/auth';

function escapeCsv(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function toCsvRow(values: any[]): string {
  return values.map(escapeCsv).join(',');
}

export const GET: APIRoute = async (context) => {
  const { params, locals } = context;

  // Auth check
  const authenticated = await isAuthenticated(context);
  if (!authenticated) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const tipo = params.tipo;
  const db = (locals as any).runtime.env.DB;
  const today = new Date().toISOString().split('T')[0];

  try {
    let csvContent = '\uFEFF'; // BOM for Excel
    let filename = '';

    if (tipo === 'pacientes') {
      const headers = ['Nombre', 'Apellidos', 'Telefono', 'Email', 'Fecha Nacimiento', 'Direccion', 'Fecha Registro'];
      csvContent += toCsvRow(headers) + '\r\n';

      const { results } = await db
        .prepare('SELECT nombre, apellidos, telefono, email, fecha_nacimiento, direccion, created_at FROM pacientes ORDER BY apellidos, nombre')
        .all();

      for (const row of results as any[]) {
        csvContent += toCsvRow([
          row.nombre,
          row.apellidos,
          row.telefono,
          row.email,
          row.fecha_nacimiento,
          row.direccion,
          row.created_at,
        ]) + '\r\n';
      }

      filename = `pacientes_${today}.csv`;

    } else if (tipo === 'citas') {
      const headers = ['Fecha', 'Hora', 'Paciente', 'Servicio', 'Duracion (min)', 'Precio', 'Estado', 'Notas'];
      csvContent += toCsvRow(headers) + '\r\n';

      const { results } = await db
        .prepare(`SELECT c.fecha, c.hora, p.nombre, p.apellidos, c.servicio, c.duracion, c.precio, c.estado, c.notas
          FROM citas c JOIN pacientes p ON c.paciente_id = p.id
          ORDER BY c.fecha DESC, c.hora ASC`)
        .all();

      for (const row of results as any[]) {
        csvContent += toCsvRow([
          row.fecha,
          row.hora,
          `${row.nombre} ${row.apellidos}`,
          row.servicio,
          row.duracion,
          row.precio,
          row.estado,
          row.notas,
        ]) + '\r\n';
      }

      filename = `citas_${today}.csv`;

    } else if (tipo === 'ingresos') {
      const headers = ['Fecha', 'Paciente', 'Servicio', 'Precio'];
      csvContent += toCsvRow(headers) + '\r\n';

      const { results } = await db
        .prepare(`SELECT c.fecha, p.nombre, p.apellidos, c.servicio, c.precio
          FROM citas c JOIN pacientes p ON c.paciente_id = p.id
          WHERE c.estado = 'completada' AND c.precio IS NOT NULL
          ORDER BY c.fecha DESC`)
        .all();

      for (const row of results as any[]) {
        csvContent += toCsvRow([
          row.fecha,
          `${row.nombre} ${row.apellidos}`,
          row.servicio,
          row.precio,
        ]) + '\r\n';
      }

      filename = `ingresos_${today}.csv`;

    } else {
      return new Response(JSON.stringify({ error: 'Tipo de exportacion no valido. Usa: pacientes, citas, ingresos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error(`Error exporting ${tipo}:`, error);
    return new Response(JSON.stringify({ error: error.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
