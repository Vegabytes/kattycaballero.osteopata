import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const path = new URL(context.request.url).pathname.replace(/\/+$/, '') || '/';
  const isAdmin = path.startsWith('/admin');

  // Protect /admin routes (except login)
  if (isAdmin && path !== '/admin/login') {
    try {
      const authenticated = await isAuthenticated(context);
      if (!authenticated) {
        return context.redirect('/admin/login');
      }
    } catch (e) {
      console.error('Middleware auth error:', e);
      return new Response('Error interno de autenticación', {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  }

  const response = await next();

  // Security headers for all pages
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Admin-specific headers
  if (isAdmin) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
});
