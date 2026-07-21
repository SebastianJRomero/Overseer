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
| 5 | Módulo `dashboard` (compone members+movements+events) | **← SIGUIENTE** | |
| 6 | Módulo `inventory` (productos / equipo / gas) | pendiente | |
| 7 | Módulo `settings` (7 secciones, incl. Apariencia) | pendiente | |
| 8 | Módulos opcionales `classes` / `trainers` / `reports` | pendiente | |
| 9 | Cierre: auditoría de fidelidad vs prototipo | pendiente | |
| 10 | Backend + Base de datos (reescribe `services/` mock→API; stack a acordar) | pendiente | |

## Decisiones aprobadas por el usuario

1. **Solo desktop** — sin Dock, sin marco de teléfono, sin variantes móviles (2026-07-15).
2. **Theming** en Ajustes → Apariencia, persistido en localStorage (2026-07-15).
3. **Mock** = semillas del prototipo + generador determinista de movimientos anclado a la fecha real (2026-07-15).
4. **MoneyInput** formatea puntos de miles EN VIVO: teclear `12000` muestra `$ 12.000` (2026-07-16).
5. **PROGRESO.md** (este archivo) se actualiza al cierre de cada fase (2026-07-16).
6. **Git**: commit sugerido tras la aprobación manual de cada fase; nunca sin confirmar (2026-07-16).
7. Sin librerías externas; sin router; iconos = glifos unicode detrás de `<Icon/>`.

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

## Cómo continuar

**Siguiente fase: 5 — Módulo `dashboard` (Inicio).**
1. Compone lo ya hecho vía `dashboard/widgets.js`: KpiGrid (de `useMembers`),
   Movimientos del día (selector de día + `movementsService.listDay`),
   Próximos vencimientos (miembros con venceFlag), Próximos eventos
   (`eventsService.getUpcoming`).
2. El módulo `demo` (order 10) se REEMPLAZA por `dashboard` en el registry
   (mismo id/posición de Inicio); revisar `DEFAULT_MODULE_ID`.
3. Reutilizar el modal de filtro y la ficha de Miembros: abrir desde los KPIs
   del Inicio sin acoplar módulos (navegar con parámetro o elevar estado; se
   decide en la fase con la opción más limpia).
4. Botones de movimiento del Inicio reusan `MovementModal` de Finanzas.
5. Actualizar este archivo y detenerse para revisión.

**Piezas que YA existen y hay que reutilizar (no reinventar):**
- `modules/members/useMembers.js` → lista con estado derivado + `counts`
  (activos / pronto / vencidos) para el KpiGrid y los vencimientos.
- `services/movementsService.listDay(y, m, d)` → movimientos de un día
  (creado en la fase 4 pensando justo en este widget) y `settleMovement`.
- `services/eventsService.getUpcoming(n)` → próximos eventos ya ordenados.
- `modules/finance/components/MovementModal` + `movementMeta` y
  `MovementRow` → para la lista de movimientos del día y sus botones.
- `components/MonthNav` sirve también como selector de DÍA (‹ / etiqueta /
  › / "Hoy"); el prototipo enciende "Hoy" solo si el cursor está en el día real.
- `components/KpiCard`, `Badge`, `EmptyState`, `Avatar`, `useModal`,
  `useSwapAnimation`.

**Recordatorios de convenciones que ya costaron un bug:**
- Keyframes usados por CLASES van en el propio `.module.css` (CSS Modules
  hashea los nombres); los globales de `index.css` solo valen inline.
- Los modales van con portal a `document.body` (ya lo hace `<Modal>`): un
  ancestro con `transform` rompe `position: fixed`.
- Guardar los componentes de gráficos/derivados contra datos vacíos del
  primer render (el `Sparkline` tumbó la app por eso).
