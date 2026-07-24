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
| 6 | Módulo `inventory` (productos / equipo / gas) | hecha — **pendiente de revisión** | 2026-07-24 |
| 7 | Módulo `settings` (7 secciones, incl. Apariencia) | **← SIGUIENTE** | |
| 8 | Módulos opcionales `classes` / `trainers` / `reports` | pendiente | |
| 9 | Cierre: auditoría de fidelidad vs prototipo | pendiente | |
| 10 | Backend + BD (reescribe `services/` mock→API; **libro mayor único**: pagos de miembros/ventas/gastos como asientos del mismo origen — ver "Limitaciones conocidas") | pendiente | |

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

## Limitaciones conocidas (se resuelven en la Fase 10, NO son bugs)

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

## Cómo continuar

**Siguiente fase: 7 — Módulo `settings` (Ajustes, 6 secciones).**
1. Sub-secciones con el MISMO patrón de registro: un `settingsSections.js`
   (array), no condicionales — igual que `inventoryTabs.js` y `widgets.js`.
   Secciones del prototipo: Datos del gimnasio · Módulos · Cuentas y roles ·
   Planes y precios · Notificaciones · Respaldos y datos.
2. `services/settingsService.js` YA existe (apariencia + moduleFlags desde la
   fase 0) — la sección **Apariencia/Módulos** conecta con `ThemeProvider` y
   `ModulesProvider` (el toggle de módulos opcionales usa `toggleModule`).
   Ampliar el service para las demás secciones, no duplicarlo.
3. `services/plansService.js` y `usersService.js` alimentan Planes y Cuentas
   (el prototipo tiene modales Nuevo plan / Nuevo usuario — ver líneas ~1804
   y ~1888 del prototipo).
4. Al cerrar: actualizar este archivo y detenerse para revisión.

**Piezas que YA existen y hay que reutilizar (no reinventar):**
- `components/`: KpiCard, Badge, EmptyState, Avatar, Field, MoneyInput,
  SegmentedOptions, ProgressBar, Toggle, Modal, MonthNav, DatePicker, TimePicker.
- `hooks/`: `useModal` (cierre diferido), `usePopover`, `useSwapAnimation`.
- **Registros de sub-vistas** ya hechos como plantilla: `widgets.js` (Inicio)
  e `inventoryTabs.js` (Inventario) — copiar el patrón para `settingsSections.js`.
- Chrome de modal compartido `modules/inventory/components/InventoryModal.module.css`
  (si Ajustes necesita modales con la misma cabecera/pie, se puede promover a
  un componente común o replicar el patrón).

**Recordatorios de convenciones que ya costaron un bug:**
- Keyframes usados por CLASES van en el propio `.module.css` (CSS Modules
  hashea los nombres); los globales de `index.css` solo valen inline.
- Los modales van con portal a `document.body` (ya lo hace `<Modal>`): un
  ancestro con `transform` rompe `position: fixed`.
- Guardar los componentes de gráficos/derivados contra datos vacíos del
  primer render (el `Sparkline` tumbó la app por eso).
