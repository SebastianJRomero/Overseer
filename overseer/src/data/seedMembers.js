/*
  data/seedMembers.js — Miembros de ejemplo para el mock.

  Son los 6 miembros del prototipo, pero con las fechas RELATIVAS a hoy:
  el prototipo tenía fechas fijas de julio 2026 y quedaría "todo vencido"
  con el paso del tiempo. Al calcularlas contra la fecha real, la demo
  siempre muestra los tres estados: vigentes, una que vence pronto (fin a
  3 días) y uno vencido (fin hace 4 días).

  El estado NO se guarda: se deriva de `fin` con getMemberStatus (ver
  lib/memberStatus.js). `valor` es número limpio; `cedula` y `telefono`
  guardan SOLO dígitos (la UI los formatea al pintar, ver lib/format.js).
*/

import { todayDMY, addDays, addMonths } from '../lib/date';

/** Construye la semilla en el momento de sembrar (fechas relativas a hoy). */
export function buildSeedMembers() {
  const hoy = todayDMY();

  /* Cada miembro: fin relativo a hoy e inicio coherente con su plan
     (1 mes hacia atrás para "1 mes", 3 para "3 meses", 15 días quincena). */
  const finValeria = addDays(hoy, 18);
  const finAndres = addDays(hoy, 33);
  const finCamila = addDays(hoy, 21);
  const finJorge = addDays(hoy, 80);
  const finLuisa = addDays(hoy, 3);   // → "vence pronto" (ventana de 7 días)
  const finMateo = addDays(hoy, -4);  // → "vencido"

  return [
    {
      id: 'm-seed-1',
      nombre: 'Valeria Gómez',
      cedula: '1045882310',
      telefono: '3005128841',
      inicio: addMonths(finValeria, -1),
      fin: finValeria,
      tipo: '1 mes',
      recibo: 'RC-1042',
      valor: 70000,
      obs: 'Prefiere clases en la mañana',
    },
    {
      id: 'm-seed-2',
      nombre: 'Andrés Restrepo',
      cedula: '98552104',
      telefono: '3112047765',
      inicio: addMonths(finAndres, -3),
      fin: finAndres,
      tipo: '3 meses',
      recibo: 'RC-1038',
      valor: 180000,
      obs: '',
    },
    {
      id: 'm-seed-3',
      nombre: 'Camila Torres',
      cedula: '1152336902',
      telefono: '3208841290',
      inicio: addMonths(finCamila, -1),
      fin: finCamila,
      tipo: '1 mes',
      recibo: 'RC-1051',
      valor: 70000,
      obs: 'Pago pendiente de confirmación',
    },
    {
      id: 'm-seed-4',
      nombre: 'Jorge Palacio',
      cedula: '71334856',
      telefono: '3046672318',
      inicio: addMonths(finJorge, -3),
      fin: finJorge,
      tipo: '3 meses',
      recibo: 'RC-0987',
      valor: 180000,
      obs: '',
    },
    {
      id: 'm-seed-5',
      nombre: 'Luisa Fernanda',
      cedula: '1020774415',
      telefono: '3159904472',
      inicio: addMonths(finLuisa, -1),
      fin: finLuisa,
      tipo: '1 mes',
      recibo: 'RC-1046',
      valor: 70000,
      obs: 'Lesión de rodilla — rutina adaptada',
    },
    {
      id: 'm-seed-6',
      nombre: 'Mateo Cárdenas',
      cedula: '1234007881',
      telefono: '3014459034',
      inicio: addDays(finMateo, -15),
      fin: finMateo,
      tipo: 'Quincena',
      recibo: 'RC-1055',
      valor: 12000,
      obs: '',
    },
  ];
}
