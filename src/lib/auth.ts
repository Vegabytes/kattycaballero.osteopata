const COOKIE_NAME = 'katy_admin_session';
const SESSION_DURATION_HOURS = 72;

function getDB(context: any) {
  // Works with both AstroGlobal and middleware APIContext
  return context.locals?.runtime?.env?.DB;
}

function getPassword(context: any): string {
  return context.locals?.runtime?.env?.ADMIN_PASSWORD || 'katy2024';
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function login(context: any, password: string): Promise<boolean> {
  const correctPassword = getPassword(context);
  if (password !== correctPassword) return false;

  const db = getDB(context);
  if (!db) return false;

  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString();

  try {
    // Clean expired sessions
    await db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();

    // Create new session
    await db.prepare('INSERT INTO sessions (token, expires_at) VALUES (?, ?)').bind(token, expiresAt).run();

    context.cookies.set(COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: SESSION_DURATION_HOURS * 60 * 60,
    });

    return true;
  } catch (e) {
    console.error('Login error:', e);
    return false;
  }
}

export async function isAuthenticated(context: any): Promise<boolean> {
  try {
    const token = context.cookies.get(COOKIE_NAME)?.value;
    if (!token) return false;

    const db = getDB(context);
    if (!db) return false;

    const session = await db
      .prepare("SELECT token FROM sessions WHERE token = ? AND expires_at > datetime('now')")
      .bind(token)
      .first();

    return !!session;
  } catch (e) {
    console.error('Auth check error:', e);
    return false;
  }
}

export async function logout(context: any): Promise<void> {
  try {
    const token = context.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const db = getDB(context);
      if (db) {
        await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
      }
    }
  } catch (e) {
    console.error('Logout error:', e);
  }
  context.cookies.delete(COOKIE_NAME, { path: '/' });
}
