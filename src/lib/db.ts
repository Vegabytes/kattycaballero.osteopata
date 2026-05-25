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
  metodo_pago: string | null;
  created_at: string;
  // Joined
  paciente_nombre?: string;
  paciente_apellidos?: string;
  paciente_telefono?: string | null;
}

export interface NotaClinica {
  id: number;
  paciente_id: number;
  cita_id: number | null;
  fecha: string;
  motivo: string | null;
  exploracion: string | null;
  diagnostico: string | null;
  tratamiento_realizado: string | null;
  recomendaciones: string | null;
  created_at: string;
  // Joined
  paciente_nombre?: string;
  paciente_apellidos?: string;
}

export interface Bono {
  id: number;
  paciente_id: number;
  nombre: string;
  sesiones_total: number;
  sesiones_usadas: number;
  precio: number | null;
  fecha_compra: string;
  fecha_caducidad: string | null;
  estado: string;
  notas: string | null;
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

export function getDB(Astro: AstroGlobal) {
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

export async function crearPaciente(Astro: AstroGlobal, data: Partial<Paciente> & Record<string, any>): Promise<number> {
  const db = getDB(Astro);
  const result = await db
    .prepare('INSERT INTO pacientes (nombre, apellidos, telefono, email, fecha_nacimiento, direccion, notas, motivo_consulta, antecedentes, alergias, profesion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(data.nombre, data.apellidos, data.telefono || null, data.email || null, data.fecha_nacimiento || null, data.direccion || null, data.notas || null, data.motivo_consulta || null, data.antecedentes || null, data.alergias || null, data.profesion || null)
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
    .prepare(`SELECT c.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos, p.telefono as paciente_telefono
      FROM citas c JOIN pacientes p ON c.paciente_id = p.id
      WHERE c.fecha >= ? AND c.fecha <= ? ORDER BY c.fecha, c.hora`)
    .bind(fechaInicio, fechaFin)
    .all()).results as Cita[];
}

export async function getCita(Astro: AstroGlobal, id: number): Promise<Cita | null> {
  const db = getDB(Astro);
  return await db
    .prepare(`SELECT c.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos, p.telefono as paciente_telefono, p.alergias as paciente_alergias, p.motivo_consulta as paciente_motivo, p.antecedentes as paciente_antecedentes
      FROM citas c JOIN pacientes p ON c.paciente_id = p.id WHERE c.id = ?`)
    .bind(id)
    .first() as Cita | null;
}

export async function crearCita(Astro: AstroGlobal, data: Partial<Cita>): Promise<number> {
  const db = getDB(Astro);
  const result = await db
    .prepare('INSERT INTO citas (paciente_id, fecha, hora, duracion, servicio, estado, notas, precio, metodo_pago) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(data.paciente_id, data.fecha, data.hora, data.duracion || 60, data.servicio || null, data.estado || 'pendiente', data.notas || null, data.precio || null, data.metodo_pago || null)
    .run();
  return result.meta.last_row_id;
}

export async function actualizarCita(Astro: AstroGlobal, id: number, data: Partial<Cita>): Promise<void> {
  const db = getDB(Astro);
  await db
    .prepare('UPDATE citas SET paciente_id = ?, fecha = ?, hora = ?, duracion = ?, servicio = ?, estado = ?, notas = ?, precio = ?, metodo_pago = ? WHERE id = ?')
    .bind(data.paciente_id, data.fecha, data.hora, data.duracion || 60, data.servicio || null, data.estado || 'pendiente', data.notas || null, data.precio || null, data.metodo_pago || null, id)
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

// === NOTAS CLÍNICAS ===

export async function getNotasClinicas(Astro: AstroGlobal, pacienteId?: number): Promise<NotaClinica[]> {
  const db = getDB(Astro);
  let query = `SELECT n.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos
    FROM notas_clinicas n JOIN pacientes p ON n.paciente_id = p.id`;

  if (pacienteId) {
    query += ' WHERE n.paciente_id = ?';
    return (await db.prepare(query + ' ORDER BY n.fecha DESC').bind(pacienteId).all()).results as NotaClinica[];
  }
  return (await db.prepare(query + ' ORDER BY n.fecha DESC').all()).results as NotaClinica[];
}

export async function getNotaClinica(Astro: AstroGlobal, id: number): Promise<NotaClinica | null> {
  const db = getDB(Astro);
  return await db
    .prepare(`SELECT n.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos
      FROM notas_clinicas n JOIN pacientes p ON n.paciente_id = p.id WHERE n.id = ?`)
    .bind(id)
    .first() as NotaClinica | null;
}

export async function crearNotaClinica(Astro: AstroGlobal, data: Partial<NotaClinica>): Promise<number> {
  const db = getDB(Astro);
  const result = await db
    .prepare('INSERT INTO notas_clinicas (paciente_id, cita_id, fecha, motivo, exploracion, diagnostico, tratamiento_realizado, recomendaciones) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(data.paciente_id, data.cita_id || null, data.fecha, data.motivo || null, data.exploracion || null, data.diagnostico || null, data.tratamiento_realizado || null, data.recomendaciones || null)
    .run();
  return result.meta.last_row_id;
}

export async function actualizarNotaClinica(Astro: AstroGlobal, id: number, data: Partial<NotaClinica>): Promise<void> {
  const db = getDB(Astro);
  await db
    .prepare('UPDATE notas_clinicas SET paciente_id = ?, cita_id = ?, fecha = ?, motivo = ?, exploracion = ?, diagnostico = ?, tratamiento_realizado = ?, recomendaciones = ? WHERE id = ?')
    .bind(data.paciente_id, data.cita_id || null, data.fecha, data.motivo || null, data.exploracion || null, data.diagnostico || null, data.tratamiento_realizado || null, data.recomendaciones || null, id)
    .run();
}

export async function eliminarNotaClinica(Astro: AstroGlobal, id: number): Promise<void> {
  const db = getDB(Astro);
  await db.prepare('DELETE FROM notas_clinicas WHERE id = ?').bind(id).run();
}

// === BONOS ===

export async function getBonos(Astro: AstroGlobal, buscarOrPacienteId?: string | number): Promise<Bono[]> {
  const db = getDB(Astro);
  let query = `SELECT b.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos
    FROM bonos b JOIN pacientes p ON b.paciente_id = p.id`;

  if (typeof buscarOrPacienteId === 'number') {
    query += ' WHERE b.paciente_id = ?';
    return (await db.prepare(query + ' ORDER BY b.fecha_compra DESC').bind(buscarOrPacienteId).all()).results as Bono[];
  }
  if (typeof buscarOrPacienteId === 'string' && buscarOrPacienteId) {
    query += ` WHERE p.nombre LIKE ? OR p.apellidos LIKE ? OR b.nombre LIKE ?`;
    return (await db.prepare(query + ' ORDER BY b.fecha_compra DESC').bind(`%${buscarOrPacienteId}%`, `%${buscarOrPacienteId}%`, `%${buscarOrPacienteId}%`).all()).results as Bono[];
  }
  return (await db.prepare(query + ' ORDER BY b.fecha_compra DESC').all()).results as Bono[];
}

export async function getBono(Astro: AstroGlobal, id: number): Promise<Bono | null> {
  const db = getDB(Astro);
  return await db
    .prepare(`SELECT b.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos, p.telefono as paciente_telefono
      FROM bonos b JOIN pacientes p ON b.paciente_id = p.id WHERE b.id = ?`)
    .bind(id)
    .first() as Bono | null;
}

export async function crearBono(Astro: AstroGlobal, data: Partial<Bono>): Promise<number> {
  const db = getDB(Astro);
  const result = await db
    .prepare('INSERT INTO bonos (paciente_id, nombre, sesiones_total, sesiones_usadas, precio, fecha_compra, fecha_caducidad, estado, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(data.paciente_id, data.nombre, data.sesiones_total, data.sesiones_usadas ?? 0, data.precio ?? null, data.fecha_compra, data.fecha_caducidad || null, data.estado || 'activo', data.notas || null)
    .run();
  return result.meta.last_row_id;
}

export async function actualizarBono(Astro: AstroGlobal, id: number, data: Partial<Bono>): Promise<void> {
  const db = getDB(Astro);
  await db
    .prepare('UPDATE bonos SET paciente_id = ?, nombre = ?, sesiones_total = ?, sesiones_usadas = ?, precio = ?, fecha_compra = ?, fecha_caducidad = ?, estado = ?, notas = ? WHERE id = ?')
    .bind(data.paciente_id, data.nombre, data.sesiones_total, data.sesiones_usadas ?? 0, data.precio ?? null, data.fecha_compra, data.fecha_caducidad || null, data.estado || 'activo', data.notas || null, id)
    .run();
}

export async function usarSesionBono(Astro: AstroGlobal, id: number): Promise<void> {
  const db = getDB(Astro);
  const bono = await db.prepare('SELECT sesiones_total, sesiones_usadas, estado FROM bonos WHERE id = ?').bind(id).first() as any;
  if (!bono) throw new Error('Bono no encontrado');
  if (bono.estado !== 'activo') throw new Error('El bono no está activo');
  if ((bono.sesiones_usadas || 0) >= bono.sesiones_total) throw new Error('Todas las sesiones ya han sido usadas');

  const nuevasUsadas = (bono.sesiones_usadas || 0) + 1;
  const nuevoEstado = nuevasUsadas >= bono.sesiones_total ? 'completado' : 'activo';

  await db
    .prepare('UPDATE bonos SET sesiones_usadas = ?, estado = ? WHERE id = ?')
    .bind(nuevasUsadas, nuevoEstado, id)
    .run();
}

export async function quitarSesionBono(Astro: AstroGlobal, id: number): Promise<void> {
  const db = getDB(Astro);
  const bono = await db.prepare('SELECT sesiones_total, sesiones_usadas, estado FROM bonos WHERE id = ?').bind(id).first() as any;
  if (!bono) throw new Error('Bono no encontrado');
  if ((bono.sesiones_usadas || 0) <= 0) throw new Error('No hay sesiones usadas para quitar');

  const nuevasUsadas = (bono.sesiones_usadas || 0) - 1;
  const nuevoEstado = nuevasUsadas < bono.sesiones_total ? 'activo' : 'completado';

  await db
    .prepare('UPDATE bonos SET sesiones_usadas = ?, estado = ? WHERE id = ?')
    .bind(nuevasUsadas, nuevoEstado, id)
    .run();
}

export async function eliminarBono(Astro: AstroGlobal, id: number): Promise<void> {
  const db = getDB(Astro);
  await db.prepare('DELETE FROM bonos WHERE id = ?').bind(id).run();
}

export async function getBonosActivos(Astro: AstroGlobal, pacienteId: number): Promise<Bono[]> {
  const db = getDB(Astro);
  return (await db
    .prepare(`SELECT b.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos
      FROM bonos b JOIN pacientes p ON b.paciente_id = p.id
      WHERE b.paciente_id = ? AND b.estado = 'activo' ORDER BY b.fecha_compra DESC`)
    .bind(pacienteId)
    .all()).results as Bono[];
}

// === ESTADÍSTICAS COMPLETAS ===

export async function getEstadisticasCompletas(Astro: AstroGlobal) {
  const db = getDB(Astro);
  const hoy = new Date().toISOString().split('T')[0];
  const inicioMes = hoy.substring(0, 7) + '-01';
  const finSemana = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [totalPacientes, citasHoy, citasSemana, citasPendientes, pacientesNuevosMes, ingresosMes, citasCompletadasMes, bonosActivos] = await Promise.all([
    db.prepare('SELECT COUNT(*) as total FROM pacientes').first(),
    db.prepare('SELECT COUNT(*) as total FROM citas WHERE fecha = ?').bind(hoy).first(),
    db.prepare('SELECT COUNT(*) as total FROM citas WHERE fecha >= ? AND fecha <= ?').bind(hoy, finSemana).first(),
    db.prepare('SELECT COUNT(*) as total FROM citas WHERE estado = \'pendiente\' AND fecha >= ?').bind(hoy).first(),
    db.prepare('SELECT COUNT(*) as total FROM pacientes WHERE created_at >= ?').bind(inicioMes).first(),
    db.prepare('SELECT COALESCE(SUM(precio), 0) as total FROM citas WHERE estado = \'completada\' AND fecha >= ? AND fecha < ?').bind(inicioMes, hoy + 'Z').first(),
    db.prepare('SELECT COUNT(*) as total FROM citas WHERE estado = \'completada\' AND fecha >= ?').bind(inicioMes).first(),
    db.prepare('SELECT COUNT(*) as total FROM bonos WHERE estado = \'activo\'').first(),
  ]);

  return {
    totalPacientes: (totalPacientes as any)?.total || 0,
    citasHoy: (citasHoy as any)?.total || 0,
    citasSemana: (citasSemana as any)?.total || 0,
    citasPendientes: (citasPendientes as any)?.total || 0,
    pacientesNuevosMes: (pacientesNuevosMes as any)?.total || 0,
    ingresosMes: (ingresosMes as any)?.total || 0,
    citasCompletadasMes: (citasCompletadasMes as any)?.total || 0,
    bonosActivos: (bonosActivos as any)?.total || 0,
  };
}

// === CONTABILIDAD: GASTOS ===

export interface Gasto {
  id: number;
  fecha: string;
  concepto: string;
  categoria: string;
  proveedor: string | null;
  base: number;      // base imponible
  tipo_iva: number;  // % de IVA (0, 4, 10, 21)
  iva: number;       // cuota de IVA soportado
  total: number;     // base + iva (lo realmente pagado)
  deducible: number; // 1 = deducible, 0 = no
  metodo_pago: string | null;
  notas: string | null;
  created_at: string;
}

// Categorías de gasto del autónomo (clave => etiqueta)
export const CATEGORIAS_GASTO: Record<string, string> = {
  asesoria: 'Asesoría / Gestoría',
  material: 'Material clínico / fungible',
  equipamiento: 'Equipamiento (camilla, etc.)',
  suministros: 'Suministros (luz, teléfono, internet)',
  alquiler: 'Alquiler del local',
  formacion: 'Formación',
  marketing: 'Marketing / Web',
  cuota_autonomo: 'Cuota de autónomos',
  otros: 'Otros',
};

// Métodos de pago aceptados (clave => etiqueta)
export const METODOS_PAGO: Record<string, string> = {
  efectivo: 'Efectivo',
  bizum: 'Bizum',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

export async function getGastos(
  Astro: AstroGlobal,
  opts: { desde?: string; hasta?: string; categoria?: string } = {}
): Promise<Gasto[]> {
  const db = getDB(Astro);
  const conditions: string[] = [];
  const params: any[] = [];

  if (opts.desde) { conditions.push('fecha >= ?'); params.push(opts.desde); }
  if (opts.hasta) { conditions.push('fecha <= ?'); params.push(opts.hasta); }
  if (opts.categoria) { conditions.push('categoria = ?'); params.push(opts.categoria); }

  let query = 'SELECT * FROM gastos';
  if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY fecha DESC, id DESC';

  let stmt = db.prepare(query);
  if (params.length > 0) stmt = stmt.bind(...params);
  return (await stmt.all()).results as Gasto[];
}

export async function getGasto(Astro: AstroGlobal, id: number): Promise<Gasto | null> {
  const db = getDB(Astro);
  return await db.prepare('SELECT * FROM gastos WHERE id = ?').bind(id).first() as Gasto | null;
}

export async function crearGasto(Astro: AstroGlobal, data: Partial<Gasto>): Promise<number> {
  const db = getDB(Astro);
  const result = await db
    .prepare('INSERT INTO gastos (fecha, concepto, categoria, proveedor, base, tipo_iva, iva, total, deducible, metodo_pago, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(
      data.fecha, data.concepto, data.categoria || 'otros', data.proveedor || null,
      data.base ?? 0, data.tipo_iva ?? 0, data.iva ?? 0, data.total ?? 0,
      data.deducible ?? 1, data.metodo_pago || null, data.notas || null
    )
    .run();
  return result.meta.last_row_id;
}

export async function actualizarGasto(Astro: AstroGlobal, id: number, data: Partial<Gasto>): Promise<void> {
  const db = getDB(Astro);
  await db
    .prepare('UPDATE gastos SET fecha = ?, concepto = ?, categoria = ?, proveedor = ?, base = ?, tipo_iva = ?, iva = ?, total = ?, deducible = ?, metodo_pago = ?, notas = ? WHERE id = ?')
    .bind(
      data.fecha, data.concepto, data.categoria || 'otros', data.proveedor || null,
      data.base ?? 0, data.tipo_iva ?? 0, data.iva ?? 0, data.total ?? 0,
      data.deducible ?? 1, data.metodo_pago || null, data.notas || null, id
    )
    .run();
}

export async function eliminarGasto(Astro: AstroGlobal, id: number): Promise<void> {
  const db = getDB(Astro);
  await db.prepare('DELETE FROM gastos WHERE id = ?').bind(id).run();
}

// === CONTABILIDAD: RESUMEN ===

export interface ResumenContable {
  ingresos: number;                              // total cobrado (citas completadas)
  ingresosPorMetodo: { metodo: string; total: number; n: number }[];
  gastos: number;                                // total gastos (base + iva)
  gastosPorCategoria: { categoria: string; total: number; n: number }[];
  ivaSoportado: number;                          // IVA deducible de gastos
  ivaRepercutido: number;                        // IVA cobrado en servicios (según tipo configurado)
  resultado: number;                             // ingresos - gastos
}

/**
 * Resumen contable de un periodo [desde, hasta] (fechas YYYY-MM-DD inclusive).
 * tipoIvaServicios: % de IVA que repercute en sus servicios (0 = exenta / no factura).
 */
export async function getResumenContable(
  Astro: AstroGlobal,
  desde: string,
  hasta: string,
  tipoIvaServicios = 0
): Promise<ResumenContable> {
  const db = getDB(Astro);

  const [ingresosRow, metodos, gastosCat] = await Promise.all([
    db.prepare("SELECT COALESCE(SUM(precio), 0) as total FROM citas WHERE estado = 'completada' AND fecha >= ? AND fecha <= ?")
      .bind(desde, hasta).first(),
    db.prepare("SELECT COALESCE(metodo_pago, 'sin_especificar') as metodo, COALESCE(SUM(precio), 0) as total, COUNT(*) as n FROM citas WHERE estado = 'completada' AND fecha >= ? AND fecha <= ? GROUP BY metodo_pago ORDER BY total DESC")
      .bind(desde, hasta).all(),
    db.prepare('SELECT categoria, COALESCE(SUM(total), 0) as total, COUNT(*) as n FROM gastos WHERE fecha >= ? AND fecha <= ? GROUP BY categoria ORDER BY total DESC')
      .bind(desde, hasta).all(),
    ]);

  const ivaSoportadoRow = await db
    .prepare('SELECT COALESCE(SUM(iva), 0) as total FROM gastos WHERE deducible = 1 AND fecha >= ? AND fecha <= ?')
    .bind(desde, hasta).first();

  const ingresos = (ingresosRow as any)?.total || 0;
  const gastosPorCategoria = ((gastosCat as any).results || []) as { categoria: string; total: number; n: number }[];
  const gastos = gastosPorCategoria.reduce((s, g) => s + g.total, 0);
  const ivaSoportado = (ivaSoportadoRow as any)?.total || 0;

  // IVA repercutido: si tributa con IVA, el precio cobrado se considera IVA incluido.
  const ivaRepercutido = tipoIvaServicios > 0
    ? ingresos - ingresos / (1 + tipoIvaServicios / 100)
    : 0;

  return {
    ingresos,
    ingresosPorMetodo: ((metodos as any).results || []) as { metodo: string; total: number; n: number }[],
    gastos,
    gastosPorCategoria,
    ivaSoportado,
    ivaRepercutido,
    resultado: ingresos - gastos,
  };
}
