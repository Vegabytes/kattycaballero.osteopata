-- Código promocional por cita (ej. PUEBLUS10) — 13/07/2026
-- Se guarda en la cita y queda en el historial del paciente.
ALTER TABLE citas ADD COLUMN codigo_promo TEXT;
