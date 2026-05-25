-- Migración: gastos recurrentes
-- Añade la marca de "se repite cada mes" a la tabla gastos.
--   Local:  wrangler d1 execute katy-clinica --file=db/migration-gastos-recurrentes.sql --local
--   Remoto: wrangler d1 execute katy-clinica --file=db/migration-gastos-recurrentes.sql --remote
-- NOTA: el ALTER fallará si la columna ya existe. Es esperado.

ALTER TABLE gastos ADD COLUMN recurrente INTEGER DEFAULT 0;
