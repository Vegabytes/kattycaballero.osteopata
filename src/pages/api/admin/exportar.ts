export const prerender = false;

import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../lib/auth';

export const GET: APIRoute = async (context) => {
  const { request, locals } = context;
  // Verify admin session
  const valid = await isAuthenticated(context);
  if (!valid) {
    return new Response('No autorizado', { status: 401 });
  }
  const db = (locals as any).runtime.env.DB;

  const url = new URL(request.url);
  const tipo = url.searchParams.get('tipo') || 'citas';
  const mes = url.searchParams.get('mes'); // Optional: YYYY-MM filter

  try {
    let csv = '';
    let filename = '';

    if (tipo === 'pacientes') {
      const result = await db.prepare(
        'SELECT id, nombre, apellidos, telefono, email, fecha_nacimiento, direccion, notas, created_at FROM pacientes ORDER BY nombre'
      ).all();
      const rows = result.results as any[];

      csv = 'ID,Nombre,Apellidos,Telefono,Email,Fecha Nacimiento,Direccion,Notas,Fecha Alta\n';
      for (const r of rows) {
        csv += `${r.id},${esc(r.nombre)},${esc(r.apellidos)},${esc(r.telefono)},${esc(r.email)},${esc(r.fecha_nacimiento)},${esc(r.direccion)},${esc(r.notas)},${esc(r.created_at)}\n`;
      }
      filename = `pacientes_${new Date().toISOString().split('T')[0]}.csv`;

    } else {
      let query = `SELECT c.id, c.fecha, c.hora, c.duracion, c.servicio, c.estado, c.precio, c.notas,
                          p.nombre, p.apellidos, p.telefono
                   FROM citas c LEFT JOIN pacientes p ON c.paciente_id = p.id`;
      const binds: string[] = [];

      if (mes) {
        query += ' WHERE c.fecha LIKE ?';
        binds.push(mes + '%');
      }
      query += ' ORDER BY c.fecha DESC, c.hora ASC';

      const stmt = binds.length > 0 ? db.prepare(query).bind(...binds) : db.prepare(query);
      const result = await stmt.all();
      const rows = result.results as any[];

      csv = 'ID,Fecha,Hora,Duracion,Servicio,Estado,Precio,Paciente,Telefono,Notas\n';
      for (const r of rows) {
        csv += `${r.id},${r.fecha},${r.hora},${r.duracion},${esc(r.servicio)},${r.estado},${r.precio || ''},${esc(r.nombre + ' ' + (r.apellidos || ''))},${esc(r.telefono)},${esc(r.notas)}\n`;
      }
      filename = `citas_${mes || new Date().toISOString().split('T')[0]}.csv`;
    }

    // Add BOM for Excel UTF-8 compatibility
    const bom = '\uFEFF';

    return new Response(bom + csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};

function esc(val: any): string {
  if (val == null) return '';
  const s = String(val).replace(/"/g, '""');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
}
