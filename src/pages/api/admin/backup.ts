export const prerender = false;

import { isAuthenticated } from '../../../lib/auth';

export async function GET(context: any) {
  const authenticated = await isAuthenticated(context);
  if (!authenticated) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = (context.locals as any).runtime.env.DB;

    const tables = ['pacientes', 'citas', 'tratamientos', 'notas_clinicas', 'bonos', 'configuracion'];
    const backup: Record<string, any[]> = {};

    for (const table of tables) {
      try {
        const result = await db.prepare(`SELECT * FROM ${table}`).all();
        backup[table] = result.results || [];
      } catch (e: any) {
        // Table might not exist, include empty array
        backup[table] = [];
      }
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `backup-${dateStr}.json`;

    const data = {
      fecha_backup: now.toISOString(),
      version: '1.0',
      tablas: backup,
    };

    return new Response(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store',
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: `Error generando backup: ${e.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
