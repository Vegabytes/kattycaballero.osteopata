/**
 * Web Push implementation using Web Crypto API
 * Works in Cloudflare Workers and Pages Functions
 */

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - str.length % 4) % 4);
  const raw = atob(str + padding);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function concatBuffers(...buffers: Uint8Array[]): Uint8Array {
  const total = buffers.reduce((s, b) => s + b.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const buf of buffers) {
    result.set(buf, offset);
    offset += buf.length;
  }
  return result;
}

// Convert DER ECDSA signature to raw r||s format
function derToRaw(der: Uint8Array): ArrayBuffer {
  let offset = 2;
  offset++;
  const rLen = der[offset++];
  const r = der.slice(offset, offset + rLen);
  offset += rLen;
  offset++;
  const sLen = der[offset++];
  const s = der.slice(offset, offset + sLen);
  const raw = new Uint8Array(64);
  raw.set(r.length > 32 ? r.slice(r.length - 32) : r, 32 - Math.min(r.length, 32));
  raw.set(s.length > 32 ? s.slice(s.length - 32) : s, 64 - Math.min(s.length, 32));
  return raw.buffer;
}

// Build PKCS8 from raw 32-byte private key
function buildPkcs8(rawKey: Uint8Array): ArrayBuffer {
  const header = new Uint8Array([
    0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06,
    0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01,
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03,
    0x01, 0x07, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01,
    0x01, 0x04, 0x20,
  ]);
  const result = new Uint8Array(header.length + rawKey.length);
  result.set(header);
  result.set(rawKey, header.length);
  return result.buffer;
}

function buildInfo(type: string, clientPublic: Uint8Array, serverPublic: Uint8Array): Uint8Array {
  return concatBuffers(
    new TextEncoder().encode(type),
    new Uint8Array([0, clientPublic.length]),
    clientPublic,
    new Uint8Array([0, serverPublic.length]),
    serverPublic
  );
}

export async function sendWebPush(
  sub: PushSubscription,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<boolean> {
  try {
    const privateKeyBytes = base64UrlDecode(vapidPrivateKey);
    const vapidKey = await crypto.subtle.importKey(
      'pkcs8',
      buildPkcs8(privateKeyBytes),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );

    // Build VAPID JWT
    const audience = new URL(sub.endpoint).origin;
    const now = Math.floor(Date.now() / 1000);
    const header = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
    const body = base64UrlEncode(new TextEncoder().encode(JSON.stringify({
      aud: audience,
      exp: now + 86400,
      sub: 'mailto:katy@katycaballeroosteopata.com',
    })));
    const unsignedToken = `${header}.${body}`;
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      vapidKey,
      new TextEncoder().encode(unsignedToken)
    );
    const jwt = `${unsignedToken}.${base64UrlEncode(derToRaw(new Uint8Array(signature)))}`;

    // Encrypt payload
    const p256dhBytes = base64UrlDecode(sub.p256dh);
    const authBytes = base64UrlDecode(sub.auth);

    const localKey = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
    const localPublicRaw = await crypto.subtle.exportKey('raw', localKey.publicKey);

    const subPublicKey = await crypto.subtle.importKey('raw', p256dhBytes, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
    const sharedSecret = await crypto.subtle.deriveBits({ name: 'ECDH', public: subPublicKey }, localKey.privateKey, 256);

    const authInfo = new TextEncoder().encode('Content-Encoding: auth\0');
    const prkKey = await crypto.subtle.importKey('raw', sharedSecret, { name: 'HKDF' }, false, ['deriveBits']);
    const ikm = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: authBytes, info: authInfo }, prkKey, 256);

    const ikmKey = await crypto.subtle.importKey('raw', ikm, { name: 'HKDF' }, false, ['deriveBits']);

    const keyInfo = buildInfo('Content-Encoding: aesgcm\0', p256dhBytes, new Uint8Array(localPublicRaw));
    const nonceInfo = buildInfo('Content-Encoding: nonce\0', p256dhBytes, new Uint8Array(localPublicRaw));

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const contentKey = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: keyInfo }, ikmKey, 128);
    const nonce = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo }, ikmKey, 96);

    const aesKey = await crypto.subtle.importKey('raw', contentKey, { name: 'AES-GCM' }, false, ['encrypt']);
    const padded = new Uint8Array(2 + new TextEncoder().encode(payload).length);
    padded.set(new TextEncoder().encode(payload), 2);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, padded);

    const res = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
        'Content-Encoding': 'aesgcm',
        'Crypto-Key': `dh=${base64UrlEncode(localPublicRaw)};p256ecdsa=${vapidPublicKey}`,
        'Encryption': `salt=${base64UrlEncode(salt)}`,
        'Content-Type': 'application/octet-stream',
        'TTL': '86400',
      },
      body: encrypted,
    });

    return res.ok || res.status === 201;
  } catch (e) {
    console.error('Web Push error:', e);
    return false;
  }
}

export async function sendPushToAll(
  db: any,
  payload: { title: string; body: string; url?: string; tag?: string },
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<{ sent: number; failed: number }> {
  const subs = (await db.prepare('SELECT endpoint, p256dh, auth FROM push_subscriptions').all()).results as PushSubscription[];

  if (!subs || subs.length === 0) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    const ok = await sendWebPush(sub, JSON.stringify(payload), vapidPublicKey, vapidPrivateKey);
    if (ok) {
      sent++;
    } else {
      failed++;
      // Remove invalid subscriptions
      await db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').bind(sub.endpoint).run();
    }
  }

  return { sent, failed };
}
