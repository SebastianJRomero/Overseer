/*
  data/seedUsers.js — Cuentas del sistema (mock).

  Usuarios de la sección Ajustes → Cuentas y roles. `activity` es la última
  actividad (solo se muestra) y `activo` marca si la cuenta está habilitada.
  Los usuarios que se crean desde el modal se guardan aparte y nacen con
  actividad "Recién creado".

  Usuario: { id, nombre, email, rol, activity, activo }
  rol ∈ Admin | Recepción | Entrenador
*/

export const SEED_USERS = [
  { id: 'u-andres', nombre: 'Andrés Ríos', email: 'admin@overseer.gym', rol: 'Admin', activity: 'Hace 5 min', activo: true },
  { id: 'u-paula', nombre: 'Paula Méndez', email: 'recepcion@overseer.gym', rol: 'Recepción', activity: 'Hace 2 h', activo: true },
  { id: 'u-carlos', nombre: 'Carlos Vega', email: 'recepcion2@overseer.gym', rol: 'Recepción', activity: 'Ayer', activo: true },
  { id: 'u-diana', nombre: 'Diana López', email: 'entrenador@overseer.gym', rol: 'Entrenador', activity: 'Hace 3 días', activo: false },
];

/* Roles del sistema con sus permisos (referencia fija, se muestra tal cual). */
export const ROLE_LEGEND = [
  { rol: 'Admin', perms: 'Acceso total — configuración, cuentas, finanzas e inventario' },
  { rol: 'Recepción', perms: 'Miembros, cobros y calendario. Sin ajustes ni cuentas' },
  { rol: 'Entrenador', perms: 'Consulta de miembros y calendario de clases' },
];
