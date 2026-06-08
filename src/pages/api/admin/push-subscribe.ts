export const prerender = false;

import type { APIRoute } from 'astro';
import { isAuthenticated, isSameOrigin } from '../../../lib/auth';

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
    console.error('[push-subscribe]', e);
    return new Response(JSON.stringify({ error: 'Error interno' }), { status: 500 });
  }
};
