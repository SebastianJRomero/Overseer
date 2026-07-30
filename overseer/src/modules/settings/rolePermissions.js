/*
  modules/settings/rolePermissions.js — Qué funciones puede usar cada rol.

  Se muestra como checklist de SOLO LECTURA en el modal de nuevo usuario, para
  que el Admin vea de un vistazo qué concede cada rol (mejor control). Deriva de
  la leyenda de roles (ROLE_LEGEND de usersService):
    - Admin      → acceso total.
    - Recepción  → miembros, cobros (Finanzas) y calendario. Sin ajustes ni cuentas.
    - Entrenador → consulta de miembros y calendario de clases.

  Es una referencia visual: la app aún no restringe módulos por rol (eso sería
  enforcement de permisos, fuera del alcance de este ajuste).
*/

/** Funciones del sistema en el orden en que se listan. */
export const ACCESS_FUNCTIONS = [
  'Miembros', 'Calendario', 'Finanzas', 'Inventario', 'Clases', 'Reportes', 'Ajustes', 'Cuentas',
];

/** Funciones accesibles por cada rol. */
export const ROLE_ACCESS = {
  Admin: ['Miembros', 'Calendario', 'Finanzas', 'Inventario', 'Clases', 'Reportes', 'Ajustes', 'Cuentas'],
  Recepción: ['Miembros', 'Calendario', 'Finanzas'],
  Entrenador: ['Miembros', 'Calendario', 'Clases'],
};

/** ¿El rol tiene acceso a la función? */
export function roleCan(rol, fn) {
  return (ROLE_ACCESS[rol] || []).includes(fn);
}
