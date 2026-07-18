/*
  data/seedEvents.js — Eventos de ejemplo del calendario (mock).

  Igual que en el prototipo, las fechas son RELATIVAS a hoy (hoy, +1, +3,
  +5 días) para que el calendario siempre tenga eventos visibles y algunos
  "próximos" sin importar cuándo se abra la app.

  Estructura: un mapa { "aaaa-mm-dd": [ { id, title, time, type } ] }.
  `time` en formato 24h "HH:mm"; `type` ∈ Reserva | Clase | Tarea | Nota.
*/

import { dateKey } from '../lib/date';

/** Devuelve la fecha de hoy desplazada `offset` días como clave aaaa-mm-dd. */
function dayKey(offset) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return dateKey(d);
}

/** Construye la semilla en el momento de sembrar (fechas relativas a hoy). */
export function buildSeedEvents() {
  return {
    [dayKey(0)]: [
      { id: 'ev-seed-1', title: 'Reserva sala spinning', time: '07:00', type: 'Reserva' },
    ],
    [dayKey(1)]: [
      { id: 'ev-seed-2', title: 'Clase de yoga', time: '09:00', type: 'Clase' },
      { id: 'ev-seed-3', title: 'Llamar proveedores', time: '14:00', type: 'Tarea' },
    ],
    [dayKey(3)]: [
      { id: 'ev-seed-4', title: 'Mantenimiento de máquinas', time: '11:00', type: 'Tarea' },
    ],
    [dayKey(5)]: [
      { id: 'ev-seed-5', title: 'Reserva zona funcional', time: '18:30', type: 'Reserva' },
    ],
  };
}
