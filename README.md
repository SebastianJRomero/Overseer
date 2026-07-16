# Handoff — OVERSEER · Gym Manager (V1 Final)

> Paquete de entrega para reconstruir el prototipo de diseño en una **app real**.
> Lee este README completo y luego **`ARQUITECTURA.md`** (reglas de código obligatorias)
> y **`PROMPT_CLAUDE_CODE.md`** (cómo arrancar con Claude Code).

---

## 1. Qué es esto

**OVERSEER** es una aplicación de administración para un gimnasio de **una sola sede**.
La usa recepción/administración para el día a día: miembros, cobros, agenda, inventario y caja.

El archivo `prototipo/Gym Dashboard Final V1.dc.html` es una **referencia de diseño creada en HTML**:
un prototipo funcional que muestra el aspecto y el comportamiento deseados.
**No es código de producción para copiar.** Está escrito en un runtime de componentes propio
(`support.js`); **no se copia su sintaxis** — se reconstruye como app React siguiendo `ARQUITECTURA.md`.

Ábrelo en un navegador (doble clic al `.dc.html`) para verlo funcionar y usarlo como fuente de verdad
visual e interactiva.

---

## 2. Stack objetivo (definido por el cliente — no negociable)

- **React + Vite**
- **JavaScript puro — NO TypeScript**
- **CSS puro** — sin Tailwind, Bootstrap, MUI, styled-components. Un archivo CSS por componente (CSS Modules).
- **Sin librerías externas** salvo que sea *totalmente* necesario. Si algo parece necesitarlo
  (calendario, gráficos, date-picker), **primero se implementa a mano**; si de verdad no es viable,
  **explicar por qué y PREGUNTAR antes de instalar nada**. Ver política en `ARQUITECTURA.md §7`.
- **Todo comentado para un junior**: el objetivo es que alguien que está aprendiendo pueda leer el
  código, entenderlo y aprender de él. Comentarios explicando el *por qué*, no solo el *qué*.
- Persistencia: el prototipo usa datos de ejemplo en memoria/localStorage. La app real reemplaza eso
  por una capa de datos (API + BD) — ver §7 modelo de datos. Empezar con una capa `services/` mockeada
  es válido, siempre que sea reemplazable sin tocar la UI.

---

## 3. Fidelidad

**Alta fidelidad (hifi).** Colores, tipografía, espaciado, radios, sombras y animaciones son finales.
Recréalo lo más fiel posible. Los valores exactos están en §6 (Design Tokens) y, ante la duda,
**el prototipo manda** — inspecciona sus estilos inline.

---

## 4. Estructura de la app (mapa de navegación)

La app tiene un **shell** (barra superior + navegación tipo dock) y **módulos** que se intercambian
en el área central. El módulo activo se controla con un solo valor de estado (`active`).

### Módulos núcleo (siempre presentes)
| id | Nombre | Qué hace |
|----|--------|----------|
| `dashboard` | **Inicio** | Panel del día: caja del día, movimientos, próximos vencimientos, KPIs. |
| `members`   | **Miembros** | Tabla de socios, estados de membresía, alta/renovación/edición, ficha. |
| `calendar`  | **Calendario** | Agenda mensual: reservas, clases, tareas y notas. |
| `finance`   | **Finanzas** | Ingresos/egresos por mes, movimientos, gráfico, KPIs de caja. |
| `inventory` | **Inventario** | 3 sub-inventarios: **Productos en venta**, **Equipo de gym**, **Zona húmeda** (cilindros de gas). |
| `settings`  | **Ajustes** | Configuración (ver sub-secciones abajo). |

### Módulos opcionales (activables/desactivables desde Ajustes → Módulos)
| id | Nombre | Nota |
|----|--------|------|
| `classes`  | **Clases** | Programación de clases grupales. |
| `trainers` | **Entrenadores** | Staff y asignación de clientes. |
| `reports`  | **Reportes** | Indicadores y análisis del negocio. |

> Los flags viven en `moduleFlags = { classes, trainers, reports }`. Si un módulo se apaga y estaba
> activo, la app vuelve a `dashboard`. **Este mecanismo es central al requisito de "ocultar sin afectar"**
> (ver `ARQUITECTURA.md §4`).

### Sub-secciones de Ajustes (`sSection`)
`general` (datos del gimnasio) · `modulos` (activar/desactivar módulos) · `cuentas` (usuarios y roles) ·
`planes` (planes de membresía) · `notificaciones` (toggles) · `datos` (respaldos y exportación CSV).

### Sub-tabs de Inventario (`invTab`)
`productos` (▤) · `equipo` (◇) · `gas` / Zona húmeda (◔).

### Autenticación
Hay una **pantalla de login** (`authed:false` → formulario) antes del shell. Incluye menú de usuario
(cambiar de usuario / cerrar sesión) en la barra superior. En producción → auth real + sesión.

---

## 5. Pantallas y comportamiento (resumen)

> Detalle visual exacto: abre el prototipo. Aquí va lo funcional que debe preservarse.

### Shell
- **TopBar**: logo "OVERSEER" (marca coral), tabs de módulos en escritorio, reloj/fecha, avatar + menú.
- **Dock** (móvil): navegación inferior con los 5 módulos núcleo; animación de entrada `dockPop`.
- **Responsive**: `device: 'desktop' | 'mobile'`. En móvil el shell se dibuja dentro de un marco de teléfono
  y el dock se reduce a `dashboard, members, calendar, finance, settings`.

### Inicio (`dashboard`)
- Selector de día (‹ / etiqueta / › / Hoy) — el botón **Hoy** se ilumina solo si el cursor está en el día real.
- Botones de **movimiento de caja**: entrada (verde) y salida (coral) → abren modal de movimiento.
- Lista de **movimientos del día** con opción "marcar como pagada" en pendientes.
- **Próximos vencimientos** (miembros que vencen) y **KPIs** (activos, vencidos, vencen pronto, ingresos).
- KPIs clicables abren un modal de filtro de miembros.

### Miembros (`members`)
- Chips de estado con conteo (activos / vencen pronto / vencidos) que filtran.
- Tabla (nombre, cédula, teléfono, inicio, fin, plan, recibo, valor) + versión tarjeta en móvil.
- Clic en fila → **ficha del miembro** (nombre editable inline, renovar, historial).
- **Wizard** de alta/renovación por pasos (plan + fechas → resumen). En renovación, `inicio` se
  presetea con la fecha de fin anterior pero es editable.

### Calendario (`calendar`)
- Grid mensual lunes-first, celdas de alto fijo, fines de semana y **festivos de Colombia** en lavanda.
- Día actual con anillo coral. Clic en día vacío → nuevo evento; clic en evento → editar.
- Tipos de evento: **Reserva** (azul), **Clase** (verde), **Tarea** (ámbar), **Nota** (coral).

### Finanzas (`finance`)
- Navegación por mes, KPIs de caja, lista de movimientos (ingresos/egresos), gráfico desplegable,
  botones de entrada/salida y modales de movimiento. Egresos fijos de ejemplo (arriendo, servicios…).

### Inventario (`inventory`)
- 3 sub-inventarios con sus propias tablas y modales:
  - **Productos**: artículos en venta con stock y precio (modal `prodModal`).
  - **Equipo de gym**: máquinas/equipos, estado, mantenimiento (modal `equipModal`).
  - **Zona húmeda / gas**: cilindros de gas — compra, uso, finalización, historial
    (`gasCyls`, `compraModal`, `usoModal`, `finalModal`, `histModal`).

### Ajustes (`settings`)
- Sub-nav lateral (6 secciones). **General**: datos del gimnasio editables. **Módulos**: toggles que
  activan/ocultan `classes/trainers/reports`. **Cuentas**: crear usuarios con rol. **Planes**: crear/editar
  planes de membresía. **Notificaciones**: toggles. **Datos**: exportar CSV y respaldos.

### Modales (patrón común)
- Overlay oscuro con `backdrop-filter:blur`. Animación de apertura (`cardIn`) y **cierre diferido**:
  se reproduce `cardOut` (~170 ms) *antes* de desmontar. Clic en overlay cierra; clic dentro no propaga.
- Modales existentes: filtro de miembros, ficha de miembro, wizard, evento de calendario, movimiento de
  caja, producto, equipo, cilindro (compra/uso/final/historial), usuario, plan, KPI detalle.

---

## 6. Design Tokens

> Estos son los tokens base. **Deben centralizarse** (ver `ARQUITECTURA.md §3` — `theme.css` con variables
> CSS). El prototipo ya usa variables para el acento y los radios; respétalo.

### Theming dinámico (props del prototipo → configuración de tema)
El prototipo expone 3 ejes de tema; recréalos como variables CSS conmutables:
- **Acento** (`accent`): `Coral` (default) · `Eléctrico` · `Océano` · `Púrpura`.
  Se aplica vía `--acc-grad`, `--acc-1`, `--acc-soft`.
- **Densidad** (`density`): `Compacto` · `Cómodo` (default) · `Espacioso` — escala de paddings/gaps.
- **Redondez** (`roundness`): `Nítido` · `Redondeado` (default) · `Suave` — vía `--r-btn`, `--r-modal`.

### Colores
- **Acento coral (marca)**: gradiente `linear-gradient(150deg,#ff5c38,#ff2d78)`; sólidos `#ff5c38`,
  `#ff8b6e`, `#ff9d85`. Sombra botón `0 3px 12px rgba(255,60,90,.28)`.
- **Fondos**: app `#0a0c11`; superficies `#0e121b`, `#12161f`, `#0d1119`, `#080a0f`.
- **Bordes**: `#161c28`, `#1c2334`, `#1e2536`, `#26324a`, `#202C42` (dashed calendario).
- **Texto**: fuerte `#f2f5fa`/`#eef1f6`; medio `#c6cfdd`/`#d3dae7`; suave `#8b96ab`/`#9daabf`;
  tenue `#5c6a82`/`#4e5a70`.
- **Semánticos**: verde `#7ee2a0`/`#3ecf74` (activo/entrada) · ámbar `#ffb35c` (pronto) ·
  coral `#ff8b6e`/`#ff5c38` (vencido/salida/nota) · azul `#7fb1f5` (info) · lavanda `#a99cd6` (finde/festivo).

### Tipografía
- Sans: **Sora** (400–800) — títulos y cuerpo.
- Mono: **Geist Mono** (400–600) — cifras, horas, fechas, precios, códigos.
- Escala: 28px/700 (KPI grande) · 20px/700 (título módulo) · 16–17px/700 · 13–14px/600 (cuerpo) ·
  11.5–12.5px (secundario) · 9.5–11px (metadatos). Tracking negativo en títulos (−.01 a −.02em),
  positivo en labels (.06–.08em).

### Radios / sombras
- Radios: 6–8 (chips) · 9–10 (`--r-btn`, botones/inputs) · 13–14 (tarjetas) · 16–20 (`--r-modal`) · 999 (badges).
- Sombra modal: `0 30px 80px rgba(0,0,0,.6)`.

### Animaciones (keyframes en el `<helmet>` del prototipo)
`dockPop`, `ovIn/ovOut`, `cardIn`(.32s cubic-bezier(.2,.9,.3,1))/`cardOut`, `moduleIn`(.38s), `riseIn`,
`loginRise`, `menuIn`, `shake` (error de login), `glowPulse`, `checkPop`/`checkGlow`/`ringBurst`/`confettiFall`
(celebración de renovación), `swapA/B` y `screenA/B` (transición entre pestañas/sub-tabs). Cierre de modal: delay ~170ms.

---

## 7. Modelo de datos y capa de servicios

El prototipo tiene datos de ejemplo embebidos (`rawMembers`, egresos fijos, cilindros, etc.).
La app real debe poner una **capa `services/` reemplazable** entre la UI y el origen de datos, para
migrar de mock → API sin tocar componentes.

Entidades sugeridas:
- **Member**: id, nombre, cedula, telefono, fechaInicio, fechaFin, plan, recibo, valor, observaciones.
  Estado derivado: `vencido` (hoy > fin), `vencePronto` (fin ≤ hoy+7d).
- **Plan**: id, nombre, duración (días), precio, activo.
- **Movement** (caja): id, tipo (entrada/salida), monto, motivo, categoría, fecha, pendiente, factura.
- **CalendarEvent**: id, date, time, title, type (RESERVA|CLASE|TAREA|NOTA).
- **Product / Equipment / GasCylinder**: inventarios (stock, precio, estado, historial de uso).
- **User**: id, nombre, email, passwordHash, rol (Admin/Recepción…).
- **Holiday** (config): festivos — el prototipo tiene fijos de Colombia; considerar tabla configurable.
- **Settings**: datos del gimnasio, moduleFlags, toggles de notificación.

Endpoints sugeridos: `members`, `plans`, `movements`, `events?month=`, `inventory/*`, `users`, `settings`,
`auth/login`. KPIs derivables en cliente o vía `stats`.

---

## 8. Assets

- **Sin imágenes.** La iconografía usa glifos unicode (● ▼ ◔ ≈ ▤ ▦ ◉ ◇ ◫ ◌ ◷ ◈ ▣ ✎ ✓ ✕ ‹ › ＋).
  En producción, sustituir por un set de iconos SVG propio y **reutilizable** (ver `ARQUITECTURA.md`).
  Si el equipo prefiere una librería de iconos, aplica la política de "sin librerías" (§2): preguntar primero.
- **Fuentes**: Sora + Geist Mono vía Google Fonts (ver `<link>` en el `<helmet>` del prototipo).

---

## 9. Archivos de este paquete

- `README.md` — este documento.
- `ARQUITECTURA.md` — **reglas de código obligatorias** (modularidad, estructura, contrato de componente,
  política de librerías, estándar de comentarios). Léelo antes de escribir código.
- `PROMPT_CLAUDE_CODE.md` — prompt listo para pegar en Claude Code para arrancar el análisis y el plan.
- `prototipo/Gym Dashboard Final V1.dc.html` — el prototipo completo (fuente de verdad visual/interactiva).
- `prototipo/support.js` — runtime del prototipo (necesario para abrirlo; **no** se porta a la app).
