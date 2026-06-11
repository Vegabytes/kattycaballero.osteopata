const COOKIE_NAME = 'katy_admin_session';
const SESSION_DURATION_HOURS = 72;

// La clave que firma las sesiones viene del ENTORNO (secret de Cloudflare),
// nunca hardcodeada. Sin ella, el sistema falla cerrado (deniega todo).
function getSessionSecret(context: any): string | null {
  const s = context.locals?.runtime?.env?.SESSION_SECRET;
  return typeof s === 'string' && s.length >= 16 ? s : null;
}

// Contraseña de admin desde el entorno. Sin valor por defecto: si no está
// configurada (y no hay hash en D1), el login se deniega.
function getEnvPassword(context: any): string | null {
  const p = context.locals?.runtime?.env?.ADMIN_PASSWORD;
  return typeof p === 'string' && p.length > 0 ? p : null;
}

async function hmacHex(secret: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Comparación en tiempo (cuasi) constante para evitar timing attacks.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Token de sesión: {expiry}.{hmac(secret, expiry)}. NO depende de la contraseña,
// así que no hace falta almacenar la contraseña en claro para verificarlo.
async function createSignedToken(secret: string): Promise<string> {
  const expiry = Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000;
  const sig = await hmacHex(secret, String(expiry));
  return `${expiry}.${sig}`;
}

async function verifyToken(secret: string, token: string): Promise<boolean> {
  try {
    const dot = token.indexOf('.');
    if (dot === -1) return false;
    const expiry = Number(token.substring(0, dot));
    const sigHex = token.substring(dot + 1);
    if (!expiry || Date.now() > expiry) return false;
    const expected = await hmacHex(secret, String(expiry));
    return timingSafeEqual(expected, sigHex);
  } catch {
    return false;
  }
}

// Hash de contraseña para almacenamiento/comparación (con el secret de entorno).
async function hashPassword(secret: string, password: string): Promise<string> {
  return hmacHex(secret, `pw:${password}`);
}

// Hash de override almacenado en D1 (si la admin cambió la password desde el panel).
async function getStoredHash(context: any): Promise<string | null> {
  try {
    const db = context.locals?.runtime?.env?.DB;
    if (db) {
      const row = (await db
        .prepare('SELECT valor FROM configuracion WHERE clave = ?')
        .bind('admin_password_hash')
        .first()) as { valor: string } | null;
      if (row?.valor) return row.valor;
    }
  } catch {
    // D1 no disponible
  }
  return null;
}

// ¿La contraseña es correcta? Vale tanto la del entorno como el hash de override.
// La del entorno SIEMPRE funciona (evita lockout si quedó un hash viejo).
async function passwordMatches(context: any, secret: string, password: string): Promise<boolean> {
  const envPw = getEnvPassword(context);
  if (envPw !== null && timingSafeEqual(password, envPw)) return true;
  const storedHash = await getStoredHash(context);
  if (storedHash) return timingSafeEqual(await hashPassword(secret, password), storedHash);
  return false;
}

export async function login(context: any, password: string): Promise<{ success: boolean; token?: string }> {
  const secret = getSessionSecret(context);
  if (!secret) return { success: false }; // fail-closed: falta SESSION_SECRET

  if (!(await passwordMatches(context, secret, password))) return { success: false };

  const token = await createSignedToken(secret);
  context.cookies.set(COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: SESSION_DURATION_HOURS * 60 * 60,
  });
  return { success: true, token };
}

export async function isAuthenticated(context: any): Promise<boolean> {
  const secret = getSessionSecret(context);
  if (!secret) return false;

  let token = context.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const cookieHeader = context.request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (match) token = decodeURIComponent(match[1]);
  }
  if (!token) return false;

  return verifyToken(secret, token);
}

export async function verifyPassword(context: any, password: string): Promise<boolean> {
  const secret = getSessionSecret(context);
  if (!secret) return false;
  return passwordMatches(context, secret, password);
}

export async function changePassword(context: any, newPassword: string): Promise<void> {
  const secret = getSessionSecret(context);
  if (!secret) throw new Error('SESSION_SECRET no configurado');
  const db = context.locals?.runtime?.env?.DB;
  if (!db) throw new Error('Base de datos no disponible');

  const hashed = await hashPassword(secret, newPassword);
  // Solo guardamos el HASH, nunca el plaintext.
  await db
    .prepare(
      "INSERT INTO configuracion (clave, valor, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(clave) DO UPDATE SET valor = ?, updated_at = datetime('now')",
    )
    .bind('admin_password_hash', hashed, hashed)
    .run();
  // Limpiar el plaintext legacy si existía de versiones anteriores.
  try {
    await db.prepare('DELETE FROM configuracion WHERE clave = ?').bind('admin_password_override').run();
  } catch {
    // no pasa nada si no existe
  }
}

export async function logout(context: any): Promise<void> {
  context.cookies.delete(COOKIE_NAME, { path: '/' });
}

// CSRF defense: verify the request originates from the same host.
export function isSameOrigin(request: Request): boolean {
  try {
    const requestHost = new URL(request.url).host;
    const origin = request.headers.get('origin');
    if (origin) {
      return new URL(origin).host === requestHost;
    }
    const referer = request.headers.get('referer');
    if (referer) {
      return new URL(referer).host === requestHost;
    }
    return false;
  } catch {
    return false;
  }
}
