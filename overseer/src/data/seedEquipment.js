/*
  data/seedEquipment.js — Máquinas y equipos del gimnasio (mock).

  Semilla del prototipo. `cantidad` es número; el estado es uno de
  EQUIPMENT_STATES (lib/inventoryStatus). La fecha de última revisión se
  guarda como string "dd/mm/aaaa" (solo se muestra, no dispara reglas), por
  eso se dejan valores fijos y no relativos a hoy.
*/

export const SEED_EQUIPMENT = [
  { id: 'eq-caminadora', nombre: 'Caminadora eléctrica', cantidad: 4, estado: 'Operativo', revision: '12/06/2026', obs: 'Banda #2 requiere lubricación' },
  { id: 'eq-bicicleta', nombre: 'Bicicleta estática', cantidad: 6, estado: 'Operativo', revision: '01/07/2026', obs: 'Sin novedades' },
  { id: 'eq-prensa', nombre: 'Prensa de piernas', cantidad: 2, estado: 'Mantenimiento', revision: '28/06/2026', obs: 'Cambio de cable pendiente' },
  { id: 'eq-multifuerza', nombre: 'Multifuerza', cantidad: 1, estado: 'Operativo', revision: '15/05/2026', obs: 'Revisar poleas superiores' },
  { id: 'eq-rack', nombre: 'Rack de sentadilla', cantidad: 3, estado: 'Operativo', revision: '20/06/2026', obs: 'Sin novedades' },
  { id: 'eq-eliptica', nombre: 'Elíptica', cantidad: 2, estado: 'Fuera de servicio', revision: '10/04/2026', obs: 'Motor dañado — en cotización' },
];
