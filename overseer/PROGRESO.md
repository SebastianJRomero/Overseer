# PROGRESO — OVERSEER · Gym Manager

> Bitácora de avance por fases. Pensada para que **cualquier persona o
> sesión nueva pueda retomar el trabajo sin el chat original**.
> Se actualiza al cerrar cada fase (y si algo queda a medias).

## Referencias obligatorias

- `../README.md` — qué es la app, pantallas, tokens, modelo de datos.
- `../ARQUITECTURA.md` — **reglas de código obligatorias** (leer antes de escribir código).
- `../prototipo/Gym Dashboard Final V1.dc.html` — fuente de verdad visual/interactiva (abrir en navegador para comparar).

## Estado de fases

| Fase | Contenido | Estado | Fecha |
|------|-----------|--------|-------|
| 0 | Andamiaje: Vite, theme, lib, componentes base, shell, registry con módulo dummy | revisada y mergeada (PR #1) | 2026-07-16 |
| 1 | Login y sesión (SessionProvider, authService, celebración) | revisada y mergeada (PR #2) | 2026-07-16 |
| 2 | Módulo `members` (vertical de referencia: tabla, ficha, wizards, DatePicker) | hecha + correcciones round 2 — pendiente revisión del usuario | 2026-07-17 |
| 3 | Módulo `calendar` (grid, festivos, EventModal, TimePicker) | pendiente | |
| 4 | Módulo `finance` (movimientos, KPIs, modales, gráficos SVG) | pendiente | |
| 5 | Módulo `dashboard` (compone members+movements+events) | pendiente | |
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

## Cómo continuar

**Siguiente fase: 3 — Módulo `calendar`.**
1. `services/eventsService.js` (eventos por dateKey `aaaa-mm-dd`, semilla
   relativa a hoy como el prototipo) + `lib/holidays.js` ya existe (fijos CO).
2. `components/TimePicker/` (popover horas/minutos/AM-PM, reutiliza usePopover).
3. `modules/calendar/`: toolbar mes ‹ › + Hoy (acento si es el mes actual),
   grid lunes-first con celdas de alto fijo, findes/festivos en lavanda
   (--holiday-*), anillo de acento en hoy, máx 3 eventos + "+n más",
   leyenda de tipos; EventModal (título, TimePicker, tipo segmentado,
   guardar/eliminar, cierre diferido).
4. Tipos de evento: Reserva (info), Clase (ok), Tarea (warn), Nota (danger)
   (+ Cobro/Pago llegan con Finanzas).
5. Actualizar este archivo y detenerse para revisión.
