import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);

  // Only protect /admin routes (except login)
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
    const authenticated = await isAuthenticated(context as any);
    if (!authenticated) {
      return context.redirect('/admin/login');
    }
  }

  return next();
});
