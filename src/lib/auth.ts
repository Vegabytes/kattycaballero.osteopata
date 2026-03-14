const COOKIE_NAME = 'katy_admin_session';
const SESSION_DURATION_HOURS = 72;
const SECRET_SALT = 'katy-clinica-2024-salt';

// HMAC-based auth — no DB needed for session verification
async function createSignedToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET_SALT),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const expiry = Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000;
  const data = `${password}:${expiry}`;
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const sigHex = Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, '0')).join('');
  // Use . separator to avoid URL-encoding issues with : in cookies
  return `${expiry}.${sigHex}`;
}

async function verifyToken(token: string, password: string): Promise<boolean> {
  try {
    const dotIndex = token.indexOf('.');
    if (dotIndex === -1) return false;
    const expiryStr = token.substring(0, dotIndex);
    const sigHex = token.substring(dotIndex + 1);
    const expiry = Number(expiryStr);

    if (!expiry || Date.now() > expiry) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SECRET_SALT),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const data = `${password}:${expiry}`;
    const sigBytes = new Uint8Array(sigHex.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
    return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(data));
  } catch {
    return false;
  }
}

function getEnvPassword(context: any): string {
  return context.locals?.runtime?.env?.ADMIN_PASSWORD || 'katy2024';
}

// Hash a password using HMAC-SHA256 for storage
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET_SALT),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(password));
  return Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, '0')).join('');
}

// Get the effective password: check D1 override first, then env var
async function getEffectivePassword(context: any): Promise<string> {
  try {
    const db = context.locals?.runtime?.env?.DB;
    if (db) {
      const row = await db.prepare('SELECT valor FROM configuracion WHERE clave = ?').bind('admin_password_hash').first() as { valor: string } | null;
      if (row?.valor) {
        // Return a special marker so login knows to compare hashes
        return `__hashed__:${row.valor}`;
      }
    }
  } catch {
    // D1 not available, fall back to env var
  }
  return getEnvPassword(context);
}

export async function login(context: any, password: string): Promise<{ success: boolean; token?: string }> {
  const effectivePassword = await getEffectivePassword(context);

  if (effectivePassword.startsWith('__hashed__:')) {
    // Compare against stored hash
    const storedHash = effectivePassword.substring('__hashed__:'.length);
    const inputHash = await hashPassword(password);
    if (inputHash !== storedHash) return { success: false };
  } else {
    // Compare plain text against env var
    if (password !== effectivePassword) return { success: false };
  }

  // Use the actual password for the session token
  const token = await createSignedToken(password);

  const maxAge = SESSION_DURATION_HOURS * 60 * 60;
  context.cookies.set(COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge,
  });

  return { success: true, token };
}

export async function isAuthenticated(context: any): Promise<boolean> {
  // Try Astro's cookie API first
  let token = context.cookies.get(COOKIE_NAME)?.value;

  // Fallback: parse Cookie header manually in case Astro's decode mismatches
  if (!token) {
    const cookieHeader = context.request.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) return false;

  // Try verifying against all possible passwords
  const envPassword = getEnvPassword(context);

  // First try env password
  if (await verifyToken(token, envPassword)) return true;

  // Then try to get the override password hash and verify
  try {
    const db = context.locals?.runtime?.env?.DB;
    if (db) {
      const row = await db.prepare('SELECT valor FROM configuracion WHERE clave = ?').bind('admin_password_override').first() as { valor: string } | null;
      if (row?.valor && await verifyToken(token, row.valor)) return true;
    }
  } catch {
    // D1 not available
  }

  return false;
}

export async function verifyPassword(context: any, password: string): Promise<boolean> {
  const effectivePassword = await getEffectivePassword(context);

  if (effectivePassword.startsWith('__hashed__:')) {
    const storedHash = effectivePassword.substring('__hashed__:'.length);
    const inputHash = await hashPassword(password);
    return inputHash === storedHash;
  }

  return password === effectivePassword;
}

export async function changePassword(context: any, newPassword: string): Promise<void> {
  const db = context.locals?.runtime?.env?.DB;
  if (!db) throw new Error('Base de datos no disponible');

  const hashedPassword = await hashPassword(newPassword);

  // Store the hash in configuracion
  await db.prepare(
    "INSERT INTO configuracion (clave, valor, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(clave) DO UPDATE SET valor = ?, updated_at = datetime('now')"
  ).bind('admin_password_hash', hashedPassword, hashedPassword).run();

  // Also store the plain password for session token verification
  await db.prepare(
    "INSERT INTO configuracion (clave, valor, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(clave) DO UPDATE SET valor = ?, updated_at = datetime('now')"
  ).bind('admin_password_override', newPassword, newPassword).run();
}

export async function logout(context: any): Promise<void> {
  context.cookies.delete(COOKIE_NAME, { path: '/' });
}
