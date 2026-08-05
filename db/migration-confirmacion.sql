-- Confirmación de cita en un toque (06/08/2026). El recordatorio de WhatsApp
-- lleva un enlace con token; el paciente lo toca y la cita pasa a confirmada.
-- El token se genera al enviar el recordatorio (cron) y es de un solo uso
-- práctico: solo vale para citas futuras y no revela nada.
ALTER TABLE citas ADD COLUMN token_confirmacion TEXT;
