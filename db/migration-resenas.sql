-- Solicitud de reseñas de Google (06/08/2026, idea de Alex: "hay que fomentar
-- lo de que pongan reseñas" — 12 reseñas 5,0 en Google y todas de pacientes).
-- Un flag por PACIENTE, no por cita: a cada persona se le pide UNA vez en la
-- vida, dos días después de una cita completada. 0 = nunca pedida.
ALTER TABLE pacientes ADD COLUMN resena_solicitada INTEGER NOT NULL DEFAULT 0;
