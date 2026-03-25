export const prerender = false;

import type { APIRoute } from 'astro';

// Public API: returns occupied time slots for a given date
// No auth required - only exposes times, not patient data
export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const fecha = url.searchParams.get('fecha');

  if (!fecha) {
    return new Response(JSON.stringify({ error: 'Falta parametro fecha' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const db = (locals as any).runtime.env.DB;
    const rows = await db
      .prepare(
        `SELECT hora, duracion FROM citas
         WHERE fecha = ? AND estado NOT IN ('cancelada')
         ORDER BY hora`
      )
      .bind(fecha)
      .all();

    // Build list of occupied 30-min slots (considering duration + 30 min buffer for room prep)
    const occupied: string[] = [];
    for (const row of (rows.results || []) as { hora: string; duracion: number }[]) {
      const [h, m] = row.hora.split(':').map(Number);
      const dur = row.duracion || 60;
      const slots = Math.ceil(dur / 30) + 1; // +1 slot (30 min) for room preparation
      for (let i = 0; i < slots; i++) {
        const totalMin = h * 60 + (m || 0) + i * 30;
        const slotH = Math.floor(totalMin / 60);
        const slotM = totalMin % 60;
        occupied.push(`${slotH.toString().padStart(2, '0')}:${slotM.toString().padStart(2, '0')}`);
      }
    }

    return new Response(JSON.stringify({ fecha, occupied }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
