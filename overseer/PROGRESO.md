# PROGRESO — OVERSEER · Gym Manager

> Bitácora de avance por fases. Pensada para que **cualquier persona o
> sesión nueva pueda retomar el trabajo sin el chat original**.
> Se actualiza al cerrar cada fase (y si algo queda a medias).

## Referencias obligatorias

- Plan aprobado: `C:\Users\sebas\.claude\plans\vas-a-reconstruir-un-zippy-tulip.md` (análisis + inventario + fases).
- `../README.md` — qué es la app, pantallas, tokens, modelo de datos.
- `../ARQUITECTURA.md` — **reglas de código obligatorias** (leer antes de escribir código).
- `../prototipo/Gym Dashboard Final V1.dc.html` — fuente de verdad visual/interactiva (abrir en navegador para comparar).

## Estado de fases

| Fase | Contenido | Estado | Fecha |
|------|-----------|--------|-------|
| 0 | Andamiaje: Vite, theme, lib, componentes base, shell, registry con módulo dummy | **hecha — pendiente revisión del usuario** | 2026-07-16 |
| 1 | Login y sesión (SessionProvider, authService, celebración) | pendiente | |
| 2 | Módulo `members` (vertical de referencia: tabla, ficha, wizards, DatePicker) | pendiente | |
| 3 | Módulo `calendar` (grid, festivos, EventModal, TimePicker) | pendiente | |
| 4 | Módulo `finance` (movimientos, KPIs, modales, gráficos SVG) | pendiente | |
| 5 | Módulo `dashboard` (compone members+movements+events) | pendiente | |
| 6 | Módulo `inventory` (productos / equipo / gas) | pendiente | |
| 7 | Módulo `settings` (7 secciones, incl. Apariencia) | pendiente | |
| 8 | Módulos opcionales `classes` / `trainers` / `reports` | pendiente | |
| 9 | Cierre: auditoría de fidelidad vs prototipo | pendiente | |

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

## Cómo continuar

**Siguiente fase: 1 — Login y sesión.**
1. `services/authService.js` (login mock: usuario+contraseña no vacíos; `remember` → storage `auth`).
2. `context/SessionProvider.jsx` (authed, user, login/logout/switchUser).
3. `modules/… no — el login NO es módulo`: vive en `src/auth/LoginScreen.jsx` (+ css) y `App.jsx` decide `authed ? <AppShell/> : <LoginScreen/>`.
4. Celebración de éxito completa (flash, anillos, confeti, check SVG con `stroke`, saludo) y transición `appEnter`.
5. `UserMenu` en la TopBar (popover `menuIn`, cambiar usuario / cerrar sesión) + avatar con iniciales reales.
6. Actualizar este archivo y detenerse para revisión.
