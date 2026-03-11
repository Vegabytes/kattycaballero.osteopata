import type { AstroGlobal } from 'astro';

export interface Paciente {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string | null;
  email: string | null;
  fecha_nacimiento: string | null;
  direccion: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface Cita {
  id: number;
  paciente_id: number;
  fecha: string;
  hora: string;
  duracion: number;
  servicio: string | null;
  estado: string;
  notas: string | null;
  precio: number | null;
  created_at: string;
  // Joined
  paciente_nombre?: string;
  paciente_apellidos?: string;
}

export interface Tratamiento {
  id: number;
  paciente_id: number;
  cita_id: number | null;
  fecha: string;
  tipo: string;
  zona: string | null;
  observaciones: string | null;
  created_at: string;
  // Joined
  paciente_nombre?: string;
  paciente_apellidos?: string;
}

function getDB(Astro: AstroGlobal) {
  return (Astro.locals as any).runtime.env.DB;
}

// === PACIENTES ===

export async function getPacientes(Astro: AstroGlobal, buscar?: string): Promise<Paciente[]> {
  const db = getDB(Astro);
  if (buscar) {
    return (await db
      .prepare('SELECT * FROM pacientes WHERE nombre LIKE ? OR apellidos LIKE ? OR telefono LIKE ? ORDER BY apellidos, nombre')
      .bind(`%${buscar}%`, `%${buscar}%`, `%${buscar}%`)
      .all()).results as Paciente[];
  }
  return (await db.prepare('SELECT * FROM pacientes ORDER BY apellidos, nombre').all()).results as Paciente[];
}

export async function getPaciente(Astro: AstroGlobal, id: number): Promise<Paciente | null> {
  const db = getDB(Astro);
  return await db.prepare('SELECT * FROM pacientes WHERE id = ?').bind(id).first() as Paciente | null;
}

export async function crearPaciente(Astro: AstroGlobal, data: Partial<Paciente>): Promise<number> {
  const db = getDB(Astro);
  const result = await db
    .prepare('INSERT INTO pacientes (nombre, apellidos, telefono, email, fecha_nacimiento, direccion, notas) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(data.nombre, data.apellidos, data.telefono || null, data.email || null, data.fecha_nacimiento || null, data.direccion || null, data.notas || null)
    .run();
  return result.meta.last_row_id;
}

export async function actualizarPaciente(Astro: AstroGlobal, id: number, data: Partial<Paciente>): Promise<void> {
  const db = getDB(Astro);
  await db
    .prepare('UPDATE pacientes SET nombre = ?, apellidos = ?, telefono = ?, email = ?, fecha_nacimiento = ?, direccion = ?, notas = ?, updated_at = datetime(\'now\') WHERE id = ?')
    .bind(data.nombre, data.apellidos, data.telefono || null, data.email || null, data.fecha_nacimiento || null, data.direccion || null, data.notas || null, id)
    .run();
}

export async function eliminarPaciente(Astro: AstroGlobal, id: number): Promise<void> {
  const db = getDB(Astro);
  await db.prepare('DELETE FROM pacientes WHERE id = ?').bind(id).run();
}

// === CITAS ===

export async function getCitas(Astro: AstroGlobal, fecha?: string, pacienteId?: number): Promise<Cita[]> {
  const db = getDB(Astro);
  let query = `SELECT c.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos
    FROM citas c JOIN pacientes p ON c.paciente_id = p.id`;
  const conditions: string[] = [];
  const params: any[] = [];

  if (fecha) {
    conditions.push('c.fecha = ?');
    params.push(fecha);
  }
  if (pacienteId) {
    conditions.push('c.paciente_id = ?');
    params.push(pacienteId);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY c.fecha DESC, c.hora ASC';

  let stmt = db.prepare(query);
  if (params.length > 0) {
    stmt = stmt.bind(...params);
  }
  return (await stmt.all()).results as Cita[];
}

export async function getCitasSemana(Astro: AstroGlobal, fechaInicio: string, fechaFin: string): Promise<Cita[]> {
  const db = getDB(Astro);
  return (await db
    .prepare(`SELECT c.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos
      FROM citas c JOIN pacientes p ON c.paciente_id = p.id
      WHERE c.fecha >= ? AND c.fecha <= ? ORDER BY c.fecha, c.hora`)
    .bind(fechaInicio, fechaFin)
    .all()).results as Cita[];
}

export async function getCita(Astro: AstroGlobal, id: number): Promise<Cita | null> {
  const db = getDB(Astro);
  return await db
    .prepare(`SELECT c.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos
      FROM citas c JOIN pacientes p ON c.paciente_id = p.id WHERE c.id = ?`)
    .bind(id)
    .first() as Cita | null;
}

export async function crearCita(Astro: AstroGlobal, data: Partial<Cita>): Promise<number> {
  const db = getDB(Astro);
  const result = await db
    .prepare('INSERT INTO citas (paciente_id, fecha, hora, duracion, servicio, estado, notas, precio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(data.paciente_id, data.fecha, data.hora, data.duracion || 60, data.servicio || null, data.estado || 'pendiente', data.notas || null, data.precio || null)
    .run();
  return result.meta.last_row_id;
}

export async function actualizarCita(Astro: AstroGlobal, id: number, data: Partial<Cita>): Promise<void> {
  const db = getDB(Astro);
  await db
    .prepare('UPDATE citas SET paciente_id = ?, fecha = ?, hora = ?, duracion = ?, servicio = ?, estado = ?, notas = ?, precio = ? WHERE id = ?')
    .bind(data.paciente_id, data.fecha, data.hora, data.duracion || 60, data.servicio || null, data.estado || 'pendiente', data.notas || null, data.precio || null, id)
    .run();
}

export async function eliminarCita(Astro: AstroGlobal, id: number): Promise<void> {
  const db = getDB(Astro);
  await db.prepare('DELETE FROM citas WHERE id = ?').bind(id).run();
}

// === TRATAMIENTOS ===

export async function getTratamientos(Astro: AstroGlobal, pacienteId?: number): Promise<Tratamiento[]> {
  const db = getDB(Astro);
  let query = `SELECT t.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos
    FROM tratamientos t JOIN pacientes p ON t.paciente_id = p.id`;

  if (pacienteId) {
    query += ' WHERE t.paciente_id = ?';
    return (await db.prepare(query + ' ORDER BY t.fecha DESC').bind(pacienteId).all()).results as Tratamiento[];
  }
  return (await db.prepare(query + ' ORDER BY t.fecha DESC').all()).results as Tratamiento[];
}

export async function getTratamiento(Astro: AstroGlobal, id: number): Promise<Tratamiento | null> {
  const db = getDB(Astro);
  return await db
    .prepare(`SELECT t.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos
      FROM tratamientos t JOIN pacientes p ON t.paciente_id = p.id WHERE t.id = ?`)
    .bind(id)
    .first() as Tratamiento | null;
}

export async function crearTratamiento(Astro: AstroGlobal, data: Partial<Tratamiento>): Promise<number> {
  const db = getDB(Astro);
  const result = await db
    .prepare('INSERT INTO tratamientos (paciente_id, cita_id, fecha, tipo, zona, observaciones) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(data.paciente_id, data.cita_id || null, data.fecha, data.tipo, data.zona || null, data.observaciones || null)
    .run();
  return result.meta.last_row_id;
}

export async function actualizarTratamiento(Astro: AstroGlobal, id: number, data: Partial<Tratamiento>): Promise<void> {
  const db = getDB(Astro);
  await db
    .prepare('UPDATE tratamientos SET paciente_id = ?, cita_id = ?, fecha = ?, tipo = ?, zona = ?, observaciones = ? WHERE id = ?')
    .bind(data.paciente_id, data.cita_id || null, data.fecha, data.tipo, data.zona || null, data.observaciones || null, id)
    .run();
}

export async function eliminarTratamiento(Astro: AstroGlobal, id: number): Promise<void> {
  const db = getDB(Astro);
  await db.prepare('DELETE FROM tratamientos WHERE id = ?').bind(id).run();
}

// === ESTADÍSTICAS ===

export async function getEstadisticas(Astro: AstroGlobal) {
  const db = getDB(Astro);
  const hoy = new Date().toISOString().split('T')[0];

  const [totalPacientes, citasHoy, citasSemana, citasPendientes] = await Promise.all([
    db.prepare('SELECT COUNT(*) as total FROM pacientes').first(),
    db.prepare('SELECT COUNT(*) as total FROM citas WHERE fecha = ?').bind(hoy).first(),
    db.prepare('SELECT COUNT(*) as total FROM citas WHERE fecha >= ? AND fecha <= ?')
      .bind(hoy, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).first(),
    db.prepare('SELECT COUNT(*) as total FROM citas WHERE estado = \'pendiente\' AND fecha >= ?').bind(hoy).first(),
  ]);

  return {
    totalPacientes: (totalPacientes as any)?.total || 0,
    citasHoy: (citasHoy as any)?.total || 0,
    citasSemana: (citasSemana as any)?.total || 0,
    citasPendientes: (citasPendientes as any)?.total || 0,
  };
}
