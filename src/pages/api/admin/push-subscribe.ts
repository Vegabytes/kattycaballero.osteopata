export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = (locals as any).runtime.env.DB;
    const subscription = await request.json();

    if (!subscription?.endpoint) {
      return new Response(JSON.stringify({ error: 'Suscripción inválida' }), { status: 400 });
    }

    // Upsert: delete old subscriptions with same endpoint, then insert
    await db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').bind(subscription.endpoint).run();
    await db.prepare(
      'INSERT INTO push_subscriptions (endpoint, p256dh, auth, created_at) VALUES (?, ?, ?, datetime(\'now\'))'
    ).bind(
      subscription.endpoint,
      subscription.keys?.p256dh || '',
      subscription.keys?.auth || ''
    ).run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
};
