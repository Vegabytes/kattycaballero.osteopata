-- Katy Clínica - Schema
-- Base de datos para gestión de pacientes, citas y tratamientos

CREATE TABLE IF NOT EXISTS pacientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  telefono TEXT,
  email TEXT,
  fecha_nacimiento TEXT,
  direccion TEXT,
  notas TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS citas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paciente_id INTEGER NOT NULL,
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  duracion INTEGER DEFAULT 60,
  servicio TEXT,
  estado TEXT DEFAULT 'pendiente',
  notas TEXT,
  precio REAL,
  recordatorio_enviado INTEGER DEFAULT 0,
  review_enviado INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tratamientos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paciente_id INTEGER NOT NULL,
  cita_id INTEGER,
  fecha TEXT NOT NULL,
  tipo TEXT NOT NULL,
  zona TEXT,
  observaciones TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Notas clínicas (historial por sesión)
CREATE TABLE IF NOT EXISTS notas_clinicas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paciente_id INTEGER NOT NULL,
  cita_id INTEGER,
  fecha TEXT NOT NULL,
  motivo TEXT,
  exploracion TEXT,
  diagnostico TEXT,
  tratamiento_realizado TEXT,
  recomendaciones TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE SET NULL
);

-- Bonos/packs de sesiones
CREATE TABLE IF NOT EXISTS bonos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  paciente_id INTEGER NOT NULL,
  nombre TEXT NOT NULL,
  sesiones_total INTEGER NOT NULL,
  sesiones_usadas INTEGER DEFAULT 0,
  precio REAL,
  fecha_compra TEXT NOT NULL,
  fecha_caducidad TEXT,
  estado TEXT DEFAULT 'activo',
  notas TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_tratamientos_paciente ON tratamientos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_notas_clinicas_paciente ON notas_clinicas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_bonos_paciente ON bonos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_bonos_estado ON bonos(estado);

-- Campos clínicos para pacientes (ejecutar manualmente en D1)
-- ALTER TABLE pacientes ADD COLUMN motivo_consulta TEXT;
-- ALTER TABLE pacientes ADD COLUMN antecedentes TEXT;
-- ALTER TABLE pacientes ADD COLUMN alergias TEXT;
-- ALTER TABLE pacientes ADD COLUMN profesion TEXT;
-- ALTER TABLE pacientes ADD COLUMN origen TEXT;
