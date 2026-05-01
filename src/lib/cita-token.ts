/**
 * Stateless token to let patients reschedule/cancel their own
 * appointment via a public link, without exposing the cita id.
 *
 * Token format: `{citaId}-{hmacHex16}` — HMAC-SHA256 of `cita:{citaId}`
 * with BOOKING_TOKEN_SECRET, truncated to 16 hex chars (64 bits).
 *
 * Validity is enforced by re-deriving the HMAC, then loading the cita
 * and rejecting cancelled / past appointments at the use site.
 */

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('');
}

export async function generateCitaToken(citaId: number, secret: string): Promise<string> {
  const hex = await hmacHex(secret, `cita:${citaId}`);
  return `${citaId}-${hex.slice(0, 16)}`;
}

export async function verifyCitaToken(token: string, secret: string): Promise<number | null> {
  const dash = token.indexOf('-');
  if (dash < 1) return null;
  const idStr = token.substring(0, dash);
  const sig = token.substring(dash + 1);
  const citaId = Number(idStr);
  if (!Number.isInteger(citaId) || citaId <= 0) return null;
  if (!/^[0-9a-f]{16}$/.test(sig)) return null;

  const expected = (await hmacHex(secret, `cita:${citaId}`)).slice(0, 16);
  // Constant-time comparison
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0 ? citaId : null;
}
