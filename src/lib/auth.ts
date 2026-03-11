import type { AstroGlobal } from 'astro';

const COOKIE_NAME = 'katy_admin_session';
const SESSION_DURATION_HOURS = 72;

function getDB(Astro: AstroGlobal) {
  return (Astro.locals as any).runtime.env.DB;
}

function getPassword(Astro: AstroGlobal): string {
  return (Astro.locals as any).runtime.env.ADMIN_PASSWORD || 'katy2024';
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function login(Astro: AstroGlobal, password: string): Promise<boolean> {
  const correctPassword = getPassword(Astro);
  if (password !== correctPassword) return false;

  const db = getDB(Astro);
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString();

  // Clean expired sessions
  await db.prepare('DELETE FROM sessions WHERE expires_at < datetime(\'now\')').run();

  // Create new session
  await db.prepare('INSERT INTO sessions (token, expires_at) VALUES (?, ?)').bind(token, expiresAt).run();

  Astro.cookies.set(COOKIE_NAME, token, {
    path: '/admin',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: SESSION_DURATION_HOURS * 60 * 60,
  });

  return true;
}

export async function isAuthenticated(Astro: AstroGlobal): Promise<boolean> {
  const token = Astro.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const db = getDB(Astro);
  const session = await db
    .prepare('SELECT token FROM sessions WHERE token = ? AND expires_at > datetime(\'now\')')
    .bind(token)
    .first();

  return !!session;
}

export async function logout(Astro: AstroGlobal): Promise<void> {
  const token = Astro.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    const db = getDB(Astro);
    await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }
  Astro.cookies.delete(COOKIE_NAME, { path: '/admin' });
}
