import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from './lib/auth';

// Simple in-memory rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  record.count++;
  if (record.count > MAX_LOGIN_ATTEMPTS) {
    return true;
  }
  return false;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const path = new URL(context.request.url).pathname.replace(/\/+$/, '') || '/';
  const isAdmin = path.startsWith('/admin');

  // Rate limit login POST requests
  if (path === '/admin/login' && context.request.method === 'POST') {
    const ip = context.request.headers.get('cf-connecting-ip')
      || context.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || 'unknown';

    if (isRateLimited(ip)) {
      return new Response('Demasiados intentos de inicio de sesión. Inténtalo en 15 minutos.', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Retry-After': '900',
        },
      });
    }
  }

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
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Admin-specific headers
  if (isAdmin) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
});
