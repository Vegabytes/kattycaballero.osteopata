/**
 * Cloudflare Cron Worker: Daily appointment reminders
 * Runs daily at 10:00 UTC (11:00/12:00 Madrid time)
 *
 * Sends 24h reminders for tomorrow's appointments
 */

interface Env {
  DB: D1Database;
  VAPID_PRIVATE_KEY: string;
  VAPID_PUBLIC_KEY: string;
}

interface Settings {
  [key: string]: string;
}

interface Cita {
  id: number;
  fecha: string;
  hora: string;
  duracion: number;
  servicio: string;
  estado: string;
  notas: string | null;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string | null;
}

async function getSettings(db: D1Database): Promise<Settings> {
  const rows = (await db.prepare('SELECT clave, valor FROM configuracion').all()).results as { clave: string; valor: string }[];
  const settings: Settings = {};
  for (const row of rows) settings[row.clave] = row.valor;
  return settings;
}

function formatFechaES(fecha: string): string {
  const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const d = new Date(fecha + 'T00:00:00');
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
}

function getDateInMadrid(offsetDays: number = 0): string {
  const now = new Date();
  // Approximate Madrid timezone: UTC+1 (winter) or UTC+2 (summer)
  const madridOffset = isSummerTime(now) ? 2 : 1;
  const madrid = new Date(now.getTime() + madridOffset * 3600000);
  madrid.setDate(madrid.getDate() + offsetDays);
  return madrid.toISOString().split('T')[0];
}

function isSummerTime(date: Date): boolean {
  // DST in Europe: last Sunday of March to last Sunday of October
  const year = date.getUTCFullYear();
  const marchLast = new Date(Date.UTC(year, 2, 31));
  const dstStart = new Date(Date.UTC(year, 2, 31 - marchLast.getUTCDay(), 1));
  const octLast = new Date(Date.UTC(year, 9, 31));
  const dstEnd = new Date(Date.UTC(year, 9, 31 - octLast.getUTCDay(), 1));
  return date.getTime() >= dstStart.getTime() && date.getTime() < dstEnd.getTime();
}

// === TELEGRAM ===

async function sendTelegram(botToken: string, chatId: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// === WEB PUSH ===

interface PushSub {
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

async function sendWebPush(sub: PushSub, payload: string, env: Env): Promise<boolean> {
  try {
    // Import VAPID private key
    const privateKeyBytes = base64UrlDecode(env.VAPID_PRIVATE_KEY);
    const vapidPrivateKey = await crypto.subtle.importKey(
      'pkcs8',
      await buildPkcs8(privateKeyBytes),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );

    // Build JWT for VAPID
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
      vapidPrivateKey,
      new TextEncoder().encode(unsignedToken)
    );
    const jwt = `${unsignedToken}.${base64UrlEncode(derToRaw(new Uint8Array(signature)))}`;

    // Encrypt payload using p256dh and auth
    const p256dhBytes = base64UrlDecode(sub.p256dh);
    const authBytes = base64UrlDecode(sub.auth);

    // Generate local ECDH key pair
    const localKey = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
    const localPublicRaw = await crypto.subtle.exportKey('raw', localKey.publicKey);

    // Import subscriber's public key
    const subPublicKey = await crypto.subtle.importKey('raw', p256dhBytes, { name: 'ECDH', namedCurve: 'P-256' }, false, []);

    // Derive shared secret
    const sharedSecret = await crypto.subtle.deriveBits({ name: 'ECDH', public: subPublicKey }, localKey.privateKey, 256);

    // HKDF for encryption keys (RFC 8291)
    const authInfo = new TextEncoder().encode('Content-Encoding: auth\0');
    const prkKey = await crypto.subtle.importKey('raw', sharedSecret, { name: 'HKDF' }, false, ['deriveBits']);
    const ikm = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt: authBytes, info: authInfo }, prkKey, 256);

    const ikmKey = await crypto.subtle.importKey('raw', ikm, { name: 'HKDF' }, false, ['deriveBits']);

    // Build key info and nonce info
    const keyInfo = buildInfo('Content-Encoding: aesgcm\0', p256dhBytes, new Uint8Array(localPublicRaw));
    const nonceInfo = buildInfo('Content-Encoding: nonce\0', p256dhBytes, new Uint8Array(localPublicRaw));

    const salt = crypto.getRandomValues(new Uint8Array(16));

    const contentKey = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: keyInfo }, ikmKey, 128);
    const nonce = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info: nonceInfo }, ikmKey, 96);

    // Encrypt payload
    const aesKey = await crypto.subtle.importKey('raw', contentKey, { name: 'AES-GCM' }, false, ['encrypt']);
    // Add padding (2 bytes)
    const padded = new Uint8Array(2 + new TextEncoder().encode(payload).length);
    padded.set(new TextEncoder().encode(payload), 2);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, padded);

    // Send to push service
    const res = await fetch(sub.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}`,
        'Content-Encoding': 'aesgcm',
        'Crypto-Key': `dh=${base64UrlEncode(localPublicRaw)};p256ecdsa=${env.VAPID_PUBLIC_KEY}`,
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

function buildInfo(type: string, clientPublic: Uint8Array, serverPublic: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const info = new Uint8Array(typeBytes.length + 1 + 2 + clientPublic.length + 2 + serverPublic.length);
  let offset = 0;
  info.set(typeBytes, offset); offset += typeBytes.length;
  info[offset++] = 0; // separator already in type string, extra null
  // But RFC 8188 uses a different format. Simplified:
  // Actually for aesgcm: "Content-Encoding: aesgcm\0P-256\0\0A" + client + "\0A" + server
  return concatBuffers(
    new TextEncoder().encode(type),
    new Uint8Array([0, clientPublic.length]),
    clientPublic,
    new Uint8Array([0, serverPublic.length]),
    serverPublic
  );
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
  // DER: 0x30 len 0x02 rLen r 0x02 sLen s
  let offset = 2; // skip 0x30 and length
  offset++; // skip 0x02
  const rLen = der[offset++];
  const r = der.slice(offset, offset + rLen);
  offset += rLen;
  offset++; // skip 0x02
  const sLen = der[offset++];
  const s = der.slice(offset, offset + sLen);

  // Pad/trim to 32 bytes each
  const raw = new Uint8Array(64);
  raw.set(r.length > 32 ? r.slice(r.length - 32) : r, 32 - Math.min(r.length, 32));
  raw.set(s.length > 32 ? s.slice(s.length - 32) : s, 64 - Math.min(s.length, 32));
  return raw.buffer;
}

// Build PKCS8 from raw 32-byte private key
async function buildPkcs8(rawKey: Uint8Array): Promise<ArrayBuffer> {
  // PKCS8 header for P-256
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

async function sendPushToAll(db: D1Database, payload: object, env: Env): Promise<string[]> {
  const logs: string[] = [];
  const subs = (await db.prepare('SELECT endpoint, p256dh, auth FROM push_subscriptions').all()).results as PushSub[];

  if (subs.length === 0) {
    logs.push('Push: no hay suscripciones');
    return logs;
  }

  for (const sub of subs) {
    const ok = await sendWebPush(sub, JSON.stringify(payload), env);
    if (ok) {
      logs.push('Push: enviado');
    } else {
      logs.push('Push: error, eliminando suscripcion');
      await db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').bind(sub.endpoint).run();
    }
  }
  return logs;
}

// === REMINDERS (24h before) ===

async function processReminders(db: D1Database, settings: Settings, env: Env): Promise<string[]> {
  const tomorrow = getDateInMadrid(1);
  const logs: string[] = [];

  // Busca citas de mañana que no hayan sido notificadas a Katy aún
  const citas = (await db.prepare(
    `SELECT c.id, c.fecha, c.hora, c.duracion, c.servicio, c.estado, c.notas,
            p.nombre, p.apellidos, p.telefono, p.email
     FROM citas c JOIN pacientes p ON c.paciente_id = p.id
     WHERE c.fecha = ? AND c.estado IN ('pendiente', 'confirmada') AND c.recordatorio_notificado = 0`
  ).bind(tomorrow).all()).results as Cita[];

  if (citas.length === 0) {
    logs.push('Recordatorios: no hay citas para mañana');
    return logs;
  }

  logs.push(`Recordatorios: ${citas.length} citas para mañana (${tomorrow})`);

  const botToken = settings.telegram_bot_token;
  const chatId = settings.telegram_chat_id;

  if (!botToken || !chatId) {
    logs.push('Error: faltan telegram_bot_token o telegram_chat_id en configuración');
    return logs;
  }

  // Send summary to Katy via Telegram
  const fechaDisplay = formatFechaES(tomorrow);
  const lines = citas.map(c =>
    `- ${c.hora} ${c.nombre} ${c.apellidos} (${c.servicio || 'sin servicio'}) Tel: ${c.telefono}`
  );
  const summaryText = `📋 Citas de mañana ${fechaDisplay}:\n\n${lines.join('\n')}`;
  await sendTelegram(botToken, chatId, summaryText);
  logs.push('Telegram resumen a Katy: enviado');

  // Send individual WhatsApp reminder links via Telegram
  for (const cita of citas) {
    if (cita.telefono) {
      const phone = cita.telefono.replace(/\D/g, '').replace(/^34/, '');
      const waMessage = `Hola ${cita.nombre}, soy Katy de la consulta de osteopatía. Te recuerdo que mañana ${fechaDisplay} tienes cita a las ${cita.hora}${cita.servicio ? ` (${cita.servicio})` : ''}. Dirección: C/ Río Guadarrama 2, Alpedrete. Si no puedes asistir avísame con antelación. ¡Hasta mañana! 😊`;
      const waUrl = `https://wa.me/34${phone}?text=${encodeURIComponent(waMessage)}`;

      await sendTelegram(botToken, chatId,
        `📲 Recordatorio para ${cita.nombre} ${cita.apellidos} (${cita.hora}):\n${waUrl}`);
      logs.push(`WhatsApp link para ${cita.nombre}: enviado`);
    }

    // Marcar que ya se notificó a Katy (NO marca recordatorio_enviado, eso lo hace Katy desde el panel)
    await db.prepare('UPDATE citas SET recordatorio_notificado = 1 WHERE id = ?').bind(cita.id).run();
  }

  // Send push notification to admin PWA
  if (env.VAPID_PRIVATE_KEY && env.VAPID_PUBLIC_KEY) {
    const pushLogs = await sendPushToAll(db, {
      title: `${citas.length} recordatorio${citas.length > 1 ? 's' : ''} pendiente${citas.length > 1 ? 's' : ''}`,
      body: `Citas de mañana: ${citas.map(c => `${c.hora} ${c.nombre}`).join(', ')}`,
      url: '/admin/citas',
      tag: 'recordatorios-diarios',
    }, env);
    logs.push(...pushLogs);
  }

  return logs;
}

// === INACTIVE PATIENTS ===

async function processInactivos(db: D1Database, settings: Settings, env: Env): Promise<string[]> {
  const logs: string[] = [];

  const semanas = Number(settings.inactividad_semanas) || 8;
  const dias = semanas * 7;

  // Pacientes con última cita completada hace más de X días (o sin citas)
  const result = await db.prepare(
    `SELECT p.id, p.nombre, p.apellidos, p.telefono, MAX(c.fecha) as ultima_cita
     FROM pacientes p
     LEFT JOIN citas c ON p.id = c.paciente_id AND c.estado = 'completada'
     GROUP BY p.id
     HAVING ultima_cita < date('now', '-${dias} days')
     ORDER BY ultima_cita ASC
     LIMIT 10`
  ).all();

  const pacientes = (result.results || []) as { id: number; nombre: string; apellidos: string; telefono: string; ultima_cita: string }[];

  if (pacientes.length === 0) {
    logs.push('Inactivos: no hay pacientes inactivos');
    return logs;
  }

  // Solo enviar aviso una vez por semana (lunes)
  const now = new Date();
  const madridOffset = isSummerTime(now) ? 2 : 1;
  const madrid = new Date(now.getTime() + madridOffset * 3600000);
  if (madrid.getDay() !== 1) {
    logs.push('Inactivos: no es lunes, saltar aviso semanal');
    return logs;
  }

  const botToken = settings.telegram_bot_token;
  const chatId = settings.telegram_chat_id;

  if (!botToken || !chatId) {
    logs.push('Inactivos: falta config Telegram');
    return logs;
  }

  // Resumen por Telegram
  const lines = pacientes.map(p => {
    const diasSin = p.ultima_cita
      ? Math.floor((Date.now() - new Date(p.ultima_cita + 'T00:00:00').getTime()) / 86400000)
      : '?';
    return `- ${p.nombre} ${p.apellidos} (${diasSin} días sin visita)`;
  });

  await sendTelegram(botToken, chatId,
    `📊 Pacientes inactivos (${pacientes.length}):\n\n${lines.join('\n')}\n\nPuedes contactarles desde /admin/pacientes`);
  logs.push(`Inactivos: ${pacientes.length} pacientes notificados`);

  // WhatsApp links individuales
  for (const p of pacientes) {
    if (p.telefono) {
      const phone = p.telefono.replace(/\D/g, '').replace(/^34/, '');
      const waMessage = `Hola ${p.nombre}, soy Katy de la consulta de osteopatía en Alpedrete. Hace tiempo que no nos vemos, ¿qué tal te encuentras? Si necesitas una sesión estaré encantada de atenderte. Puedes reservar en https://katycaballeroosteopata.com/reservar 😊`;
      const waUrl = `https://wa.me/34${phone}?text=${encodeURIComponent(waMessage)}`;
      await sendTelegram(botToken, chatId,
        `📲 Contactar a ${p.nombre} ${p.apellidos}:\n${waUrl}`);
    }
  }

  // Push notification
  if (env.VAPID_PRIVATE_KEY && env.VAPID_PUBLIC_KEY) {
    const pushLogs = await sendPushToAll(db, {
      title: `${pacientes.length} pacientes inactivos`,
      body: `Pacientes sin visita en +${semanas} semanas`,
      url: '/admin/pacientes?orden=visita',
      tag: 'pacientes-inactivos',
    }, env);
    logs.push(...pushLogs);
  }

  return logs;
}

// === BONOS CADUCADOS ===

async function processBonosCaducados(db: D1Database, settings: Settings): Promise<string[]> {
  const logs: string[] = [];

  // Marcar bonos activos cuya fecha de caducidad ya pasó
  const hoy = getDateInMadrid(0);
  const result = await db.prepare(
    `UPDATE bonos SET estado = 'caducado' WHERE estado = 'activo' AND fecha_caducidad IS NOT NULL AND fecha_caducidad < ?`
  ).bind(hoy).run();

  const caducados = result.meta.changes || 0;
  if (caducados > 0) {
    logs.push(`Bonos: ${caducados} bono(s) marcados como caducados`);

    // Notificar a Katy por Telegram
    const botToken = settings.telegram_bot_token;
    const chatId = settings.telegram_chat_id;
    if (botToken && chatId) {
      // Obtener detalles de los bonos recién caducados
      const bonosCaducados = (await db.prepare(
        `SELECT b.nombre, b.sesiones_usadas, b.sesiones_total, p.nombre as paciente_nombre, p.apellidos, p.telefono
         FROM bonos b JOIN pacientes p ON b.paciente_id = p.id
         WHERE b.estado = 'caducado' AND b.fecha_caducidad >= date(?, '-7 days') AND b.fecha_caducidad < ?`
      ).bind(hoy, hoy).all()).results as any[];

      if (bonosCaducados.length > 0) {
        const lines = bonosCaducados.map((b: any) =>
          `- ${b.paciente_nombre} ${b.apellidos}: ${b.nombre} (${b.sesiones_usadas}/${b.sesiones_total} sesiones usadas)`
        );
        await sendTelegram(botToken, chatId,
          `⚠️ Bonos caducados:\n\n${lines.join('\n')}\n\nRevisa en /admin/bonos`);

        // WhatsApp links para renovar
        for (const b of bonosCaducados) {
          if (b.telefono) {
            const phone = b.telefono.replace(/\D/g, '').replace(/^34/, '');
            const waMsg = `Hola ${b.paciente_nombre}, soy Katy. Tu bono "${b.nombre}" ha caducado. Si quieres renovarlo o necesitas una sesion, puedes reservar en https://katycaballeroosteopata.com/reservar 😊`;
            const waUrl = `https://wa.me/34${phone}?text=${encodeURIComponent(waMsg)}`;
            await sendTelegram(botToken, chatId,
              `📲 Renovar bono de ${b.paciente_nombre} ${b.apellidos}:\n${waUrl}`);
          }
        }
      }
    }
  } else {
    logs.push('Bonos: no hay bonos caducados');
  }

  // También avisar de bonos que están a punto de caducar (próximos 7 días)
  const en7dias = getDateInMadrid(7);
  const proximosCaducar = (await db.prepare(
    `SELECT b.nombre, b.sesiones_usadas, b.sesiones_total, b.fecha_caducidad, p.nombre as paciente_nombre, p.apellidos, p.telefono
     FROM bonos b JOIN pacientes p ON b.paciente_id = p.id
     WHERE b.estado = 'activo' AND b.fecha_caducidad IS NOT NULL AND b.fecha_caducidad >= ? AND b.fecha_caducidad <= ?`
  ).bind(hoy, en7dias).all()).results as any[];

  if (proximosCaducar.length > 0) {
    const botToken = settings.telegram_bot_token;
    const chatId = settings.telegram_chat_id;
    if (botToken && chatId) {
      const lines = proximosCaducar.map((b: any) =>
        `- ${b.paciente_nombre} ${b.apellidos}: "${b.nombre}" caduca ${b.fecha_caducidad} (${b.sesiones_usadas}/${b.sesiones_total} usadas)`
      );
      await sendTelegram(botToken, chatId,
        `⏰ Bonos que caducan pronto:\n\n${lines.join('\n')}`);

      for (const b of proximosCaducar) {
        if (b.telefono) {
          const phone = b.telefono.replace(/\D/g, '').replace(/^34/, '');
          const waMsg = `Hola ${b.paciente_nombre}, soy Katy. Te aviso de que tu bono "${b.nombre}" caduca el ${b.fecha_caducidad}. Te quedan ${b.sesiones_total - b.sesiones_usadas} sesiones por usar. ¿Quieres que te reserve una cita? 😊`;
          const waUrl = `https://wa.me/34${phone}?text=${encodeURIComponent(waMsg)}`;
          await sendTelegram(botToken, chatId,
            `📲 Avisar a ${b.paciente_nombre} ${b.apellidos} (bono caduca pronto):\n${waUrl}`);
        }
      }
      logs.push(`Bonos: ${proximosCaducar.length} bono(s) a punto de caducar`);
    }
  }

  // Bonos con 1 sesión restante
  const bonosPocasSesiones = (await db.prepare(
    `SELECT b.nombre, b.sesiones_usadas, b.sesiones_total, p.nombre as paciente_nombre, p.apellidos, p.telefono
     FROM bonos b JOIN pacientes p ON b.paciente_id = p.id
     WHERE b.estado = 'activo' AND b.sesiones_total - b.sesiones_usadas = 1`
  ).all()).results as any[];

  if (bonosPocasSesiones.length > 0) {
    const botToken = settings.telegram_bot_token;
    const chatId = settings.telegram_chat_id;
    if (botToken && chatId) {
      const lines = bonosPocasSesiones.map((b: any) =>
        `- ${b.paciente_nombre} ${b.apellidos}: "${b.nombre}" (${b.sesiones_usadas}/${b.sesiones_total} sesiones usadas)`
      );
      await sendTelegram(botToken, chatId,
        `⚠️ Bonos con 1 sesion restante:\n\n${lines.join('\n')}\n\nConsidera ofrecer renovacion.`);

      for (const b of bonosPocasSesiones) {
        if (b.telefono) {
          const phone = b.telefono.replace(/\D/g, '').replace(/^34/, '');
          const waMsg = `Hola ${b.paciente_nombre}, soy Katy. Te queda 1 sesion en tu bono "${b.nombre}". ¿Te gustaria renovarlo? Puedes reservar tu proxima sesion en https://katycaballeroosteopata.com/reservar 😊`;
          const waUrl = `https://wa.me/34${phone}?text=${encodeURIComponent(waMsg)}`;
          await sendTelegram(botToken, chatId,
            `📲 Renovar bono de ${b.paciente_nombre} ${b.apellidos} (1 sesion restante):\n${waUrl}`);
        }
      }
      logs.push(`Bonos: ${bonosPocasSesiones.length} bono(s) con 1 sesion restante`);
    }
  }

  return logs;
}

// === WORKER ENTRY ===

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const settings = await getSettings(env.DB);
    const logs: string[] = [];

    const reminderLogs = await processReminders(env.DB, settings, env);
    logs.push(...reminderLogs);

    const inactivoLogs = await processInactivos(env.DB, settings, env);
    logs.push(...inactivoLogs);

    const bonosLogs = await processBonosCaducados(env.DB, settings);
    logs.push(...bonosLogs);

    console.log('Cron completed:', logs.join(' | '));
  },

  // Allow manual trigger via HTTP for testing
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const secret = url.searchParams.get('secret');
    if (secret !== 'katy-cron-2024') {
      return new Response('Unauthorized', { status: 401 });
    }

    const settings = await getSettings(env.DB);
    const logs: string[] = [];

    const reminderLogs = await processReminders(env.DB, settings, env);
    logs.push(...reminderLogs);

    const inactivoLogs = await processInactivos(env.DB, settings, env);
    logs.push(...inactivoLogs);

    const bonosLogs = await processBonosCaducados(env.DB, settings);
    logs.push(...bonosLogs);

    return new Response(JSON.stringify({ logs }, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    });
  },
};
