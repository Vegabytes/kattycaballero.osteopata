export const prerender = false;

import type { APIRoute } from 'astro';

// Default schedule (matches current hardcoded behavior)
const DEFAULT_HORARIO = {
  lunes:    { activo: true, inicio: '09:00', fin: '19:30' },
  martes:   { activo: true, inicio: '09:00', fin: '19:30' },
  miercoles:{ activo: true, inicio: '09:00', fin: '19:30' },
  jueves:   { activo: true, inicio: '09:00', fin: '19:30' },
  viernes:  { activo: true, inicio: '09:00', fin: '19:30' },
  sabado:   { activo: true, inicio: '10:00', fin: '13:30' },
  domingo:  { activo: false, inicio: '00:00', fin: '00:00' },
};

// Day index (JS getDay()) to day name mapping
const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = (locals as any).runtime.env.DB;

    // Fetch schedule, blocked dates, and blocked hours from configuracion
    const rows = await db.prepare(
      "SELECT clave, valor FROM configuracion WHERE clave IN ('horario_semanal', 'dias_bloqueados', 'horas_bloqueadas')"
    ).all();

    let horario = DEFAULT_HORARIO;
    let diasBloqueados: string[] = [];
    let horasBloqueadas: { fecha: string; inicio: string; fin: string; motivo?: string }[] = [];

    for (const row of (rows.results || []) as { clave: string; valor: string }[]) {
      if (row.clave === 'horario_semanal') {
        try { horario = JSON.parse(row.valor); } catch {}
      } else if (row.clave === 'dias_bloqueados') {
        try { diasBloqueados = JSON.parse(row.valor); } catch {}
      } else if (row.clave === 'horas_bloqueadas') {
        try { horasBloqueadas = JSON.parse(row.valor); } catch {}
      }
    }

    return new Response(JSON.stringify({ horario, diasBloqueados, horasBloqueadas, dias: DAY_NAMES }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    // Fallback to defaults if DB not available
    return new Response(JSON.stringify({
      horario: DEFAULT_HORARIO,
      diasBloqueados: [],
      horasBloqueadas: [],
      dias: DAY_NAMES,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
