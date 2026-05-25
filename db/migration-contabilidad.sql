-- Migración: módulo de Contabilidad
-- Ejecutar una vez sobre la BD ya desplegada.
--   Local:  wrangler d1 execute katy-clinica --file=db/migration-contabilidad.sql --local
--   Remoto: wrangler d1 execute katy-clinica --file=db/migration-contabilidad.sql --remote
--
-- NOTA: el ALTER fallará si la columna ya existe. Es esperado: ejecuta el
-- resto manualmente o ignora ese error concreto.

ALTER TABLE citas ADD COLUMN metodo_pago TEXT;

CREATE TABLE IF NOT EXISTS gastos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT NOT NULL,
  concepto TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'otros',
  proveedor TEXT,
  base REAL NOT NULL DEFAULT 0,
  tipo_iva REAL NOT NULL DEFAULT 0,
  iva REAL NOT NULL DEFAULT 0,
  total REAL NOT NULL DEFAULT 0,
  deducible INTEGER DEFAULT 1,
  metodo_pago TEXT,
  notas TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON gastos(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);
