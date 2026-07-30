# PROGRESO — OVERSEER · Gym Manager

> Bitácora de avance por fases. Pensada para que **cualquier persona o
> sesión nueva pueda retomar el trabajo sin el chat original**.
> Se actualiza al cerrar cada fase (y si algo queda a medias).

## ▶ Cómo retomar en una sesión nueva

Empezar una sesión limpia después de cada PR mergeado mantiene el contexto
ligero y el trabajo igual de continuo. Para retomar basta con pedir:

> **Lee `overseer/PROGRESO.md` y `ARQUITECTURA.md`, y continúa con la fase
> que siga pendiente.**

Antes de escribir código, la sesión nueva debería:
1. Leer este archivo completo (estado de fases + convenciones + "Cómo continuar").
2. Leer `../ARQUITECTURA.md` (reglas de código obligatorias) y, si hace falta
   comparar visualmente, abrir `../prototipo/Gym Dashboard Final V1.dc.html`.
3. Sincronizar `main` (`git checkout main && git pull`) y crear la rama de la
   fase: `git checkout -b fase-N-<nombre>`.
4. Al cerrar la fase: verificar en navegador, actualizar este archivo y
   **detenerse para revisión del usuario** antes de commitear.

## Referencias obligatorias

- `../README.md` — qué es la app, pantallas, tokens, modelo de datos.
- `../ARQUITECTURA.md` — **reglas de código obligatorias** (leer antes de escribir código).
- `../prototipo/Gym Dashboard Final V1.dc.html` — fuente de verdad visual/interactiva (abrir en navegador para comparar).

## Estado de fases

| Fase | Contenido | Estado | Fecha |
|------|-----------|--------|-------|
| 0 | Andamiaje: Vite, theme, lib, componentes base, shell, registry con módulo dummy | revisada y mergeada (PR #1) | 2026-07-16 |
| 1 | Login y sesión (SessionProvider, authService, celebración) | revisada y mergeada (PR #2) | 2026-07-16 |
| 2 | Módulo `members` (vertical de referencia: tabla, ficha, wizards, DatePicker) | revisada y mergeada (PR #3) | 2026-07-17 |
| 3 | Módulo `calendar` (grid, festivos, EventModal, TimePicker) | revisada y mergeada (PR #4) | 2026-07-18 |
| 4 | Módulo `finance` (movimientos, KPIs, modales, gráficos SVG) | revisada y mergeada (PR #5) | 2026-07-19 |
| 5 | Módulo `dashboard` (compone members+movements+events) | revisada y mergeada (PR #6) | 2026-07-22 |
| 6 | Módulo `inventory` (productos / equipo / gas) | revisada y mergeada (PR #7) | 2026-07-24 |
| 7 | Módulo `settings` (7 secciones, incl. Apariencia) | revisada y mergeada (PR #8) | 2026-07-24 |
| 8 | Módulos opcionales `classes` / `trainers` / `reports` | revisada y mergeada (PR #9) | 2026-07-24 |
| 9 | Cierre: auditoría de fidelidad vs prototipo | hecha — **pendiente de revisión** | 2026-07-24 |
| 10 | Backend + BD — **Node + Express + SQLite** (reescribe `services/` mock→API; **libro mayor único** + peticiones del cliente: sync planes↔miembros, eliminar cuentas (Admin), menú avanzado import/reset — ver "Limitaciones conocidas") | **Tramo A** revisada y mergeada (PR #12). **Tramo B · frentes 1 (libro mayor), 2 (sync Planes) y 3 (auth real con rol)** hechos — **pendientes de revisión** (PR #14). Frentes 4–5 (eliminar cuentas Admin, menú avanzado) pendientes | 2026-07-30 |
| 11 | Reskin **"Overseer Modernist"** — fuente Archivo + **modo claro/oscuro** (nuevo eje `tema`) + refinamientos de UI. Rama independiente desde `main`, en paralelo a la Fase 10 | hecha — **pendiente de revisión** | 2026-07-29 |

## Decisiones aprobadas por el usuario

1. **Solo desktop** — sin Dock, sin marco de teléfono, sin variantes móviles (2026-07-15).
2. **Theming** en Ajustes → Apariencia, persistido en localStorage (2026-07-15).
3. **Mock** = semillas del prototipo + generador determinista de movimientos anclado a la fecha real (2026-07-15).
4. **MoneyInput** formatea puntos de miles EN VIVO: teclear `12000` muestra `$ 12.000` (2026-07-16).
5. **PROGRESO.md** (este archivo) se actualiza al cierre de cada fase (2026-07-16).
6. **Git**: commit sugerido tras la aprobación manual de cada fase; nunca sin confirmar (2026-07-16).
7. Sin librerías externas; sin router; iconos = glifos unicode detrás de `<Icon/>`.
8. **Consolidación financiera → Fase 10** (2026-07-24). El mock reproduce el
   prototipo pantalla por pantalla, sin un "libro mayor" único; se difiere la
   unificación al backend. Ver "Limitaciones conocidas".
9. **Stack de la Fase 10: Node + Express + SQLite** (2026-07-28). Backend propio
   en JavaScript (mismo lenguaje que el front). Se reescribe SOLO el interior de
   `services/` (mock→API vía `fetch`); módulos, hooks y componentes no cambian
   (ARQUITECTURA §9). SQLite como base de datos (archivo local, sin servidor de
   BD que administrar). Sigue en pie la decisión #7 (parar y preguntar antes de
   sumar dependencias que no sean el stack ya acordado).
10. **Driver SQLite: `better-sqlite3`; CORS a mano** (2026-07-28). Se eligió
    `better-sqlite3` (API síncrona, legible, binario precompilado para Node 22
    en Windows). El backend son 2 dependencias: `express` + `better-sqlite3`.
    El CORS se resuelve a mano (5 líneas) para NO sumar la librería `cors`,
    respetando la decisión #7.
11. **La Fase 10 se parte en dos tramos** (2026-07-28). **Tramo A** (hecho):
    backend + reescritura de `services/` con **paridad total** (la app se
    comporta igual que hoy). **Tramo B** (pendiente): libro mayor único, sync
    Planes↔alta/renovación, auth real con rol, eliminar cuentas (Admin) y menú
    avanzado import/reset. Checkpoint de revisión entre ambos.

## Limitaciones conocidas (se resuelven en la Fase 10, NO son bugs)

> **✅ RESUELTAS en la Fase 10 · Tramo B · frente 1 (libro mayor único,
> 2026-07-29):** ya existe una sola fuente de verdad de caja (la tabla
> `movements`). Los pagos de miembros SÍ llegan a Finanzas (alta/renovación
> crean un asiento), el desglose y el historial se **agregan del libro real**
> (concuerdan con "Entradas del mes"), y se retiró el generador demo. Queda una
> diferencia **deliberada**: el KPI de Inicio sigue siendo `Σ members.valor`
> (valor de membresías activas), métrica distinta de "caja recibida este mes" de
> Finanzas — ver la nota en el detalle del frente 1. El texto de abajo se
> conserva como contexto histórico.

El mock guarda el dinero en **silos independientes** fieles al prototipo; no
existe una sola fuente de verdad de caja. Consecuencias que el cliente ya
revisó y aceptó posponer (2026-07-24):

- **Pagos de miembros no llegan a Finanzas.** Crear/renovar un miembro guarda
  su `valor` y `recibo` en `membersService`, pero NO crea un movimiento → no
  aparece en "Entradas del mes", ni en los movimientos del día, ni en el
  historial.
- **Tres "ingresos" que no concuerdan.** (a) KPI de Inicio = `Σ members.valor`;
  (b) "Entradas del mes" de Finanzas = generador demo + movimientos del usuario;
  (c) desglose e historial de Finanzas = semillas fijas (`PAID_THIS_MONTH`,
  `INCOME_SOURCES`, `HISTORY_MONTHS`). Son cálculos distintos y desconectados.
- **Historial de finanzas — mes actual:** el egreso usa `salidas` reales pero el
  **ingreso está hardcodeado** (`membership + otras` de semilla) en
  `getHistory` → registrar una entrada no mueve la línea de ingresos. Los 5
  meses previos son semilla fija (correcto: no hay historia real en el mock).

**Por qué se difiere:** cablear estas conexiones en el mock CHOCA con las
semillas curadas (el generador ya emite "Membresía 1 mes" falsas, el desglose
tiene % hardcodeados). Hacerlo bien exige arrancar las semillas y construir el
libro real, que es justo el trabajo de la Fase 10: **reescribir `services/`
para que membresías, ventas y gastos sean asientos del mismo origen, con
agregación histórica real.** La única sync que SÍ se hizo en el mock es
`inventoryService.applySale` (venta → descuenta stock) porque era autocontenida
y no chocaba con ninguna semilla.

### Peticiones del cliente registradas para la Fase 10 (2026-07-24)

Funcionalidades pedidas que se implementan cuando exista backend/roles reales.
No son bugs; son alcance nuevo.

1. **Sincronizar Planes y precios con el alta/renovación de miembros.** Hoy el
   wizard de Miembros usa `PLAN_OPTIONS` (lista fija en `lib/memberStatus.js`),
   así que activar/ocultar/crear/eliminar un plan en Ajustes → Planes NO se
   refleja al crear o renovar una membresía. Objetivo: que el modal de Nuevo
   miembro y el de Renovar lean `plansService.listActivePlans()` (solo activos),
   muestren cada plan con su **precio precargado**, y que Ajustes sea la única
   fuente del catálogo. Cambio principal: reemplazar el consumo de
   `PLAN_OPTIONS` por el catálogo del service en `MemberWizard`/renovación.
2. **Eliminar cuentas y roles (solo Admin).** `usersService` hoy solo tiene
   `listUsers`/`createUser`. Falta `deleteUser(id)` y que la acción esté
   **gated por rol Admin**. Ojo: `SessionProvider` hoy solo guarda el nombre de
   usuario (string), no el rol — el gating real de permisos necesita que la
   sesión/el backend traiga el rol del usuario logueado. Mientras tanto sería
   un permiso simulado.
3. **Menú avanzado / secreto (mantenimiento del sistema).** Un panel oculto
   (acceso restringido, p. ej. solo Admin o atajo) con: **importar
   configuraciones** (cargar un JSON y volcarlo a storage), **eliminar
   registros** selectivos (por entidad: miembros, movimientos, inventario…), y
   **resetear todo** (empezar de cero). Nota técnica: `services/storage.js` usa
   el prefijo `overseer:`, así que un reset total = borrar todas las claves con
   ese prefijo; conviene exponer helpers en `storage.js` (`clearAll(prefix)`,
   `exportAll()`, `importAll(obj)`) y que este menú los use. Debe pedir
   confirmación fuerte (es destructivo).

## Convenciones vigentes (resumen para retomar)

- **Registry**: `src/app/moduleRegistry.js` es la única lista de módulos; TopBar y ModuleHost derivan de ella. Agregar módulo = carpeta en `modules/` + 1 línea ahí. Mismo patrón para sub-vistas (`inventoryTabs.js`, `settingsSections.js`).
- **Meta de módulo**: `{ id, label, icon, core, order, Component }` exportado por `modules/<x>/index.js`.
- **Modales**: hook `useModal()` (cierre diferido 170 ms) + componente `<Modal controller={...}>`. Nunca desmontar sin animación de salida.
- **Services**: siempre `async`; único acceso a localStorage vía `services/storage.js` (prefijo `overseer:`). Los componentes usan hooks → hooks usan services.
- **Dinero**: estado = número limpio; UI = `formatMoney`/`MoneyInput` (es-CO con puntos).
- **Fechas**: strings `dd/mm/aaaa` + utilidades en `lib/date.js`; estado de miembro SIEMPRE derivado con `lib/memberStatus.js`.
- **Tokens**: todo color/radio/sombra sale de `src/theme/theme.css` (+ `accents.css`). Nada de hex sueltos en componentes (los hex de estados semánticos tienen token).
- **Keyframes** globales en `src/index.css` con los nombres del prototipo.
- **Comentarios** en español explicando el porqué; JSDoc en `lib/` y `services/`; ~150 líneas máx. por componente.

## Fase 0 — detalle (2026-07-16)

**Creado:**
- Proyecto Vite React (JS) en `overseer/`, git inicializado, template demo limpiado.
- `index.html` — fuentes Sora + Geist Mono por `<link>`.
- `src/theme/`: `theme.css` (todos los tokens), `accents.css` (4 acentos), `ThemeProvider.jsx` (data-* en `<html>` + persistencia).
- `src/index.css` — reset + todos los keyframes del prototipo.
- `src/lib/`: `date.js`, `money.js`, `holidays.js`, `memberStatus.js`, `initials.js`, `id.js`, `seededRandom.js`.
- `src/services/`: `storage.js`, `settingsService.js` (apariencia + moduleFlags; se ampliará en Fase 7).
- `src/hooks/`: `useModal.js`, `useClock.js`, `useSwapAnimation.js`.
- `src/components/`: Button, Modal, Card, KpiCard, Badge, Toggle, Field, MoneyInput, SegmentedOptions, ProgressBar, EmptyState, Avatar, IconBox, Icon, MonthNav (cada uno con su `.module.css`).
- `src/context/ModulesProvider.jsx` — active + flags + regla "ocultar activo → volver a dashboard".
- `src/app/`: `AppShell.jsx`, `ModuleHost.jsx`, `moduleRegistry.js`, `TopBar/` (TopBar, TopBarTabs, TopBarClock).
- `src/modules/demo/` — módulo dummy que replica el EmptyModule del prototipo.

**Notas / desviaciones:**
- El avatar de la TopBar es estático ("Admin") hasta que exista sesión (Fase 1).
- `settingsService` nació en Fase 0 (solo apariencia y flags) porque ThemeProvider y ModulesProvider lo necesitan; el plan lo tenía para Fase 7 — se amplía entonces.
- Los componentes `StatusChip`, `Table`, `DatePicker`, `TimePicker` NO están aún: llegan con Members (Fase 2) y Calendar (Fase 3), que son quienes definen sus casos de uso.

## Fase 1 — detalle (2026-07-16, rama `fase-1-login`)

**Creado:**
- `src/services/authService.js` — login mock (no vacíos), `remember` → storage `auth`, getSession/logout.
- `src/context/SessionProvider.jsx` — status `cargando|anonimo|autenticado`, user, `justIn` (600 ms para `appEnter`), enter/logout/switchUser.
- `src/auth/LoginScreen.jsx` + css — formulario fiel (orbes, glow del logo, campos escalonados `fieldIn`, Ver/Ocultar, Recordarme, error `shake`), coreografía de salida: `cardCelebrate` → `loginFade` → shell.
- `src/auth/LoginCelebration.jsx` + css — flash, 3 anillos `ringBurst`, 32 confetis (`--cx/--cy/--cr`), check SVG con trazo `stroke`, saludo con nombre.
- `src/app/TopBar/UserMenu.jsx` + css — avatar discreto (vino/coral) + popover `menuIn` con cabecera gradiente y acciones Cambiar de usuario / Cerrar sesión.

**Modificado:** `App.jsx` (Gate: cargando→null, anonimo→Login, autenticado→Shell), `AppShell.jsx` (`appEnter` solo con `justIn`), `TopBar.jsx` (usa UserMenu).

**Verificado en navegador:** error con campos vacíos (shake + bordes rojos) · login → confirmación → shell con iniciales correctas · Recordarme sobrevive recarga sin parpadeo · logout y cambiar de usuario vuelven al login limpiando storage · consola sin errores.

**Ajuste por feedback del cliente:** la celebración original (confeti + anillos + flash + `cardCelebrate`) se reemplazó por una confirmación sobria: la tarjeta se retira con `cardAway`, halo tenue + check en círculo fino que se dibuja (`stroke`) + saludo. Los keyframes festivos (checkPop/ringBurst/confettiFall/checkGlow) siguen en `index.css` para la celebración de renovación (fase Miembros) — evaluar allí también la versión sobria.

**⚠ REGLA DESCUBIERTA (aplica a TODAS las fases):** CSS Modules hashea los
nombres de animación dentro de `*.module.css` (`stroke` → `_stroke_hash`),
así que una clase de módulo NO puede referenciar keyframes globales de
`index.css` — falla EN SILENCIO (no anima, sin error). Regla adoptada:
- Animación aplicada por **clase** en un módulo → declarar los `@keyframes`
  en ese mismo `.module.css` (duplicar está bien, quedan hasheados).
- Animación aplicada por **estilo inline** (`style={{animation}}`, casos
  dinámicos como abrir/cerrar modal o swaps) → keyframes globales de
  `index.css`.
Se corrigieron los afectados: LoginScreen, LoginCelebration, UserMenu, demo.

## Fase 2 — detalle (2026-07-16, rama `fase-2-members`)

**Creado:**
- `data/seedMembers.js` — los 6 miembros del prototipo con fechas RELATIVAS a
  hoy (siempre hay vigentes, 1 "vence pronto" a 3 días y 1 vencido hace 4).
  `valor` es número; la UI formatea. `data/seedPlans.js` — catálogo de 5 planes.
- `services/membersService.js` — list/create/update/renew persistiendo la
  lista completa en storage (`members`). `services/plansService.js` — se
  consumirá en Ajustes (el wizard usa PLAN_OPTIONS de lib/memberStatus,
  porque "Especial" es tipo de membresía, no plan del catálogo).
- `hooks/usePopover.js` — apertura/cierre animado (150 ms `pickerOut`) con
  `isActive` para el borde de acento del disparador.
- `components/DatePicker/` — calendario emergente reutilizable (lunes-first,
  hoy tintado, seleccionado en gradiente, align left/right).
- `modules/members/` — meta+registry, `useMembers` (estado derivado + counts),
  `memberStyles.js` (colores de estado/plan), toolbar (chips-contador +
  búsqueda en vivo por nombre/cédula + Agregar), tabla 9 columnas (fila
  aparte en MemberRow), ficha modal (nombre editable inline, 2 DatePicker,
  PlanDropdown, recibo/obs solo lectura, Renovar), wizard alta (7 pasos +
  resumen clicable + Enter global; exige nombre para guardar), wizard
  renovación (2 pasos; inicio = fin anterior; valor precargado), modal de
  filtro por estado (chips → lista → ficha).

**Reglas aplicadas:** estado SIEMPRE derivado (getMemberStatus); cambiar
fecha inicio o plan (en wizard) recalcula fin con computeFin; en la ficha,
cambiar inicio recalcula fin, cambiar plan/fin a mano no arrastra nada.
El wizard se remonta con `key` en cada apertura (estado limpio sin efectos).

**Verificado en navegador (E2E por DOM):** 6 filas y conteos 5/1/1 · ficha
con formato $ correcto · edición inline de nombre · DatePicker: elegir
inicio recalcula fin (+1 mes) · dropdown de plan guarda · renovación
completa (preset inicio=fin anterior, valor precargado, recibo nuevo en
tabla) · alta completa con Enter (7 pasos + resumen con salto a paso) ·
filtro "vencidos" → ficha · búsqueda en vivo · todo persiste tras recarga ·
consola limpia (se corrigió un warning de React por spread de `key`).
NOTA: los screenshots del panel de preview fallaron esta sesión (limitación
del entorno, no de la app) — la revisión VISUAL fina queda al usuario.

## Fase 2 — ajustes por feedback del cliente (2026-07-17)

Tras la primera revisión visual, el usuario reportó 10 puntos; todos
resueltos y verificados por DOM + screenshots en esta sesión:

1. **Menú de cuenta detrás de la tabla / logout y cambiar-usuario no
   respondían** → misma causa: el `backdrop-filter` de la TopBar crea un
   contexto de apilamiento que atrapaba el z-index del popover debajo del
   área de módulos, así que la tabla interceptaba los clics. `UserMenu`
   ahora se renderiza con **portal a `document.body`** (createPortal).
2. **Ficha con scroll / calendarios recortados** → nueva prop
   `overflowVisible` en `Modal` (`overflow: visible`, sin `max-height`);
   la usan la ficha y el wizard para que los date-pickers sobresalgan.
3. **Calendarios del alta también sobresalen** → mismo `overflowVisible`.
4. **Alta con campos obligatorios** → validación POR PASO en el wizard
   (nombre, cédula, teléfono, fechas, recibo, valor obligatorios; obs
   opcional). Botón deshabilitado y Enter bloqueado si el paso es inválido.
   Cédula, teléfono y valor son numéricos (el input solo admite dígitos).
5. **Editar nombre despliega barra a lo ancho bajo el valor** → el modo
   edición se maneja en `MemberDetailModal` (se eliminó `MemberNameEditor`);
   la barra full-width evita encimar valor y ✕.
6. **Recibo y observaciones editables** → inputs/textarea que guardan al
   escribir (persisten en storage).
7. **Búsqueda por teléfono** → la toolbar busca nombre + cédula + teléfono,
   normalizando a solo dígitos (encuentra con o sin espacios/puntos).
8. **Cédula/teléfono con separadores al mostrar, crudos al guardar** →
   nuevo `lib/format.js` (`formatCedula` 1.085.333.621 · `formatPhone`
   315 665 79 32 · `onlyDigits`). Seed migrada a dígitos crudos; las
   funciones normalizan primero (idempotentes con datos viejos).
9. **Foto adjuntable** → clic en la foto abre selector de imagen; se lee
   como data URL, se muestra al instante y persiste (campo `foto`).
10. (cubierto por #1) cambiar usuario / cerrar sesión ya funcionan.

**Archivos nuevos:** `lib/format.js`. **Eliminados:** `MemberNameEditor.*`
(lógica absorbida por la ficha). **Modificados:** `Modal.*`, `UserMenu.jsx`,
`MembersModule.jsx`, `MemberRow.jsx`, `MemberDetailModal.*`, `MemberWizard.jsx`,
`WizardStepText.jsx`, `data/seedMembers.js`.

**Segunda tanda de feedback (misma fecha) — 2 defectos de render:**
- **"Valor pagado" con caja duplicada (renovación)** → `Field.module.css`
  estilaba TODO `input` descendiente; el input interno de `MoneyInput`
  (dentro de su `.wrap` con borde) recibía una segunda caja. Se acotó la
  regla a **hijos directos** (`.field > :global(input/textarea)`); el input
  nieto del MoneyInput ya no la recibe → una sola caja.
- **"Membresía" más baja que "N° Recibo" en la ficha** → el recibo (input)
  tomaba `12px 14px` del Field global; el `PlanDropdown`/`DatePicker` (botones)
  quedaban en `9px 12px`. Se igualaron los `.trigger` a `12px 14px / fs-body`
  → los 4 controles de la grilla a la misma altura (43px, verificado).
- Verificado por medición DOM + screenshots; consola limpia.
- Modificados: `components/Field/Field.module.css`,
  `components/DatePicker/DatePicker.module.css`,
  `modules/members/components/PlanDropdown.module.css`.

## Fase 3 — detalle (2026-07-18, rama `fase-3-calendar`)

**Creado:**
- `data/seedEvents.js` — eventos del prototipo con fechas RELATIVAS a hoy
  (hoy, +1, +3, +5) → siempre hay eventos y "próximos".
- `services/eventsService.js` — listEvents/saveEvent/deleteEvent (mapa por
  dateKey `aaaa-mm-dd` en storage) + getUpcoming(n) para el Inicio (fase 5).
- `components/TimePicker/` — selector emergente horas(1-12)/min(×5)/AM-PM;
  valor viaja en 24h "HH:mm", se elige/muestra en 12h. Reutiliza usePopover.
  Misma altura que DatePicker/inputs (12px 14px).
- `modules/calendar/`: `eventTypes.js` (Reserva=info, Clase=ok, Tarea=warn,
  Nota=danger; Cobro/Pago reservados para Finanzas), `calendarCells.js`
  (constructor puro de la grilla lunes-first con huecos), `useCalendar.js`
  (mapa + cursor + navegación + save/delete), `CalendarModule`, y componentes
  `CalendarToolbar` (MonthNav), `CalendarGrid`+`CalendarCell` (celdas de alto
  fijo 118px, findes/festivos en lavanda, anillo de acento en hoy, píldora de
  día, máx 3 eventos + "+n más"), `CalendarLegend`, `EventModal` (título,
  TimePicker, tipo segmentado, Eliminar en edición, Guardar bloqueado sin
  título; `overflowVisible` para que el TimePicker sobresalga).
- `moduleRegistry` incorpora `calendar` (order 30).

**Reglas aplicadas:** semana lunes-first (`mondayFirstLead`), festivos fijos
CO desde `lib/holidays.js`, hora guardada en 24h; el modal se remonta con
`key` en cada apertura. Clic en día vacío → nuevo; clic en evento → editar
(con `stopPropagation` para no disparar el "nuevo" del día).

**Verificado en navegador (E2E por DOM):** grilla lunes-first · hoy resaltado
· festivo (20 jul) en lavanda · 5 eventos semilla · crear evento con
TimePicker (8:30 PM → guarda 20:30, se ve en celda) · Guardar bloqueado sin
título · editar (precarga título/hora: yoga → 09:00 AM) · eliminar · navegar
Julio↔Agosto · botón Hoy se apaga al alejarse y regresa al mes real ·
persistencia en storage tras recarga · consola sin errores.
NOTA: screenshots del panel fallaron esta sesión (entorno) — revisión visual
fina al usuario.

## Fase 4 — detalle (2026-07-18, rama `fase-4-finance`)

**Creado:**
- `data/seedProducts.js` (8 productos, compartido con Inventario fase 6) +
  `data/seedFinance.js` (fuentes de ingreso, membresías cobradas, gastos
  fijos, 5 meses de historial).
- `services/inventoryService.js` (solo `listProducts()` por ahora; fase 6 lo
  amplía) — lo usa el catálogo del modal de movimiento.
- `services/movementsService.js`: **generador demo determinista** por (año,mes)
  con `lib/seededRandom.js` (mismo mes → mismos datos) + movimientos del
  usuario en storage. `listMonth` (mezcla + totales confirmados, pendientes
  NO cuentan), `listDay` (para Inicio, fase 5), `createMovement`,
  `settleMovement`, `getHistory` (6 meses), `getIncomeBreakdown`,
  `getUpcomingExpenses`.
- `eventsService.addFromMovement` — agenda pendientes/recurrentes como evento
  Cobro/Pago (sincronización Finanzas → Calendario).
- `modules/finance/`: `movementMeta.js`, `useFinance.js` (cursor + carga de
  mes/historial/desgloses + create/settle con sync), `FinanceKpis` (3 KPIs
  clicables + widget con `Sparkline`), `MovementList`+`MovementRow`,
  `IncomeBreakdown`, `UpcomingExpenses`, `KpiDetailModal`,
  `FinanceHistoryModal` (+ `LineChart`), `MovementModal`+`MovementCatalog`
  (3 columnas: catálogo con steppers → monto auto · monto/fecha/observaciones ·
  pendiente · comprobante). Charts SVG a mano en `components/charts/`
  (`chartPaths.js` puro + `Sparkline` + `LineChart`).
- `moduleRegistry` incorpora `finance` (order 40).

**Reglas aplicadas:** monto auto = Σ precio×cantidad (editable a mano);
pendiente → tipo `*_pend` + evento en calendario; totales solo cuentan lo
confirmado; generador anclado a la fecha real; modales se remontan con `key`.

**Bug corregido en verificación:** `Sparkline` crasheaba con `history` vacío
(primer render antes de la carga async) → `buildPaths([])` accedía a `xs[-1]`.
Sin error boundary, tumbaba toda la app. Blindados `buildPaths` (n=0 → vacío)
y `Sparkline` (< 2 puntos → lienzo vacío).

**Verificado en navegador (E2E por DOM):** KPIs con totales · registrar
entrada desde catálogo (Proteína ×2 → monto auto 190.000) · registrar salida
con "Nuevo artículo" y monto manual · pendiente → badge + **evento agendado
en calendario** · confirmar pendiente (✓ Pagar) · modal KPI (con pie
Confirmado) · modal historial (LineChart + métricas) · navegación de mes con
datos deterministas ($807K jul → $478K jun) · botón Actual se apaga/regresa ·
persistencia · consola sin errores. Screenshots del panel fallaron (entorno)
→ revisión visual fina al usuario.

## Fase 4 — ajustes por feedback del cliente (2026-07-18)

Tras la primera revisión, el usuario pidió 4 cambios; todos hechos y
verificados por DOM + screenshots:

1. **Filas de movimientos PENDIENTES resaltadas** → tinte ámbar sutil +
   franja lateral con el color del tipo (azul cobro / ámbar pago) que pulsa
   despacio (`pendingPulse`), para no olvidar cobrar/pagar. `MovementRow`
   añade clase `.pending` con `--pending-color` inline; keyframe en
   `MovementList.module.css`.
2. **Observaciones junto a "Entrada/Salida pendiente"** → el motivo (donde
   se anota de quién es el cobro/pago) se muestra: si el movimiento tiene
   artículos, se anexa al tipo (`Entrada pendiente · Carlos debe 2 aguas`);
   si no, ya era el concepto principal. `MovementRow` conserva `mv.motivo`.
3. **Salidas en naranja sutil** → nuevo token `--egreso: #f0a878` (el mismo
   naranja de las salidas del gráfico); los montos de egreso NO pendientes
   lo usan, las entradas siguen en verde, y los pendientes quedan en el
   neutro actual (`--text-muted`).
4. **Modales siempre a la misma altura (arriba)** → causa: `main` tiene
   scroll y los módulos se animan con `transform` (moduleIn), que convierte
   `position: fixed` en relativo al módulo alto → el modal salía a media
   página. Fix: `Modal` se renderiza con **portal a `document.body`**
   (createPortal) + overlay `align-items: flex-start` con `padding: 48px`.
   Verificado: con la página scrolleada 729px, el modal abre a 48px del top
   del viewport. Los modales `overflowVisible` siguen mostrando sus
   date-pickers sin recortarse (overlay con `overflow-y: auto`).

**Archivos:** `theme.css` (token `--egreso`), `components/Modal/Modal.jsx`
(+ portal) y `Modal.module.css` (top-align), `modules/finance/components/
MovementRow.jsx` y `MovementList.module.css`.

**Segunda tanda de refinamientos (misma fecha):**
- **Modales un poco más abajo** → offset superior 118px (a la altura de los
  widgets/KPIs, no pegados al borde). Verificado: card top 118 ≈ widget 146.
- **Animación de pulso en toda la fila pendiente** (no solo la franja): el
  fondo pulsa despacio (`pendingRowIn`/`pendingRowOut`).
- **Tinte del resalte diferenciado por tipo** → entrada pendiente = azul
  tenue (--info), salida/gasto pendiente = ámbar tenue (--warn); así se
  distingue cobro vs pago de un vistazo. La franja lateral toma el mismo
  color.
- **Observaciones legibles** → en su propia línea a lo ancho, debajo del
  tipo, en blanco (--text-title) y negrita (peso 600); title de la fila con
  el texto completo.
- **Limpieza**: se quitó el badge "Pendiente" (redundante con el resalte +
  la etiqueta de tipo + la acción) para ganar ancho y que "Entrada/Salida
  pendiente" no se trunque.

## Fase 5 — detalle (2026-07-20, rama `fase-5-dashboard`)

**Creado:**
- `modules/dashboard/`: `index.js` (meta id `dashboard`, order 10),
  `DashboardModule.jsx` (orquesta: header + KPIs + dos columnas de widgets),
  `useDashboard.js` (cursor de DÍA + `listDay` + `getUpcoming` + totales del
  día + create/settle con la misma sincronización a calendario que Finanzas),
  `widgets.js` (**registro de widgets**, ARQUITECTURA §4: `{id, column, Component}`;
  agregar/quitar/reordenar un panel = una línea) y `dashboard.module.css`.
- `components/`: `DashboardHeader` (saludo real por hora + nombre de sesión,
  el prototipo lo tenía fijo), `DashboardKpis` (4 KPIs sobre `<KpiCard>`),
  `DayMovements` (+css; MonthNav como selector de día, píldoras de entradas/
  salidas y las filas de Finanzas), `ExpiringMembers` y `UpcomingEvents`
  (comparten `SideWidget.module.css`, como MovementList/MovementRow).
- `moduleRegistry`: `demo` **reemplazado** por `dashboard` y carpeta
  `modules/demo/` eliminada (la app compila igual — esa es la gracia).

**Decisión del cliente — los KPIs abren el modal, NO redirigen:** el primer
intento navegaba a Miembros con "params" de navegación; el usuario pidió que
el modal se abra en el Inicio, sin cambiar de módulo (el Inicio es un panel
de trabajo, no un menú de accesos directos). Solución: `MemberModalsHost`
monta los MISMOS modales de Miembros (ficha, filtro, wizard) dentro del
Inicio y recibe las acciones de `useMembers`, así los KPIs se refrescan al
instante. El padre pide un modal con un objeto plano
`{ kind: 'filter'|'detail'|'add', filter?, memberId?, key }`; la `key` sube
en cada clic para poder reabrir el MISMO modal dos veces seguidas.
Los `params` de `ModulesProvider` del intento anterior se REVIRTIERON (nadie
los usaba: código muerto). Solo navegan el KPI de ingresos (→ Finanzas) y el
panel de eventos (→ Calendario), donde no hay modal que abrir.

**Acoplamientos aceptados (y por qué):** el Inicio es *el módulo que compone*,
así que sí importa piezas ajenas: de Miembros `useMembers` (la regla de
vencimientos no se duplica) y sus tres modales; de Finanzas `MovementModal`
+ `MovementRow` + `movementMeta` (registrar un movimiento ocurre aquí mismo
y debe verse idéntico en ambos módulos); del Calendario `eventTypes`. Los
tres son módulos **core**; si algún día dejan de serlo, el widget
correspondiente se quita del registro `widgets.js`. Miembros NO importa nada
del Inicio: la dependencia va en un solo sentido.

**Detalle propio del Inicio:** los totales del día SÍ suman los pendientes
(el widget responde "qué se movió hoy", incluido lo que quedó por cobrar),
al revés que los totales del mes en Finanzas — es la regla del prototipo.

**Verificado en navegador (E2E por DOM):** KPIs con 5/1/1 y $582.000 · KPI
"Vencidos" → modal de filtro **sin salir de Inicio** → fila abre la ficha ·
dos clics seguidos en el mismo KPI lo reabren (contador `key`) ·
"Próximos vencimientos" → ficha de Luisa · "＋ Agregar miembro" → wizard paso
1/7 sobre el Inicio · los chips del módulo Miembros siguen funcionando igual ·
navegación de día (‹ → Domingo 19 jul, "Hoy" se apaga y
vuelve a encenderse) · registrar entrada pendiente $25.000 desde el Inicio →
fila resaltada con pulso + totales 155.000 + **evento Cobro en Próximos
eventos** · ✓ Saldar → "· saldada" y sin resalte · panel de eventos → Calendario ·
persistencia tras recarga · `npm run lint` y `npm run build` limpios · consola
sin errores. Screenshots del panel fallaron otra vez (entorno) → revisión
visual fina al usuario.

**Ajuste menor:** en "Próximos eventos", los eventos generados por Finanzas
(Cobro/Pago) no tienen hora → se omite el separador "·" en vez de dejarlo
colgando como el prototipo.

## Fase 6 — detalle (2026-07-24, rama `fase-6-inventory`)

**Creado:**
- `lib/inventoryStatus.js` — regla de negocio: el estado del producto
  (En stock / Bajo / Agotado) se DERIVA del stock (0 → agotado, ≤5 → bajo);
  listas cerradas `PRODUCT_CATEGORIES` y `EQUIPMENT_STATES`.
- `data/seedEquipment.js` (6 máquinas) + `data/seedGas.js` (**builder**
  `buildSeedGas()` con fechas ancladas a HOY, como el resto de semillas: 2
  cilindros en uso recientes + 3 finalizados; usos con ids deterministas).
- `services/inventoryService.js` **reescrito**: 3 sub-inventarios en 3 claves
  de storage (`products`/`equipment`/`gasCylinders`), CRUD async completo y
  métricas de gas derivadas en `computeCylinder` (restantes, %, costo/uso,
  turco/jacuzzi). Se mantiene la firma de `listProducts()` (`nombre`+`venta`)
  que consume el catálogo de Finanzas — verificado sin regresión.
- `modules/inventory/`: `index.js` (meta, order 50), `InventoryModule.jsx`
  (orquesta: header + pastillas + pestaña activa con swap), `useInventory.js`
  (un solo punto que habla con el service), `inventoryTabs.js` (**registro de
  sub-vistas**, mismo patrón que moduleRegistry — ARQUITECTURA §4),
  `inventoryStyles.js` (mapas de color) y `inventory.module.css`.
- `components/`: `InventoryTabs`+css (pastillas), `InventoryKpis`+css (3 mini-
  KPIs por pestaña), `InventoryPanel.module.css` (chrome compartido de las
  tablas), `InventoryModal.module.css` (chrome compartido de los 6 modales).
  Productos: `ProductsTab` + `ProductRow` + `ProductModal` (margen en vivo,
  eliminar). Equipos: `EquipmentTab` + `EquipmentRow` + `EquipmentModal`.
  Gas: `GasTab` (orquesta), `GasCylinderWidget`, `GasHistory` + `GasTab.module.css`,
  y 4 modales: `GasPurchaseModal`, `GasUsageModal`, `GasFinalizeModal`,
  `GasHistoryModal`.
- `moduleRegistry` incorpora `inventory` (order 50).

**Reglas/decisiones aplicadas:**
- Estado del producto SIEMPRE derivado (getProductStatus); métricas de gas
  derivadas en el service (nunca guardadas), igual criterio que memberStatus.
- **Mejora sobre el prototipo:** allí guardar un equipo era un no-op; aquí
  los equipos persisten vía service, como los productos (la app debe ser
  funcional, no solo maqueta).
- Modales se remontan con `key` en cada apertura; los del gas y equipo usan
  `overflowVisible` para que Date/Time-pickers sobresalgan. El modal de
  historial y el de edición de uso **se apilan** (editar un uso sin cerrar el
  historial), y ambos leen la versión fresca del cilindro.

**Ajustes por feedback del cliente (2026-07-24, misma rama):**
1. **Chips de estado de Miembros casi centrados** — antes quedaban pegados al
   buscador (a la derecha) porque solo `.heading` tenía `margin-right:auto`. Se
   añadió `margin-left:auto` al `.search`: el espacio sobrante se reparte a
   ambos lados de los chips y estos quedan casi centrados, ligeramente a la
   izquierda, sin solaparse con el buscador. Solo CSS
   (`MembersToolbar.module.css`).
2. **Ventas descuentan stock del inventario** — el cliente notó que registrar
   una entrada no movía el inventario (antes era así: el prototipo tampoco lo
   hacía y los services eran mocks independientes). Decisión aprobada: *las
   ventas descuentan stock* (opción 1 de 3). Implementado con
   `inventoryService.applySale(items)` (descuenta por NOMBRE de producto, tope
   en 0; los artículos escritos a mano no coinciden y no afectan stock) llamado
   desde `useFinance.createMovement` y `useDashboard.createMovement` cuando el
   `tipo` es `entrada` o `entrada_pend` (la venta pendiente también descuenta:
   el producto ya salió aunque falte cobrar). Las salidas NO tocan stock.
   Verificado: venta de Proteína ×3 (stock 3 → 0 → "Agotado", KPI Agotados
   1→2). Coordinación en el HOOK, mismo patrón que la sync a calendario —
   `movementsService` no importa `inventoryService`.

**Verificado en navegador (E2E por DOM):** las 3 pestañas con sus KPIs
(productos 8/2/1 · equipos 6/1/1 · gas 2 activos/63 restantes/5 al año) ·
registrar uso en Sauna (26→27, restantes 34→33) · historial ordenado desc con
el uso nuevo arriba · editar un uso desde el historial (modal apilado,
precargado) · eliminar uso (27→26) · finalizar el cilindro compartido
(resumen Turco 14/Jacuzzi 17/Total 31, total precargado → widget pasa a vacío)
· registrar compra (costo/uso $3.167 en vivo → cilindro nuevo de 60 usos,
KPIs a 2 activos/94 restantes/6 al año) · alta de producto con margen en vivo
($3.000 · 38%) que **persiste tras recarga** (8→9) · **Finanzas sigue leyendo
el catálogo** e incluye el producto nuevo (sin regresión) · `npm run lint` y
`npm run build` limpios · consola sin errores. Revisión visual fina al usuario.

## Fase 7 — detalle (2026-07-24, rama `fase-7-settings`)

**Creado:**
- `data/seedUsers.js` (4 cuentas + `ROLE_LEGEND`). `services/usersService.js`
  (listUsers/createUser; la contraseña NO se persiste). `plansService.js`
  ampliado con `createPlan`/`togglePlan`/`deletePlan`. `settingsService.js`
  ampliado con datos del gimnasio (`GYM_FIELDS`, getGymInfo/setGymField),
  notificaciones (getNotifications/setNotification) y respaldos
  (getBackup/setAutoBackup/runBackup).
- `lib/csv.js` — `toCsv` + `downloadCsv` (genera el CSV en el cliente con BOM y
  `;`, para los exports de Respaldos).
- `modules/settings/`: `index.js` (meta, order 60), `SettingsModule.jsx`
  (orquesta: encabezado + sub-nav + sección activa con swap), `useSettings.js`
  (centraliza gym/users/plans/notif/backup + acciones), `settingsSections.js`
  (**registro de 7 secciones**, mismo patrón que inventoryTabs/widgets),
  `roleStyles.js` y `settings.module.css`.
- `components/`: `SettingsNav`+css (sub-nav lateral), `SettingsCard` +
  `SettingsShared.module.css` (chrome de tarjeta y filas compartido),
  `SettingsModal.module.css` (chrome de los 2 modales), y las 7 secciones:
  `GeneralSection` (logo + campos), `AppearanceSection` (acento/densidad/bordes),
  `ModulesSection` (opcionales + base), `AccountsSection` + `UserModal`,
  `PlansSection` + `PlanModal`, `NotificationsSection`, `DataSection` (exports +
  copias).
- `moduleRegistry` incorpora `settings` (order 60). Dos glifos nuevos en
  `Icon` (`appearance` ◑, `notification` ◔).

**Decisiones:**
- **Apariencia es NUEVA:** el prototipo no tenía sección in-app de tema (se
  controlaba desde el panel de la herramienta de diseño). Se construyó como
  7ª sección conectada a `ThemeProvider.setAppearance` (decisión #2). Quedan
  7 secciones: general · apariencia · módulos · cuentas · planes ·
  notificaciones · datos.
- **Reutilización de contextos:** Apariencia usa `useTheme`, Módulos usa
  `useModules` (no pasan por `useSettings`). Los módulos base se derivan de
  `MODULES` (core:true); los opcionales (classes/trainers/reports) se listan
  estáticos porque aún no existen (fase 8) — sus flags ya funcionan.
- **Planes = catálogo compartido:** la sección Planes hace CRUD sobre
  `plansService`, el mismo que lee Miembros (`listActivePlans`). OJO: el
  wizard de Miembros usa `PLAN_OPTIONS` (lista fija de `lib/memberStatus`),
  así que activar/crear un plan aquí NO se refleja aún en el wizard — es otro
  silo, se unifica en la Fase 10 (ver "Limitaciones conocidas").
- **Exports CSV** funcionales (miembros e inventario desde sus services;
  "Pagos y recibos" exporta los recibos de los miembros como aproximación —
  el libro de transacciones real llega con el backend).

**Bug corregido en verificación:** import circular — `UserModal` importaba
`ROLE_STYLES` de `AccountsSection` y lo usaba en el nivel superior del módulo,
pero `AccountsSection` importa `UserModal`; al evaluar, `ROLE_STYLES` estaba en
TDZ y la app NO montaba (root vacío, sin error en consola). Se movió
`ROLE_STYLES` a `modules/settings/roleStyles.js` (módulo neutro) y ambos lo
importan de ahí. Lección: no usar en el TOP-LEVEL de un módulo un valor
importado de otro con el que hay ciclo.

**Verificado en navegador (E2E por DOM):** las 7 secciones cargan · Apariencia:
acento coral→océano estampa `data-accent` y persiste, densidad y bordes igual ·
Módulos: toggle Clases persiste el flag, base lista 6 núcleo con ✓ · Cuentas:
alta de "Laura Gómez / Admin" persiste (5 usuarios) y **la contraseña no se
guarda** · Planes: toggle Anual→Activo y alta de "Semestral" persisten (6) ·
Notificaciones: toggle persiste · Datos: CSV de miembros generado con datos
reales (cédula/teléfono formateados), "Crear copia ahora" sella la fecha ·
General: editar el nombre persiste · **todo sobrevive recarga** · `npm run lint`
y `npm run build` limpios · consola sin errores. Screenshots del panel fallaron
(entorno) → revisión visual fina al usuario.

## Fase 8 — detalle (2026-07-24, rama `fase-8-optional`)

**Creado:**
- `components/StatTiles/` — mini-KPIs reutilizables (label + cifra mono + delta
  opcional); los usan los tres módulos. `components/FormModal/formModal.module.css`
  — chrome de modal-formulario compartido (lo usan ClassModal y TrainerModal).
- `data/seedClasses.js` (6 clases, paleta categórica en hex), `seedTrainers.js`
  (5), `seedReports.js` (KPIs + ingresos + distribución, cifras fijas de demo).
  `services/`: `classesService` (list/create), `trainersService` (list/create),
  `reportsService` (getReport, solo lectura).
- `modules/classes/`: meta (order 35), `ClassesModule`, `useClasses`,
  `ClassCard` (deriva ocupación y color de barra), `ClassModal`, css.
- `modules/trainers/`: meta (order 38), `TrainersModule`, `useTrainers`,
  `TrainerCard` (avatar con anillo de acento si disponible), `TrainerModal`, css.
- `modules/reports/`: meta (order 55), `ReportsModule` (solo lectura),
  `useReports`, `IncomeBars` (barras a mano) y `PlanDistribution`, css.
- `moduleRegistry` incorpora los tres con **core:false** y order que reproduce
  el orden del prototipo (classes 35 y trainers 38 entre Calendario y Finanzas;
  reports 55 entre Inventario y Ajustes). El orden VISIBLE lo decide `meta.order`
  vía `getVisibleModules`, no la posición en el array.

**Decisiones:**
- **Opcionales de verdad:** aparecen en la barra solo si su flag no está
  apagado (ya lo hacía `getVisibleModules`; ahora hay módulos reales detrás).
- **`ModulesSection` ya deriva** los opcionales de `MODULES.filter(!core)` (se
  eliminó la lista estática `OPTIONAL` de la fase 7) — al agregar un opcional
  nuevo, aparece solo en Ajustes sin tocar esa sección.
- **Botones "＋" funcionales:** el prototipo tenía "Nueva clase"/"Nuevo
  entrenador" sin acción; aquí crean y persisten vía service (coherente con el
  resto de la app, sin botones muertos). Reportes es solo lectura (como el
  prototipo); las cifras reales agregadas son trabajo de Fase 10.
- **Editar y eliminar (feedback del cliente, misma rama):** clic en una
  tarjeta de Clase o Entrenador abre el modal en modo edición (campos
  precargados + botón "Eliminar"), mismo patrón que ProductRow/EquipmentRow.
  Los services ganaron `updateClass`/`deleteClass` y
  `updateTrainer`/`deleteTrainer`; al editar se conserva el color de la clase.
  El modal de entrenador añade un control de **Estado** (Disponible/Ausente).
  Las tarjetas pasaron a ser `<button>` (se neutralizaron sus estilos por
  defecto). Chrome de "Eliminar" añadido a `FormModal/formModal.module.css`.

**Verificado en navegador (E2E por DOM + screenshot):** los 9 módulos en la
barra en el orden correcto · Clases: KPIs 6/101/77%, 6 tarjetas con barras de
ocupación; alta de "Pilates" (6→7, persistida) · Entrenadores: KPIs 5/4/153,
tarjetas con anillo y estado; alta de "Pedro Salas" (5→6, nace disponible) ·
Reportes: 4 KPIs con delta, 6 barras de ingresos, 4 planes · apagar Reportes en
Ajustes lo quita de la barra (flag `reports:false`) y reactivarlo lo devuelve ·
**editar** clase (Spinning cupo 25→40, resto intacto) · **eliminar** clase
(Pilates, 7→6) · **editar** entrenador (Camila → Ausente, Disponibles 5→4) ·
**eliminar** entrenador (Pedro, 6→5) · **todo persiste tras recarga** ·
`npm run lint` y `npm run build` limpios · consola sin errores.

## Fase 9 — detalle (2026-07-24, rama `fase-9-auditoria`)

Auditoría de fidelidad con los 9 módulos ya ensamblados. Barrido pantalla por
pantalla (login + 9 módulos) por DOM + screenshot, comparando contra la
especificación del prototipo ya conocida.

**Bug real encontrado y corregido — solape de pestañas en la TopBar:** al
llegar a 9 módulos, las pestañas dejaron de caber a 1280px y, por
`justify-content: center` + `overflow-x: auto`, el contenido centrado se
desbordaba por ambos lados → la 1.ª pestaña ("Inicio") quedaba RECORTADA bajo
el wordmark "OVERSEER" (medido: solape de 23px). Fix en `TopBar.module.css`:
- `.tabs` → `justify-content: safe center` + `min-width: 0`: centra cuando
  caben (pocos módulos) pero alinea al inicio (sin recortar) cuando no caben.
- `.tab` compactado (padding `7px 13px`→`7px 10px`, gap `7`→`6`) y gap del
  contenedor `4`→`2`: las 9 pestañas ahora **caben sin scroll a 1280px**
  (overflow 74px → 0). Verificado: "Inicio" empieza 14px a la derecha del
  wordmark; las 9 visibles.

**Verificaciones de fidelidad (sin cambios necesarios):** login (orbes, glow,
campos, Recordarme) · Inicio (KPIs, movimientos del día, sidebar) · Miembros
(chips centrados, tabla, estados) · Calendario (grid lunes-first, hoy con
anillo, festivo en lavanda, eventos) · Finanzas (KPIs, sparkline, movimientos,
desgloses) · Reportes (KPIs con delta, barras, distribución) — todos fieles.

**Theming transversal (cross-check):** con acento **océano** + densidad
**espaciosa** + bordes **suaves**, los módulos nuevos responden correctamente
(logo/pestaña/última barra en azul, más aire, esquinas redondeadas) sin
romperse, y las 9 pestañas siguen cabiendo. Todos los módulos consumen los
tokens de densidad/redondez/acento — nada hardcodeado que rompa el tema.

**Nota sobre consola:** durante el barrido aparecían mensajes `[vite] Failed to
reload …` de Clases/Trainers/StatTiles. Se comprobó que eran **historial de HMR
obsoleto** de la sesión de edición de la Fase 8, bufferizado en la pestaña
antigua: en una **pestaña nueva** (server reiniciado) la consola queda LIMPIA
tras recorrer los tres módulos, y `npm run build` pasa sin errores. No hay
problema real.

**Resultado:** fidelidad confirmada; el único cambio de la fase es el fix de la
TopBar (una regresión que introdujeron los 9 módulos, no un defecto de fase).

## Fase 10 — Tramo A — detalle (2026-07-28, rama `fase-10-backend`)

Backend propio + reescritura de `services/` con **paridad total**: la app se
comporta EXACTAMENTE igual que con el mock, pero los datos ahora viven en
SQLite vía una API Express. Ningún módulo, hook ni componente cambió
(ARQUITECTURA §9); solo el interior de `services/*`.

**Creado — `server/` (carpeta hermana de `overseer/`):**
- `package.json` (2 deps: `express` + `better-sqlite3`), `.gitignore`
  (node_modules + `*.db`), `README.md` (cómo correr, endpoints, reset).
- `src/index.js` — arranca Express, **CORS a mano** (sin dep `cors`), monta un
  router por entidad bajo `/api`, healthcheck, manejador de errores.
- `src/db.js` — conexión SQLite (`overseer.db`, WAL, FK on) + esquema
  (`migrate`) con una tabla por entidad + `gas_usos` + `settings`. Columna
  `ord` uniforme para replicar el orden del mock (anteponer vs anexar): al
  insertar "arriba" `MIN(ord)-1`, "al final" `MAX(ord)+1`, se lee `ORDER BY ord`.
- `src/seed.js` — siembra por-tabla si está vacía, espejando `data/` con las
  MISMAS fechas relativas a hoy (miembros, eventos y gas anclados a la fecha
  real). Idempotente y envuelto en transacción.
- `src/finance.js` — generador demo determinista (PRNG por mes) + `toUserDomain`
  + constantes de ejemplo (desglose, gastos fijos, historial) portadas de
  `seedFinance`. Se mantiene para la PARIDAD; desaparece en el Tramo B.
- `src/lib/` — `date.js`, `id.js`, `seededRandom.js` (portados del front).
- `src/routes/` — `members`, `movements`, `events`, `inventory`
  (products/equipment/gas), `plans`, `users`, `settings`, `classes`, `trainers`.
  Cada endpoint devuelve **exactamente** la forma que espera el service que lo
  consume (misma firma y forma de retorno que el mock).

**Modificado — `overseer/src/services/`:**
- `api.js` (NUEVO) — cliente `fetch` mínimo (apiGet/Post/Patch/Put/Delete);
  base `VITE_API_URL || http://localhost:3001` + `/api`. Es el nuevo "único
  punto de contacto con el origen" (antes lo era `storage.js`).
- Reescritos a `fetch`, mismas firmas: `membersService`, `movementsService`,
  `eventsService` (`addFromMovement` se queda: arma el título con `formatMoney`
  y delega en `saveEvent`), `inventoryService`, `plansService`, `usersService`
  (re-exporta `ROLE_LEGEND`), `classesService`, `trainersService`.
- `settingsService` quedó **híbrido**: apariencia y flags de módulos siguen en
  `localStorage` (decisión #2 + se leen al arrancar, no deben depender del
  server); gimnasio/notificaciones/respaldos van al backend. `GYM_FIELDS` se
  queda como constante de UI.
- **Sin tocar (paridad):** `authService`, `reportsService`, `storage.js`
  (storage lo siguen usando apariencia/flags y la sesión). Auth y reportes
  reales son Tramo B.

**Eliminado (mock muerto, su data vive ahora en `server/src/seed.js`):**
`data/seed{Members,Events,Finance,Products,Equipment,Gas,Plans,Classes,Trainers}.js`
y `lib/seededRandom.js`. Se conservan `data/seedUsers.js` (ROLE_LEGEND) y
`data/seedReports.js` (reportsService, sin cambios). Motivo: evitar dos fuentes
de verdad que se desincronicen. `lib/id.js` se conserva (utilidad genérica).

**Verificado:** `npm run lint` y `npm run build` del front limpios (los 3
warnings de fast-refresh son preexistentes). Backend probado por fetch directo
(create/settle/apply-sale/uso de gas/upsert de evento) y **E2E en navegador**:
login → Inicio con KPIs y vencimientos derivados del backend (Mateo=Vencido,
Luisa=Vence pronto), Miembros (6, conteos 5/1/1, cédula/teléfono formateados),
Finanzas (13 movs generados deterministas, entradas $617k/salidas $3.015k/
balance −$2.398k, desglose 52/30/8/10). **Escritura E2E:** registrar una entrada
→ `POST /movements` 201 + preflight CORS 204 + refresh; al quedar como
`entrada_pend` se comprobó que **no suma a totales** ($617k intacto) y que
**agenda el evento Cobro** en el calendario (sync `addFromMovement`); persiste
en SQLite (confirmado tras recarga). Consola del navegador **sin errores**. La
BD se dejó reseteada (semilla limpia) para la revisión.

**Cómo correr ahora (2 procesos):** `cd server && npm install && npm start`
(API en :3001) y en otra terminal `cd overseer && npm run dev` (Vite en :5173).
Ver `server/README.md`.

## Fase 10 — Tramo B · frente 1 (libro mayor único) — detalle (2026-07-29, rama `fase-10-tramo-b`)

Se convierte la tabla `movements` en el **libro mayor único**: pagos de
membresía, ventas y gastos son asientos del mismo origen, y el desglose/historial
se **agregan del libro real**. Finanzas queda internamente consistente. **No se
tocó nada del front** (módulos/hooks/componentes/services): mismas firmas y
formas de retorno de todos los endpoints (ARQUITECTURA §9). Todo el cambio es
interior del backend + seed + la ruta de miembros.

**Backend modificado (`server/`):**
- `src/db.js` — nueva columna `categoria` en `movements` (clasifica el asiento de
  ingreso) + helper idempotente `ensureColumn` (ALTER seguro para BDs ya creadas).
- `src/routes/members.js` — alta (`POST /`) y renovación (`POST /:id/renew`)
  insertan un asiento `entrada`/`categoria:'membresia'` (`valor > 0`; se omite
  "Especial") con `fecha = inicio`. El PATCH de edición NO crea asiento.
  Acoplamiento backend a `movements` a propósito; el front no se entera.
- `src/finance.js` — **retirado** el generador demo (`genMonth`) y las semillas
  fijas (`INCOME_SOURCES`, `PAID_THIS_MONTH`, `HISTORY_MONTHS`, `FIXED_UPCOMING`,
  `MEMBERSHIP_PRICES`). Se conservan `sign`/`toUserDomain`/`dueLabel` y se añade
  `CATEGORY_META`/`CATEGORY_ORDER` (etiqueta+color por categoría de ingreso).
- `src/routes/movements.js` — `listMonth` lee solo la tabla; `getHistory(y,m)`
  agrega 6 meses reales; `getIncomeBreakdown` agrega el **mes calendario actual**
  por categoría (el front lo llama sin mes); `getUpcomingExpenses` usa salidas
  pendientes + recurrentes del libro (sin lista hardcodeada). `POST /` infiere la
  categoría (con artículos → `venta`; si no, `otro`). **Mismas formas de retorno.**
- `src/seed.js` — nuevo `seedMovements()`: (1) asiento de cada miembro semilla
  (fecha = su `inicio`), (2) histórico determinista de 6 meses persistido como
  filas reales (reemplaza al generador al vuelo), (3) gastos fijos recurrentes
  (Nómina, Arriendo). Se corre tras `seedMembers`.

**Nota de alcance (a tu decisión antes de cerrar el Tramo B):** el KPI "Ingresos
del mes" del **Inicio** sigue = `Σ members.valor` (valor de membresías activas),
métrica DISTINTA de "Entradas del mes" de Finanzas (caja recibida este mes, ahora
del libro). Este frente hizo Finanzas consistente y enrutó los pagos al libro; no
forzó el KPI de Inicio a ser idéntico porque miden cosas distintas. Se puede
igualar (leer el KPI del libro) si lo prefieres.

**Verificado (E2E):** BD reseteada → `npm start` resembró. **Concordancia:** el
desglose "Origen de las entradas" suma **$752.000 = "Entradas del mes"**
(Membresías 53% · Inscripciones 11% · Clases 20% · Otros 15%); el historial
muestra 6 meses con curva real; "Gastos próximos" trae Nómina + Arriendo
recurrentes. **Pago→libro:** `POST /members` (1 mes $70.000) → entradas
$752k→$822k y aparece "Membresía 1 mes · <nombre>". Sin movimientos `gen-*`.
Front renderiza en modo oscuro (reskin) sin errores de consola; `npm run lint`
(solo los 3 warnings de fast-refresh preexistentes) y `npm run build` limpios. BD
dejada reseteada (semilla limpia) para tu revisión.

## Fase 10 — Tramo B · frente 2 (sync Planes↔alta/renovación) — detalle (2026-07-29, rama `fase-10-tramo-b`)

El wizard de alta/renovación y el dropdown de la ficha dejan de usar la lista
fija `PLAN_OPTIONS` y leen el **catálogo real** (`plansService.listActivePlans()`,
Ajustes → Planes). Así activar/ocultar/crear/eliminar un plan en Ajustes se
refleja al instante al crear o renovar una membresía, con el **precio
precargado**. Ajustes es la única fuente del catálogo (petición del cliente #1).

**Front modificado (`overseer/src/`):**
- `hooks/useActivePlans.js` (NUEVO) — trae los planes activos al montar; lo usan
  los dos sitios que abren los modales de Miembros (el módulo y el Inicio).
- `lib/memberStatus.js` — `computeFin(tipo, inicio, duracionDias)` gana el 3er
  parámetro: los planes ESTÁNDAR siguen sumando meses calendario (regla del
  gimnasio), y los planes del catálogo sin preset caen a `duracionDias`. Se
  exporta `SPECIAL_PLAN` ('Especial'); `PLAN_OPTIONS` queda solo como respaldo.
- `components/WizardStepPlanDates.jsx` — recibe `plans` (objetos); las opciones
  son los planes activos **+ "Especial"** (tipo sin fin, no vive en el catálogo);
  elegir un plan **precarga el valor** con su precio y recalcula el fin. Si el
  catálogo no cargó, respaldo a `PLAN_OPTIONS`.
- `components/MemberWizard.jsx` — prop `plans` (antes `planOptions`); el alta
  arranca en el plan por defecto con su precio; la renovación conserva plan/valor
  anteriores y elegir uno los actualiza al precio del catálogo.
- `modules/members/MembersModule.jsx` y
  `modules/dashboard/components/MemberModalsHost.jsx` — usan `useActivePlans`;
  pasan `plans` (objetos) al wizard y los nombres (activos + Especial) a la ficha.

**Decisiones:** "Especial" se conserva como opción especial anexada (no es plan
del catálogo — coherente con la Fase 2). La ficha (`MemberDetailModal`) sigue
mostrando el `member.tipo` aunque su plan ya no esté activo (el `PlanDropdown`
pinta siempre el valor actual). Sin cambios de contrato en services/endpoints.

**Verificado (E2E en navegador):** el wizard ofrece los planes ACTIVOS
(Quincena/1 mes/2 meses/3 meses) + Especial, **sin Anual** (oculto en el
catálogo); elegir "3 meses" precarga **$180.000** y "1 mes" da fin a mes
calendario (29/07→29/08). **Fuente única:** activar Anual en Ajustes → Planes lo
hace aparecer en el alta al instante, con fin +365 días (`duracionDias`) y precio
**$620.000** precargado. Consola sin errores; `npm run lint` y `npm run build`
limpios. Anual se dejó de nuevo oculto (semilla limpia).

## Fase 10 — Tramo B · frente 3 (auth real con rol) — detalle (2026-07-30, rama `fase-10-tramo-b`)

El login deja de ser un mock local y valida contra el backend, que resuelve la
cuenta y su **ROL**. La sesión ahora expone `role`, lo que habilita el gating de
Admin (frente 4). Las cuentas NO guardan contraseña (decisión del proyecto), así
que la clave solo se exige no vacía; lo que importa es que la sesión traiga el rol.

**Backend (`server/`):**
- `routes/auth.js` (NUEVO) — `POST /auth/login { user, pass }`. Busca una cuenta
  ACTIVA por email o nombre (case-insensitive); si coincide devuelve
  `{ id, nombre, email, rol }` con su rol real. Registrado en `index.js` bajo
  `/api/auth`.
- **Decisión (reversible en 1 línea):** login **permisivo con rol** — si el
  usuario no coincide con ninguna cuenta, entra igual con rol `Admin` (preserva
  el acceso rápido de siempre: escribir cualquier usuario entra). Para auth
  estricta, devolver `{ ok: false }` en ese caso. Credenciales vacías → `ok:false`.

**Front (`overseer/src/`):**
- `services/authService.js` — `login()` hace `POST /auth/login`; devuelve `user`
  como **objeto** `{ id, nombre, email, rol }`. `getSession()` lee ese objeto de
  storage (respeta "Recordarme"). Las sesiones viejas (formato string) se
  invalidan solas (se pide re-login una vez).
- `context/SessionProvider.jsx` — guarda la cuenta; expone `user` = **nombre**
  (compat con toda la UI, sin cambios en consumidores), y añade `role`, `userId`
  y `account`. `enter(cuenta)` recibe el objeto.
- `app/TopBar/UserMenu.jsx` — el rol del encabezado sale de `role` (antes
  "Administrador" hardcodeado).
- `auth/LoginScreen.jsx` — el saludo de la celebración usa el **nombre real** de
  la cuenta (antes el texto tecleado, que podía ser un email).

**Verificado (E2E):** por API — `admin@overseer.gym`→Admin (Andrés Ríos),
`recepcion@overseer.gym`→Recepción (Paula Méndez), usuario libre→Admin (fallback),
vacío→`ok:false`. En navegador: login con `recepcion@overseer.gym` → saluda
"Buenos días, Paula Méndez" y el menú de usuario muestra **"Recepción"** (rol real,
ya no hardcodeado). `npm run lint` (3 warnings preexistentes) y `npm run build`
limpios; sin errores nuevos de consola.

## Cómo continuar

**Fase 10 — Tramo B (en curso, por checkpoints).** El Tramo A está mergeado
(PR #12). El Tramo B se hace **frente por frente** en la rama `fase-10-tramo-b`
(PR #14), con revisión tuya entre cada uno. Estado:
1. ✅ **Libro mayor único (frente 1)** — hecho, **pendiente de revisión**. Detalle abajo.
2. ✅ **Sync Planes↔alta/renovación (frente 2)** — hecho, **pendiente de revisión**.
   El wizard/ficha de Miembros leen `plansService.listActivePlans()` (precio
   precargado) en vez de `PLAN_OPTIONS`. Detalle abajo.
3. ✅ **Auth real con rol (frente 3)** — hecho, **pendiente de revisión**. Login
   contra el backend (`POST /auth/login`); la sesión trae el ROL. Detalle abajo.
4. ⏳ **Eliminar cuentas (solo Admin)** — ahora viable: `useSession().role` ya da
   el rol real. Falta `deleteUser` en backend/`usersService` + gating por Admin
   en `AccountsSection`.
5. ⏳ **Menú avanzado / secreto:** import de configuración, borrado selectivo y
   reset total (helpers en el backend).

**Retomar el frente 4:** en la rama `fase-10-tramo-b`. Correr los 2 procesos
como abajo. La BD quedó reseteada (semilla limpia) para revisión.

### Referencia del Tramo A (contexto original de la fase)

**Stack ACORDADO: Node + Express + SQLite** (decisión #9). El frontend (fases 0–9) está completo y mergeado
(hasta PR #10). El principio rector: se reescribe SOLO el interior de
`services/` (mock/localStorage → llamadas `fetch` a la API); módulos, hooks y
componentes NO cambian (ARQUITECTURA §9). Si algún contrato de service necesita
cambiar, es señal de alto → consultar antes.

Arranque sugerido de la Fase 10:
1. `git checkout main && git pull`; crear `git checkout -b fase-10-backend`.
2. **Backend** en una carpeta hermana (p. ej. `server/`): Node + Express +
   SQLite (`better-sqlite3` o `sqlite3`). Esquema por entidad espejando las
   semillas de `data/`: members, movements, events, products, equipment, gas
   cylinders (+ usos), plans, users, settings (gym/notif/backup/appearance).
3. **Endpoints** que reflejen los contratos actuales de cada service (mirar la
   cabecera JSDoc de cada archivo en `services/` — ahí está la firma exacta:
   listMembers/createMember/updateMember/renewMember, listMonth/listDay/
   createMovement/settleMovement, listCylinders/createPurchase/addUsage/…, etc.).
4. **Reescribir `services/*`** para hacer `fetch` a esos endpoints, MANTENIENDO
   las mismas firmas y formas de retorno. `services/storage.js` deja de usarse
   (o queda solo para caché); el resto de la app no se entera.
5. **Resolver lo aplazado** (ver "Limitaciones conocidas" y "Peticiones para la
   Fase 10"), que ahora sí es viable con datos reales: libro mayor único (pagos
   de miembros/ventas/gastos como asientos del mismo origen), sync
   planes↔alta/renovación (el wizard lee `plansService`, no `PLAN_OPTIONS`),
   eliminar cuentas (Admin) con rol real en la sesión, y el menú avanzado
   import/reset (helpers en el backend).
6. Auth real: reemplazar el `authService` mock por login contra el backend; la
   sesión debe traer el ROL del usuario (habilita el gating de Admin).

**Piezas que YA existen y hay que reutilizar (no reinventar):**

**Piezas que YA existen y hay que reutilizar (no reinventar):**
- `components/`: KpiCard, Badge, EmptyState, Avatar, Field, MoneyInput,
  SegmentedOptions, ProgressBar, Toggle, Modal, MonthNav, DatePicker, TimePicker.
- `hooks/`: `useModal`, `usePopover`, `useSwapAnimation`.
- **Registros de sub-vistas** como plantilla: `widgets.js` (Inicio),
  `inventoryTabs.js` (Inventario), `settingsSections.js` (Ajustes).
- Chrome de modal compartido: `components/FormModal/formModal.module.css`
  (genérico), más los de `inventory/` y `settings/`.
- `components/StatTiles` (mini-KPIs con delta), reutilizable en más módulos.

**Recordatorios de convenciones que ya costaron un bug:**
- Keyframes usados por CLASES van en el propio `.module.css` (CSS Modules
  hashea los nombres); los globales de `index.css` solo valen inline.
- Los modales van con portal a `document.body` (ya lo hace `<Modal>`): un
  ancestro con `transform` rompe `position: fixed`.
- Guardar los componentes de gráficos/derivados contra datos vacíos del
  primer render (el `Sparkline` tumbó la app por eso).

## Fase 11 — detalle (2026-07-29, rama `fase-11-reskin`)

Reskin al sistema de diseño **"Overseer Modernist"** (kit del cliente). Rama
independiente creada desde `main`, en paralelo a la Fase 10 (no depende del
backend; corre con el mock). Principio: cambiar el TEMA, no la arquitectura.

**Hallazgo clave:** el modo oscuro de OVERSEER ya ERA la paleta del kit (mismos
neutros). El grueso del trabajo fue **añadir el modo claro** (que no existía).

**Fundación:**
- Fuente **Archivo** (reemplaza Sora) en `index.html` + `--font-sans`.
- Nuevo eje **`tema`** (claro | oscuro, default oscuro) en `ThemeProvider` +
  `settingsService`; estampa `data-tema` en `<html>`. `theme.css` mantiene el
  OSCURO en `:root` y define el CLARO como override `html[data-tema='claro']`
  (mapea la paleta clara del kit a los nombres de token de OVERSEER).
- Toggle claro/oscuro en el **menú de usuario** (TopBar → Cuenta), justo antes
  de "Cambiar de usuario".
- Acento retintado a **bermellón** (`#EC3013`) en `accents.css`/`theme.css`.

**Propagación (tokenización para que el modo claro voltee):** se tokenizaron
todos los colores oscuros hardcodeados de componentes y mapas JS (TopBar,
Button, Avatar, MonthNav, DatePicker, PlanDropdown, MemberTable/Wizard/Detail,
SettingsNav, UserMenu, FormModal, InventoryModal, GasTab, y Finanzas —incl. la
identidad AZUL del historial con tokens `--hist-*`—). Nuevos tokens: `--on-acc`,
`--topbar-bg`, `--tab-active-bg`, `--avatar-neutral-bg`, `--btn-disabled-bg`,
`--warn-border`, familia `--cal-*` (celda/hueco/trama/sombra de evento),
`--hist-*` (azul del historial) y `--pend-*` (pulso de pendientes).

**Login reskineado:** tokenizado, ahora sigue el tema (claro/oscuro).

**Nuevo — modal de eventos del día** (`DayEventsModal`): al clicar un día CON
eventos abre la lista del día (con degradado sutil por categoría) para editar
uno o agregar; un día vacío abre "Nuevo evento" directo.

**Refinamientos por feedback del cliente:** calendario (días fuera de mes con
trama diagonal + tono sutil en claro; findes/festivos más marcados; halo claro
en oscuro para que las píldoras no se camuflen); Clases con colores más
saturados; hover del nombre de Miembros en azul (`--info`) + micro-realce del
avatar; naranja de "vencidos" suavizado en oscuro; pulso de pago pendiente en
naranja en claro; eje Y del historial separado del primer mes; y más.

**Verificado:** `npm run lint` y `npm run build` limpios; barrido en tema claro
sin elementos oscuros residuales (salvo scrim intencional de modales); modo
oscuro preservado byte-a-byte (los tokens `:root` resuelven a los hex
originales). Consola sin errores.

**Nota:** los colores de Clases se guardan en `localStorage`, así que el cambio
de paleta aplica al resembrar (borrar `overseer:classes`) o en instalación
fresca. `server/` NO forma parte de esta rama (es de la Fase 10 / PR #12).
