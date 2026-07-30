/*
  seed.js — Siembra inicial de la BD (espeja overseer/src/data/).

  Se ejecuta al arrancar: para CADA tabla, si está vacía, la puebla con las
  mismas semillas del mock. Es idempotente (no duplica) y por-tabla (si más
  adelante se vacía una sola, se resiembra sola).

  Fechas RELATIVAS a hoy, igual que el mock: así la demo siempre muestra
  miembros vigentes/por-vencer/vencidos, eventos próximos y cilindros de gas
  recientes, sin importar cuándo se cree la BD. Se siembra con `ord` creciente
  (1,2,3…) para que el orden de lectura (ORDER BY ord ASC) sea el del array.
*/

import { db } from './db.js';
import { todayDMY, addDays, addMonths, formatDMY, todayAtMidnight, dateKey, parseDMY } from './lib/date.js';
import { createSeededRandom } from './lib/seededRandom.js';

/** ¿La tabla está vacía? (para sembrar solo una vez). */
function isEmpty(table) {
  return db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n === 0;
}

/* ══════════════════ MIEMBROS ══════════════════ */
function seedMembers() {
  if (!isEmpty('members')) return;
  const hoy = todayDMY();
  const finValeria = addDays(hoy, 18);
  const finAndres = addDays(hoy, 33);
  const finCamila = addDays(hoy, 21);
  const finJorge = addDays(hoy, 80);
  const finLuisa = addDays(hoy, 3);   // → "vence pronto" (ventana de 7 días)
  const finMateo = addDays(hoy, -4);  // → "vencido"
  const rows = [
    { id: 'm-seed-1', nombre: 'Valeria Gómez', cedula: '1045882310', telefono: '3005128841', inicio: addMonths(finValeria, -1), fin: finValeria, tipo: '1 mes', recibo: 'RC-1042', valor: 70000, obs: 'Prefiere clases en la mañana' },
    { id: 'm-seed-2', nombre: 'Andrés Restrepo', cedula: '98552104', telefono: '3112047765', inicio: addMonths(finAndres, -3), fin: finAndres, tipo: '3 meses', recibo: 'RC-1038', valor: 180000, obs: '' },
    { id: 'm-seed-3', nombre: 'Camila Torres', cedula: '1152336902', telefono: '3208841290', inicio: addMonths(finCamila, -1), fin: finCamila, tipo: '1 mes', recibo: 'RC-1051', valor: 70000, obs: 'Pago pendiente de confirmación' },
    { id: 'm-seed-4', nombre: 'Jorge Palacio', cedula: '71334856', telefono: '3046672318', inicio: addMonths(finJorge, -3), fin: finJorge, tipo: '3 meses', recibo: 'RC-0987', valor: 180000, obs: '' },
    { id: 'm-seed-5', nombre: 'Luisa Fernanda', cedula: '1020774415', telefono: '3159904472', inicio: addMonths(finLuisa, -1), fin: finLuisa, tipo: '1 mes', recibo: 'RC-1046', valor: 70000, obs: 'Lesión de rodilla — rutina adaptada' },
    { id: 'm-seed-6', nombre: 'Mateo Cárdenas', cedula: '1234007881', telefono: '3014459034', inicio: addDays(finMateo, -15), fin: finMateo, tipo: 'Quincena', recibo: 'RC-1055', valor: 12000, obs: '' },
  ];
  const stmt = db.prepare(`INSERT INTO members (id, ord, nombre, cedula, telefono, inicio, fin, tipo, recibo, valor, obs)
    VALUES (@id, @ord, @nombre, @cedula, @telefono, @inicio, @fin, @tipo, @recibo, @valor, @obs)`);
  rows.forEach((r, i) => stmt.run({ ...r, ord: i + 1 }));
}

/* ══════════════════ EVENTOS ══════════════════ */
function seedEvents() {
  if (!isEmpty('events')) return;
  const dayKey = (offset) => { const d = todayAtMidnight(); d.setDate(d.getDate() + offset); return dateKey(d); };
  const rows = [
    { id: 'ev-seed-1', dateKey: dayKey(0), title: 'Reserva sala spinning', time: '07:00', type: 'Reserva' },
    { id: 'ev-seed-2', dateKey: dayKey(1), title: 'Clase de yoga', time: '09:00', type: 'Clase' },
    { id: 'ev-seed-3', dateKey: dayKey(1), title: 'Llamar proveedores', time: '14:00', type: 'Tarea' },
    { id: 'ev-seed-4', dateKey: dayKey(3), title: 'Mantenimiento de máquinas', time: '11:00', type: 'Tarea' },
    { id: 'ev-seed-5', dateKey: dayKey(5), title: 'Reserva zona funcional', time: '18:30', type: 'Reserva' },
  ];
  const stmt = db.prepare(`INSERT INTO events (id, ord, dateKey, title, time, type)
    VALUES (@id, @ord, @dateKey, @title, @time, @type)`);
  rows.forEach((r, i) => stmt.run({ ...r, ord: i + 1 }));
}

/* ══════════════════ PRODUCTOS ══════════════════ */
function seedProducts() {
  if (!isEmpty('products')) return;
  const rows = [
    { id: 'pr-agua', nombre: 'Agua 600ml', categoria: 'Bebidas', stock: 40, venta: 3000, compra: 1800 },
    { id: 'pr-hidratante', nombre: 'Bebida hidratante', categoria: 'Bebidas', stock: 12, venta: 5000, compra: 3000 },
    { id: 'pr-whey', nombre: 'Proteína Whey 1kg', categoria: 'Suplementos', stock: 3, venta: 95000, compra: 65000 },
    { id: 'pr-creatina', nombre: 'Creatina 300g', categoria: 'Suplementos', stock: 7, venta: 60000, compra: 40000 },
    { id: 'pr-preentreno', nombre: 'Pre-entreno', categoria: 'Suplementos', stock: 0, venta: 75000, compra: 50000 },
    { id: 'pr-guantes', nombre: 'Guantes de entrenamiento', categoria: 'Accesorios', stock: 5, venta: 35000, compra: 22000 },
    { id: 'pr-toallas', nombre: 'Toallas de gimnasio', categoria: 'Accesorios', stock: 18, venta: 18000, compra: 11000 },
    { id: 'pr-shaker', nombre: 'Shaker', categoria: 'Accesorios', stock: 22, venta: 15000, compra: 9000 },
  ];
  const stmt = db.prepare(`INSERT INTO products (id, ord, nombre, categoria, stock, venta, compra)
    VALUES (@id, @ord, @nombre, @categoria, @stock, @venta, @compra)`);
  rows.forEach((r, i) => stmt.run({ ...r, ord: i + 1 }));
}

/* ══════════════════ EQUIPOS ══════════════════ */
function seedEquipment() {
  if (!isEmpty('equipment')) return;
  const rows = [
    { id: 'eq-caminadora', nombre: 'Caminadora eléctrica', cantidad: 4, estado: 'Operativo', revision: '12/06/2026', obs: 'Banda #2 requiere lubricación' },
    { id: 'eq-bicicleta', nombre: 'Bicicleta estática', cantidad: 6, estado: 'Operativo', revision: '01/07/2026', obs: 'Sin novedades' },
    { id: 'eq-prensa', nombre: 'Prensa de piernas', cantidad: 2, estado: 'Mantenimiento', revision: '28/06/2026', obs: 'Cambio de cable pendiente' },
    { id: 'eq-multifuerza', nombre: 'Multifuerza', cantidad: 1, estado: 'Operativo', revision: '15/05/2026', obs: 'Revisar poleas superiores' },
    { id: 'eq-rack', nombre: 'Rack de sentadilla', cantidad: 3, estado: 'Operativo', revision: '20/06/2026', obs: 'Sin novedades' },
    { id: 'eq-eliptica', nombre: 'Elíptica', cantidad: 2, estado: 'Fuera de servicio', revision: '10/04/2026', obs: 'Motor dañado — en cotización' },
  ];
  const stmt = db.prepare(`INSERT INTO equipment (id, ord, nombre, cantidad, estado, revision, obs)
    VALUES (@id, @ord, @nombre, @cantidad, @estado, @revision, @obs)`);
  rows.forEach((r, i) => stmt.run({ ...r, ord: i + 1 }));
}

/* ══════════════════ GAS (cilindros + usos) ══════════════════ */
const SVC_CYCLE = ['Turco', 'Jacuzzi', 'Turco', 'Jacuzzi', 'Jacuzzi', 'Turco', 'Jacuzzi'];
const HOURS = ['08:15', '10:40', '13:20', '16:05', '18:30', '19:45', '20:10'];
const NOTAS = ['', '', 'Sesión doble', '', 'Grupo reservado', '', ''];

function dayOffset(days) { const d = todayAtMidnight(); d.setDate(d.getDate() + days); return d; }

/** Genera `n` usos terminando en `endDate`, del más antiguo al más reciente (ids deterministas). */
function genUsos(cylId, destino, n, endDate) {
  const arr = [];
  const d = new Date(endDate);
  for (let i = 0; i < n; i++) {
    arr.push({
      id: `${cylId}-u${i}`, fecha: formatDMY(d), hora: HOURS[i % HOURS.length],
      servicio: destino === 'compartido' ? SVC_CYCLE[i % SVC_CYCLE.length] : 'Sauna',
      obs: NOTAS[i % NOTAS.length],
    });
    d.setDate(d.getDate() - (1 + (i % 3)));
  }
  return arr.reverse();
}

function seedGas() {
  if (!isEmpty('gas_cylinders')) return;
  const cyls = [
    { id: 'gas-sauna-a', destino: 'sauna', compra: formatDMY(dayOffset(-52)), precio: 180000, capLb: 60, usos: genUsos('gas-sauna-a', 'sauna', 26, dayOffset(-1)), finalizado: 0, fechaFin: null, usosFinal: null, obsFin: null },
    { id: 'gas-comp-a', destino: 'compartido', compra: formatDMY(dayOffset(-34)), precio: 185000, capLb: 60, usos: genUsos('gas-comp-a', 'compartido', 31, dayOffset(0)), finalizado: 0, fechaFin: null, usosFinal: null, obsFin: null },
    { id: 'gas-sauna-b', destino: 'sauna', compra: formatDMY(dayOffset(-107)), precio: 175000, capLb: 58, usos: genUsos('gas-sauna-b', 'sauna', 58, dayOffset(-53)), finalizado: 1, fechaFin: formatDMY(dayOffset(-53)), usosFinal: 58, obsFin: 'Cilindro rendido por completo, sin novedades.' },
    { id: 'gas-comp-b', destino: 'compartido', compra: formatDMY(dayOffset(-83)), precio: 182000, capLb: 61, usos: genUsos('gas-comp-b', 'compartido', 61, dayOffset(-36)), finalizado: 1, fechaFin: formatDMY(dayOffset(-36)), usosFinal: 61, obsFin: 'Se agotó antes de lo estimado por alta demanda de jacuzzi.' },
    { id: 'gas-sauna-c', destino: 'sauna', compra: formatDMY(dayOffset(-163)), precio: 172000, capLb: 60, usos: genUsos('gas-sauna-c', 'sauna', 60, dayOffset(-109)), finalizado: 1, fechaFin: formatDMY(dayOffset(-109)), usosFinal: 60, obsFin: '' },
  ];
  const cylStmt = db.prepare(`INSERT INTO gas_cylinders (id, ord, destino, compra, precio, capLb, finalizado, fechaFin, usosFinal, obsFin)
    VALUES (@id, @ord, @destino, @compra, @precio, @capLb, @finalizado, @fechaFin, @usosFinal, @obsFin)`);
  const usoStmt = db.prepare(`INSERT INTO gas_usos (id, ord, cylId, fecha, hora, servicio, obs)
    VALUES (@id, @ord, @cylId, @fecha, @hora, @servicio, @obs)`);
  cyls.forEach((c, ci) => {
    const { usos, ...cyl } = c;
    cylStmt.run({ ...cyl, ord: ci + 1 });
    usos.forEach((u, ui) => usoStmt.run({ ...u, ord: ui + 1, cylId: c.id }));
  });
}

/* ══════════════════ PLANES ══════════════════ */
function seedPlans() {
  if (!isEmpty('plans')) return;
  const rows = [
    { id: 'p-quincena', nombre: 'Quincena', duracionDias: 15, precio: 12000, activo: 1 },
    { id: 'p-1mes', nombre: '1 mes', duracionDias: 30, precio: 70000, activo: 1 },
    { id: 'p-2meses', nombre: '2 meses', duracionDias: 60, precio: 130000, activo: 1 },
    { id: 'p-3meses', nombre: '3 meses', duracionDias: 90, precio: 180000, activo: 1 },
    { id: 'p-anual', nombre: 'Anual', duracionDias: 365, precio: 620000, activo: 0 },
  ];
  const stmt = db.prepare(`INSERT INTO plans (id, ord, nombre, duracionDias, precio, activo)
    VALUES (@id, @ord, @nombre, @duracionDias, @precio, @activo)`);
  rows.forEach((r, i) => stmt.run({ ...r, ord: i + 1 }));
}

/* ══════════════════ USUARIOS ══════════════════ */
function seedUsers() {
  if (!isEmpty('users')) return;
  const rows = [
    { id: 'u-andres', nombre: 'Andrés Ríos', email: 'admin@overseer.gym', rol: 'Admin', activity: 'Hace 5 min', activo: 1 },
    { id: 'u-paula', nombre: 'Paula Méndez', email: 'recepcion@overseer.gym', rol: 'Recepción', activity: 'Hace 2 h', activo: 1 },
    { id: 'u-carlos', nombre: 'Carlos Vega', email: 'recepcion2@overseer.gym', rol: 'Recepción', activity: 'Ayer', activo: 1 },
    { id: 'u-diana', nombre: 'Diana López', email: 'entrenador@overseer.gym', rol: 'Entrenador', activity: 'Hace 3 días', activo: 0 },
  ];
  const stmt = db.prepare(`INSERT INTO users (id, ord, nombre, email, rol, activity, activo)
    VALUES (@id, @ord, @nombre, @email, @rol, @activity, @activo)`);
  rows.forEach((r, i) => stmt.run({ ...r, ord: i + 1 }));
}

/* ══════════════════ CLASES ══════════════════ */
function seedClasses() {
  if (!isEmpty('classes')) return;
  const rows = [
    { id: 'cl-spinning', nombre: 'Spinning', coach: 'Camila Rojas', dias: 'Lun · Mié · Vie', hora: '06:00', inscritos: 20, cupo: 25, color: '#3f8bf5', bg: '#16233a' },
    { id: 'cl-crossfit', nombre: 'CrossFit', coach: 'Julián Mesa', dias: 'Lun a Vie', hora: '07:30', inscritos: 15, cupo: 18, color: '#ff6a47', bg: '#241722' },
    { id: 'cl-yoga', nombre: 'Yoga', coach: 'Daniela Cruz', dias: 'Mar · Jue', hora: '09:00', inscritos: 12, cupo: 20, color: '#25c877', bg: '#1a2a22' },
    { id: 'cl-zumba', nombre: 'Zumba', coach: 'Andrea Pineda', dias: 'Mié · Vie', hora: '18:00', inscritos: 28, cupo: 30, color: '#a86ff0', bg: '#221b2e' },
    { id: 'cl-funcional', nombre: 'Funcional', coach: 'Julián Mesa', dias: 'Sábado', hora: '08:00', inscritos: 16, cupo: 22, color: '#ff9e2e', bg: '#2a2417' },
    { id: 'cl-boxeo', nombre: 'Boxeo', coach: 'Marco Díaz', dias: 'Mar · Jue', hora: '19:00', inscritos: 10, cupo: 14, color: '#ff6f4e', bg: '#2a1d29' },
  ];
  const stmt = db.prepare(`INSERT INTO classes (id, ord, nombre, coach, dias, hora, inscritos, cupo, color, bg)
    VALUES (@id, @ord, @nombre, @coach, @dias, @hora, @inscritos, @cupo, @color, @bg)`);
  rows.forEach((r, i) => stmt.run({ ...r, ord: i + 1 }));
}

/* ══════════════════ ENTRENADORES ══════════════════ */
function seedTrainers() {
  if (!isEmpty('trainers')) return;
  const rows = [
    { id: 'tr-camila', nombre: 'Camila Rojas', esp: 'Spinning · Cardio', clientes: 34, clases: 3, activo: 1 },
    { id: 'tr-julian', nombre: 'Julián Mesa', esp: 'CrossFit · Funcional', clientes: 41, clases: 5, activo: 1 },
    { id: 'tr-daniela', nombre: 'Daniela Cruz', esp: 'Yoga · Movilidad', clientes: 22, clases: 2, activo: 1 },
    { id: 'tr-andrea', nombre: 'Andrea Pineda', esp: 'Zumba · Baile', clientes: 38, clases: 2, activo: 1 },
    { id: 'tr-marco', nombre: 'Marco Díaz', esp: 'Boxeo · Fuerza', clientes: 18, clases: 2, activo: 0 },
  ];
  const stmt = db.prepare(`INSERT INTO trainers (id, ord, nombre, esp, clientes, clases, activo)
    VALUES (@id, @ord, @nombre, @esp, @clientes, @clases, @activo)`);
  rows.forEach((r, i) => stmt.run({ ...r, ord: i + 1 }));
}

/* ══════════════════ MOVIMIENTOS (libro mayor) ══════════════════ */
/*
  El libro mayor único (Tramo B) es la tabla `movements`. La sembramos con
  asientos REALES (no un generador al vuelo) para que Finanzas arranque con
  datos consistentes:
    1. El pago de cada miembro semilla (categoría 'membresia', fecha = su inicio).
    2. Un histórico determinista de ~6 meses (ventas, inscripciones, clases,
       gastos, mantenimiento) → da curva real al historial y volumen al desglose.
    3. Gastos fijos recurrentes (nómina, arriendo) → alimentan "Gastos próximos".
  Todo se ordena por fecha desc (más reciente = `ord` menor) para que la lista
  del mes muestre lo nuevo arriba.
*/

// Tipos de ingreso del histórico: categoría del libro + concepto + rango (miles).
const INCOME_KINDS = [
  { cat: 'venta', motivo: 'Venta de inventario', min: 15, max: 120 },
  { cat: 'inscripcion', motivo: 'Inscripción nueva', min: 40, max: 90 },
  { cat: 'clase', motivo: 'Clase especial', min: 60, max: 160 },
  { cat: 'otro', motivo: 'Ingreso vario', min: 10, max: 70 },
];
// Tipos de egreso del histórico: `tipo` del movimiento + concepto + rango (miles).
const EXPENSE_KINDS = [
  { tipo: 'gasto', motivo: 'Servicios públicos', min: 120, max: 600 },
  { tipo: 'gasto', motivo: 'Publicidad', min: 80, max: 300 },
  { tipo: 'salida', motivo: 'Pago a proveedor', min: 100, max: 500 },
  { tipo: 'mantenimiento', motivo: 'Mantenimiento de máquinas', min: 80, max: 350 },
];

function seedMovements() {
  if (!isEmpty('movements')) return;
  const asientos = [];
  const push = (a) => asientos.push({ recurrent: 0, settled: 1, categoria: 'otro', items: {}, ...a });

  // (1) Pago de cada miembro ya sembrado (si tiene monto).
  const members = db.prepare('SELECT nombre, tipo, valor, inicio FROM members').all();
  members.forEach((m) => {
    if (m.valor > 0) {
      push({ tipo: 'entrada', categoria: 'membresia', monto: m.valor, fecha: m.inicio, motivo: `Membresía ${m.tipo} · ${m.nombre}` });
    }
  });

  // (2) Histórico determinista de los últimos 6 meses (incluye el actual).
  const now = todayAtMidnight();
  const amount = (k, rnd) => (k.min + Math.round(rnd() * (k.max - k.min))) * 1000;
  for (let back = 5; back >= 0; back--) {
    const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const y = d.getFullYear();
    const mo = d.getMonth();
    const rnd = createSeededRandom(y * 12 + mo);
    // En el mes actual no generamos fechas futuras (solo hasta hoy).
    const maxDay = back === 0 ? now.getDate() : new Date(y, mo + 1, 0).getDate();
    const dayFecha = () => formatDMY(new Date(y, mo, 1 + Math.floor(rnd() * maxDay)));
    const nIncome = 3 + Math.floor(rnd() * 3);
    const nExpense = 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < nIncome; i++) {
      const k = INCOME_KINDS[Math.floor(rnd() * INCOME_KINDS.length)];
      push({ tipo: 'entrada', categoria: k.cat, monto: amount(k, rnd), fecha: dayFecha(), motivo: k.motivo });
    }
    for (let i = 0; i < nExpense; i++) {
      const k = EXPENSE_KINDS[Math.floor(rnd() * EXPENSE_KINDS.length)];
      push({ tipo: k.tipo, monto: amount(k, rnd), fecha: dayFecha(), motivo: k.motivo });
    }
  }

  // (3) Gastos fijos recurrentes (alimentan "Gastos próximos").
  const y = now.getFullYear();
  const mo = now.getMonth();
  const lastDay = new Date(y, mo + 1, 0).getDate();
  push({ tipo: 'salida', recurrent: 1, monto: 2800000, fecha: formatDMY(new Date(y, mo, Math.min(30, lastDay))), motivo: 'Nómina' });
  push({ tipo: 'salida', recurrent: 1, monto: 1800000, fecha: formatDMY(new Date(y, mo + 1, 1)), motivo: 'Arriendo del local' });

  // Ordena por fecha desc (más reciente = ord menor) e inserta.
  asientos.sort((a, b) => (parseDMY(b.fecha) - parseDMY(a.fecha)));
  const stmt = db.prepare(`INSERT INTO movements (id, ord, tipo, monto, motivo, fecha, recurrent, settled, items, categoria)
    VALUES (@id, @ord, @tipo, @monto, @motivo, @fecha, @recurrent, @settled, @items, @categoria)`);
  asientos.forEach((a, i) => stmt.run({
    id: `seed-mv-${i + 1}`, ord: i + 1,
    tipo: a.tipo, monto: a.monto, motivo: a.motivo, fecha: a.fecha,
    recurrent: a.recurrent, settled: a.settled, items: JSON.stringify(a.items), categoria: a.categoria,
  }));
}

/** Siembra todas las tablas vacías (envuelto en una transacción). */
export function seedAll() {
  const run = db.transaction(() => {
    seedMembers();
    seedMovements(); // después de miembros: asienta sus pagos en el libro
    seedEvents();
    seedProducts();
    seedEquipment();
    seedGas();
    seedPlans();
    seedUsers();
    seedClasses();
    seedTrainers();
  });
  run();
}
