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
  return `${expiry}:${sigHex}`;
}

async function verifyToken(token: string, password: string): Promise<boolean> {
  try {
    const [expiryStr, sigHex] = token.split(':');
    const expiry = Number(expiryStr);

    // Check expiry
    if (Date.now() > expiry) return false;

    // Verify signature
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

function getPassword(context: any): string {
  return context.locals?.runtime?.env?.ADMIN_PASSWORD || 'katy2024';
}

export async function login(context: any, password: string): Promise<boolean> {
  const correctPassword = getPassword(context);
  if (password !== correctPassword) return false;

  const token = await createSignedToken(password);

  context.cookies.set(COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: SESSION_DURATION_HOURS * 60 * 60,
  });

  return true;
}

export async function isAuthenticated(context: any): Promise<boolean> {
  const token = context.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const password = getPassword(context);
  return verifyToken(token, password);
}

export async function logout(context: any): Promise<void> {
  context.cookies.delete(COOKIE_NAME, { path: '/' });
}
