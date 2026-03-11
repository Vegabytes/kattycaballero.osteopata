import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const path = new URL(context.request.url).pathname.replace(/\/+$/, '') || '/';

  // Only protect /admin routes (except login)
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const authenticated = await isAuthenticated(context);
    if (!authenticated) {
      return context.redirect('/admin/login');
    }
  }

  return next();
});
