# OVERSEER · Sistema de gestión modular

> Todo lo que un negocio pequeño o mediano necesita para llevar su control, en un solo lugar:
> fácil, intuitivo y agradable a la vista. Sin licencias costosas y sin sistemas complicados.

## ¿Qué es Overseer?

**Overseer** es un sistema de gestión modular pensado para negocios pequeños y
medianos, muchos familiares o que dependen de pocas personas y que necesitan
llevar el control de sus finanzas, movimientos, tareas y clientes sin recurrir a
alternativas caras o con licencias de uso.

Esta versión está orientada a un **gimnasio**, pero su arquitectura modular
permite ampliarlo y reutilizarlo con facilidad para otros rubros.

## ¿Por qué Overseer?

Muchos negocios llevan su operación con herramientas que se les quedan cortas:

- **Recibos y talonarios manuales** → lentos, fáciles de perder, sin visión del conjunto.
- **Hojas de Excel** atascadas de datos, propensas a errores y a corrupción de datos.
- **Sistemas *legacy*** con licencias costosas e interfaces poco amigables.

Overseer reúne todo en una sola aplicación clara y ordenada: la información no se
pierde, las cuentas cuadran solas y cualquier persona del negocio puede usarla sin
capacitación especial.

## Funcionalidades

### Acceso, roles y permisos
- **Login real** con contraseña cifrada (hash *scrypt*, la clave nunca se guarda en texto).
- **Roles**: Administrador, Recepción y Entrenador (y se pueden crear más).
- **Permisos por usuario** con *checklist* editable: cada cuenta ve y hace solo lo que se le concede.
- Distinción **ver vs. editar** (p. ej. un entrenador puede consultar miembros pero no modificarlos, salvo que se le active el permiso).
- La navegación se **restringe automáticamente**: cada usuario ve únicamente los módulos permitidos.

### Inicio (panel del día)
- Indicadores clave (miembros activos, vencidos, por vencer, ingresos del mes) con **cifras animadas**.
- Widgets que se **filtran según los permisos** del usuario.
- Movimientos del día, próximos vencimientos y próximos eventos.
- **Resumen de caja** del mes (membresías, otros ingresos y total) sincronizado con Finanzas.
- Registrar movimientos y dar de alta/renovar miembros **sin salir del panel**.

### Miembros y clientes
- Tabla con **búsqueda en vivo** (nombre, cédula o teléfono).
- **Ordenamiento** por encabezados (nombre, vencimiento, estado, plan, recibo) con inversión.
- **Ficha detallada** del cliente: foto, datos de contacto, fechas, plan, recibo, observaciones y estado.
- **Estado automático** de la membresía: vigente / vence pronto / vencida.
- **Alta guiada** (asistente por pasos) y **renovación** con datos precargados.
- Contadores por estado y filtros rápidos.

### Membresías y planes
- **Catálogo de planes** configurable (crear, activar/ocultar, eliminar).
- El alta y la renovación **leen el catálogo** y precargan el precio del plan elegido.
- Cada pago de membresía se registra automáticamente en el libro de finanzas.

### Calendario
- Vista mensual (semana de lunes a domingo) con **festivos de Colombia** y el día actual resaltado.
- Eventos por tipo: reserva, clase, tarea y nota, con selector de hora.
- Los cobros/pagos pendientes de Finanzas **se agendan solos** como recordatorios.

### Finanzas (libro mayor único)
- **Una sola fuente de verdad** de la caja: membresías, ventas y gastos son asientos del mismo origen.
- Ingresos y egresos por mes, con **pendientes** que se confirman al cobrarse/pagarse.
- KPIs de **entradas, salidas y balance** (con cifras animadas).
- **Desglose de ingresos** por categoría y **historial de 6 meses** con gráficos.
- **Gastos próximos** y gastos recurrentes.
- Venta desde catálogo de productos que **descuenta el inventario** automáticamente.

### Inventario del gimnasio
- Tres inventarios en uno: **productos en venta**, **equipos/máquinas** y **zona húmeda (cilindros de gas)**.
- **Estado por stock** (en stock / bajo / agotado) calculado solo.
- Métricas de gas: restantes, porcentaje, costo por uso e historial de usos por servicio.
- Las ventas **descuentan stock** sin intervención manual.

### Clases y entrenadores *(módulos opcionales)*
- **Clases**: ocupación, cupo, coach, horario y color.
- **Entrenadores**: especialidad, clientes, clases y estado (disponible/ausente).
- Crear, editar y eliminar en ambos.

### Reportes *(módulo opcional)*
- Indicadores con variación respecto al periodo anterior, ingresos mensuales y distribución de planes.

### Ajustes
- **General**: datos del gimnasio y logo.
- **Apariencia**: **tema claro/oscuro** y **zoom** de la interfaz.
- **Módulos**: activar u ocultar los módulos opcionales.
- **Cuentas y roles**: crear/editar/eliminar usuarios y ajustar sus permisos.
- **Planes**: administrar el catálogo de membresías.
- **Notificaciones**: preferencias de avisos.
- **Datos**: exportación a CSV y copias de seguridad.

### Experiencia de uso
- **Tema claro y oscuro**, **zoom ajustable** (para pantallas pequeñas o grandes).
- **Cifras animadas** en todos los indicadores.
- Amplia compatibilidad y diseño cuidado ("Overseer Modernist").

## Roles y datos de acceso (demostración)

| Cuenta | Usuario | Contraseña | Rol |
|---|---|---|---|
| Administrador | `admin@overseer.gym` | `admin123` | Acceso total |
| Recepción | `recepcion@overseer.gym` | `recepcion123` | Miembros, calendario y finanzas |
| Entrenador | `entrenador@overseer.gym` | `entrenador123` | Consulta de miembros, calendario y clases |

> Son credenciales **de desarrollo**: cámbialas en un uso real.

## Cómo ejecutarlo

### Modo desarrollo (dos procesos)
```bash
cd server && npm install && npm start      # API en http://localhost:3001
```
```bash
cd overseer && npm install && npm run dev  # interfaz en http://localhost:5173
```

### Como aplicación (2 clics)
El proyecto incluye empaquetados listos para el día a día del local:
- **Servidor + navegador** con un `.bat`: doble clic y la app abre en una ventana dedicada.
- **Modo segundo plano**: el servidor corre oculto (sin ventanas de consola) y se abre en una
  ventana de app; puede arrancar solo al encender el equipo y elegir el navegador (Edge, Chrome, etc.).

La base de datos es un archivo local que **se conserva entre actualizaciones**.

## Stack y arquitectura

- **Frontend**: React + Vite, JavaScript y CSS puros (sin librerías de UI externas).
- **Backend**: Node + Express con base de datos **SQLite** (archivo local, sin servidor de BD que administrar).
- **Arquitectura modular**: agregar, quitar u ocultar un módulo es cuestión de una línea, y la capa de
  datos está aislada — por eso Overseer se **reutiliza** fácilmente para otros negocios.

## Próximas actualizaciones (roadmap)

- **Generación de reportes detallados** (exportables/PDF).
- **Impresión de recibos** de pago y renovación.
- **Notificaciones avanzadas**: recordatorios y avisos por mensajería (WhatsApp / SMS / correo).
- Copias de seguridad automáticas programadas.
- Auto-actualización de la app de escritorio.
- Modo multi-sede con base de datos centralizada (para negocios con varias sucursales).

---

**Overseer está hecho para facilitarle la vida al usuario**, sin obligarlo a aprender sistemas
supercomplicados ni a montar facturación electrónica u otras soluciones pesadas. Es un sistema de
**gestión privada y sencilla**: lo que el negocio necesita, y nada de lo que le estorba.
