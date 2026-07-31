/*
  modules/settings/rolePermissions.js — Qué funciones puede usar cada rol.

  Se muestra como checklist EDITABLE por cuenta en el modal de usuario (elegir
  un rol precarga estos accesos y luego se afinan a mano). Deriva de la leyenda
  de roles (ROLE_LEGEND de usersService):
    - Admin      → acceso total.
    - Recepción  → miembros (ver + editar), cobros (Finanzas) y calendario.
    - Entrenador → consulta de miembros y calendario de clases (VER, sin editar).

  Los `permisos` guardados por cuenta SÍ restringen la app: la navegación filtra
  módulos (enforcement, Tramo C) y 'Editar miembros' habilita la edición de la
  ficha. IMPORTANTE: esta lista debe permanecer en sync con `ALL_ACCESS`
  (server/routes/auth.js) y `ROLE_ACCESS` (server/seed.js).

  'Editar miembros' es un permiso APARTE de 'Miembros' (ver): así un Entrenador
  puede consultar la ficha pero no cambiar datos ni renovar/agregar, salvo que
  el Admin le active 'Editar miembros'.
*/

/** Funciones del sistema en el orden en que se listan. */
export const ACCESS_FUNCTIONS = [
  'Miembros', 'Editar miembros', 'Calendario', 'Finanzas', 'Inventario', 'Clases', 'Reportes', 'Ajustes', 'Cuentas',
];

/** Funciones accesibles por cada rol. */
export const ROLE_ACCESS = {
  Admin: ['Miembros', 'Editar miembros', 'Calendario', 'Finanzas', 'Inventario', 'Clases', 'Reportes', 'Ajustes', 'Cuentas'],
  Recepción: ['Miembros', 'Editar miembros', 'Calendario', 'Finanzas'],
  Entrenador: ['Miembros', 'Calendario', 'Clases'],
};

/** ¿El rol tiene acceso a la función? */
export function roleCan(rol, fn) {
  return (ROLE_ACCESS[rol] || []).includes(fn);
}
