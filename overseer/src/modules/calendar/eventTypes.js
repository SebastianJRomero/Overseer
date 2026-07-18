/*
  modules/calendar/eventTypes.js — Tipos de evento y su color.

  Centraliza el vocabulario visual del calendario para que la celda, la
  leyenda y el modal pinten siempre igual. Los tipos Cobro/Pago los generan
  los movimientos de Finanzas (fase 4); aquí ya tienen su color reservado.
*/

export const EVENT_TYPES = {
  Reserva: { label: 'Reserva', color: 'var(--info)', bg: 'var(--info-bg)' },
  Clase: { label: 'Clase', color: 'var(--ok)', bg: 'var(--ok-bg)' },
  Tarea: { label: 'Tarea', color: 'var(--warn)', bg: 'var(--warn-bg)' },
  Nota: { label: 'Nota', color: 'var(--danger)', bg: 'var(--danger-bg)' },
  // Generados desde Finanzas:
  Cobro: { label: 'Cobro', color: 'var(--ok)', bg: 'var(--ok-bg)' },
  Pago: { label: 'Pago', color: 'var(--danger)', bg: 'var(--danger-bg)' },
};

/** Tipos que el usuario puede elegir al crear un evento (en orden). */
export const EVENT_TYPE_OPTIONS = ['Reserva', 'Clase', 'Tarea', 'Nota'];

/** Estilo de un tipo con fallback a Reserva (para eventos de tipo inesperado). */
export function getEventType(type) {
  return EVENT_TYPES[type] || EVENT_TYPES.Reserva;
}
