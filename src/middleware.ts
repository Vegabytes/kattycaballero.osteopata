import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const path = new URL(context.request.url).pathname.replace(/\/+$/, '') || '/';

  // Only protect /admin routes (except login)
  if (path.startsWith('/admin') && path !== '/admin/login') {
    try {
      const authenticated = await isAuthenticated(context);
      if (!authenticated) {
        return context.redirect('/admin/login');
      }
    } catch (e) {
      console.error('Middleware auth error:', e);
      // Don't redirect to login on error — show the error so we can debug
      return new Response(`Error de autenticación: ${e instanceof Error ? e.message : String(e)}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  }

  return next();
});
