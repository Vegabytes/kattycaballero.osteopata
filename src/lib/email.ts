import type { AstroGlobal } from 'astro';
import { getSettings } from './settings';
import type { Paciente, Cita } from './db';

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(Astro: AstroGlobal, params: EmailParams): Promise<{ ok: boolean; error?: string }> {
  const settings = await getSettings(Astro);

  if (!settings.email_service_activo || !settings.email_api_key) {
    return { ok: false, error: 'Servicio de email no configurado' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.email_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: settings.email_from || `${settings.nombre_clinica} <noreply@${settings.email_from.split('@')[1] || 'resend.dev'}>`,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return { ok: false, error: `Error enviando email: ${err}` };
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// Replace template variables like {nombre}, {fecha}, etc.
export function renderTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), val);
  }
  return result;
}

// Wrap plain text message in a nice HTML email template
export function wrapInEmailTemplate(clinicName: string, message: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f5f5;">
  <div style="max-width: 560px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: #4a6548; padding: 24px 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 500;">${clinicName}</h1>
    </div>
    <div style="padding: 32px; line-height: 1.6; color: #333; font-size: 15px;">
      ${message.split('\n').map(line => `<p style="margin: 0 0 12px 0;">${line}</p>`).join('')}
    </div>
    <div style="padding: 16px 32px; background: #f9f9f9; text-align: center; font-size: 12px; color: #999;">
      ${clinicName} · Alpedrete, Madrid
    </div>
  </div>
</body>
</html>`;
}

// Send a templated email to a patient
export async function sendPatientEmail(
  Astro: AstroGlobal,
  paciente: Paciente,
  subjectTemplate: string,
  messageTemplate: string,
  extraVars?: Record<string, string>
): Promise<{ ok: boolean; error?: string }> {
  if (!paciente.email) {
    return { ok: false, error: 'El paciente no tiene email' };
  }

  const settings = await getSettings(Astro);

  const vars: Record<string, string> = {
    nombre: paciente.nombre,
    apellidos: paciente.apellidos,
    telefono_clinica: settings.telefono_clinica,
    nombre_clinica: settings.nombre_clinica,
    ...extraVars,
  };

  const subject = renderTemplate(subjectTemplate, vars);
  const message = renderTemplate(messageTemplate, vars);
  const html = wrapInEmailTemplate(settings.nombre_clinica, message);

  return sendEmail(Astro, { to: paciente.email, subject, html });
}
