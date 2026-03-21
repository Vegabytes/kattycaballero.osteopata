import type { APIRoute } from 'astro';

// Default schedule (matches current hardcoded behavior)
const DEFAULT_HORARIO = {
  lunes:    { activo: true, inicio: '09:00', fin: '20:00' },
  martes:   { activo: true, inicio: '09:00', fin: '20:00' },
  miercoles:{ activo: true, inicio: '09:00', fin: '20:00' },
  jueves:   { activo: true, inicio: '09:00', fin: '20:00' },
  viernes:  { activo: true, inicio: '09:00', fin: '20:00' },
  sabado:   { activo: true, inicio: '10:00', fin: '14:00' },
  domingo:  { activo: false, inicio: '00:00', fin: '00:00' },
};

// Day index (JS getDay()) to day name mapping
const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = (locals as any).runtime.env.DB;

    // Fetch schedule and blocked dates from configuracion
    const rows = await db.prepare(
      "SELECT clave, valor FROM configuracion WHERE clave IN ('horario_semanal', 'dias_bloqueados')"
    ).all();

    let horario = DEFAULT_HORARIO;
    let diasBloqueados: string[] = [];

    for (const row of (rows.results || []) as { clave: string; valor: string }[]) {
      if (row.clave === 'horario_semanal') {
        try { horario = JSON.parse(row.valor); } catch {}
      } else if (row.clave === 'dias_bloqueados') {
        try { diasBloqueados = JSON.parse(row.valor); } catch {}
      }
    }

    return new Response(JSON.stringify({ horario, diasBloqueados, dias: DAY_NAMES }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5 min cache
      },
    });
  } catch (e: any) {
    // Fallback to defaults if DB not available
    return new Response(JSON.stringify({
      horario: DEFAULT_HORARIO,
      diasBloqueados: [],
      dias: DAY_NAMES,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
