import type { AstroGlobal } from 'astro';

export interface AppSettings {
  // General
  nombre_clinica: string;
  telefono_clinica: string;
  email_clinica: string;

  // Email (Resend)
  email_service_activo: boolean;
  email_api_key: string;
  email_from: string;

  // Recordatorio de citas
  recordatorio_citas_activo: boolean;
  recordatorio_citas_horas: number;
  recordatorio_citas_asunto: string;
  recordatorio_citas_mensaje: string;

  // Seguimiento post-tratamiento
  seguimiento_activo: boolean;
  seguimiento_dias: number;
  seguimiento_asunto: string;
  seguimiento_mensaje: string;

  // Cumpleaños
  cumpleanos_activo: boolean;
  cumpleanos_asunto: string;
  cumpleanos_mensaje: string;

  // Pacientes inactivos
  inactividad_activo: boolean;
  inactividad_semanas: number;
  inactividad_asunto: string;
  inactividad_mensaje: string;

  // WhatsApp automático
  whatsapp_recordatorio_activo: boolean;
  whatsapp_recordatorio_horas: number;
  whatsapp_recordatorio_mensaje: string;

  // Facturación
  facturacion_activa: boolean;
  facturacion_nif: string;
  facturacion_direccion: string;
}

// Todo desactivado por defecto
const DEFAULTS: AppSettings = {
  nombre_clinica: 'Katy Caballero - Osteópata',
  telefono_clinica: '634063461',
  email_clinica: '',

  email_service_activo: false,
  email_api_key: '',
  email_from: '',

  recordatorio_citas_activo: false,
  recordatorio_citas_horas: 24,
  recordatorio_citas_asunto: 'Recordatorio de tu cita',
  recordatorio_citas_mensaje: 'Hola {nombre}, te recordamos que tienes cita el {fecha} a las {hora}. Si necesitas cambiarla, llámanos al {telefono_clinica}. ¡Te esperamos!',

  seguimiento_activo: false,
  seguimiento_dias: 2,
  seguimiento_asunto: '¿Cómo te encuentras?',
  seguimiento_mensaje: 'Hola {nombre}, hace {dias} días que tuviste tu sesión de {servicio}. ¿Cómo te encuentras? Si tienes cualquier duda, estamos a tu disposición.',

  cumpleanos_activo: false,
  cumpleanos_asunto: '¡Feliz cumpleaños, {nombre}!',
  cumpleanos_mensaje: 'Hola {nombre}, desde Katy Caballero Osteópata te deseamos un feliz cumpleaños. ¡Que tengas un gran día!',

  inactividad_activo: false,
  inactividad_semanas: 8,
  inactividad_asunto: 'Te echamos de menos',
  inactividad_mensaje: 'Hola {nombre}, hace tiempo que no nos visitas. Recuerda que cuidar tu cuerpo es importante. Si necesitas una cita, estamos aquí para ayudarte.',

  whatsapp_recordatorio_activo: false,
  whatsapp_recordatorio_horas: 24,
  whatsapp_recordatorio_mensaje: 'Hola {nombre}, te recordamos tu cita mañana {fecha} a las {hora} en Katy Caballero Osteópata. Si necesitas cambiarla, responde a este mensaje.',

  facturacion_activa: false,
  facturacion_nif: '',
  facturacion_direccion: '',
};

function getDB(Astro: AstroGlobal) {
  return (Astro.locals as any).runtime.env.DB;
}

export async function getSettings(Astro: AstroGlobal): Promise<AppSettings> {
  const db = getDB(Astro);
  const rows = (await db.prepare('SELECT clave, valor FROM configuracion').all()).results as { clave: string; valor: string }[];

  const settings = { ...DEFAULTS };
  for (const row of rows) {
    if (row.clave in settings) {
      const defaultVal = (DEFAULTS as any)[row.clave];
      if (typeof defaultVal === 'boolean') {
        (settings as any)[row.clave] = row.valor === 'true';
      } else if (typeof defaultVal === 'number') {
        (settings as any)[row.clave] = Number(row.valor);
      } else {
        (settings as any)[row.clave] = row.valor;
      }
    }
  }
  return settings;
}

export async function getSetting(Astro: AstroGlobal, clave: string): Promise<string | null> {
  const db = getDB(Astro);
  const row = await db.prepare('SELECT valor FROM configuracion WHERE clave = ?').bind(clave).first() as { valor: string } | null;
  if (row) return row.valor;
  if (clave in DEFAULTS) return String((DEFAULTS as any)[clave]);
  return null;
}

export async function saveSettings(Astro: AstroGlobal, settings: Partial<AppSettings>): Promise<void> {
  const db = getDB(Astro);
  const stmts = Object.entries(settings).map(([clave, valor]) =>
    db.prepare('INSERT INTO configuracion (clave, valor, updated_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(clave) DO UPDATE SET valor = ?, updated_at = datetime(\'now\')')
      .bind(clave, String(valor), String(valor))
  );
  await db.batch(stmts);
}

export async function saveSetting(Astro: AstroGlobal, clave: string, valor: string): Promise<void> {
  const db = getDB(Astro);
  await db.prepare('INSERT INTO configuracion (clave, valor, updated_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(clave) DO UPDATE SET valor = ?, updated_at = datetime(\'now\')')
    .bind(clave, valor, valor).run();
}
