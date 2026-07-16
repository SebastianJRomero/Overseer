# ARQUITECTURA — Reglas de código (OBLIGATORIAS)

Este documento define **cómo** se debe construir OVERSEER. No es una sugerencia: son las reglas que el
cliente pidió. Cualquier decisión que se aparte de aquí debe **consultarse antes**, no aplicarse por
iniciativa propia.

Objetivos rectores:
1. **Modularidad total.** Cada pieza se puede **agregar, quitar, reemplazar, ocultar y reutilizar**
   sin afectar a las demás.
2. **Legible para un junior.** El código enseña. Comentarios que explican el *por qué*.
3. **Sin librerías externas** salvo necesidad real y aprobada.
4. **Nada de componentes gigantes.**

---

## 1. Stack y convenciones

- **Vite + React**, **JavaScript (JSX)** — sin TypeScript.
- Componentes **funcionales** con hooks (`useState`, `useEffect`, `useMemo`, `useContext`).
- **CSS puro con CSS Modules**: cada componente tiene su `NombreComponente.module.css` al lado.
  Prohibido CSS-in-JS y frameworks de utilidades.
- Nombres de archivo: `PascalCase` para componentes (`MemberTable.jsx`), `camelCase` para utilidades
  (`formatMoney.js`), `kebab` no se usa.
- Un componente = un archivo = una responsabilidad.

---

## 2. Estructura de carpetas

```
src/
  main.jsx                 # punto de entrada Vite
  App.jsx                  # decide login vs shell; provee contextos
  index.css                # reset mínimo + import de theme.css

  app/
    AppShell.jsx           # layout: TopBar + área de módulo + Dock
    ModuleHost.jsx         # renderiza el módulo activo según el registry
    moduleRegistry.js      # ← FUENTE ÚNICA de módulos (ver §4)

  theme/
    theme.css              # TODAS las variables CSS (colores, radios, tipografía)
    accents.css            # temas de acento conmutables (coral/eléctrico/océano/púrpura)
    ThemeProvider.jsx      # aplica accent/density/roundness al <html data-*>

  components/              # UI reutilizable, SIN lógica de negocio
    Button/                #   Button.jsx + Button.module.css
    Modal/                 #   Modal.jsx (patrón de apertura/cierre diferido) + css
    Card/  Badge/  Chip/  Table/  Icon/  Field/  Toggle/  SegmentedControl/  ...

  modules/                 # un módulo = una carpeta autocontenida (ver §3 y §4)
    dashboard/  members/  calendar/  finance/  inventory/  settings/
    classes/  trainers/  reports/          # opcionales

  services/                # capa de datos REEMPLAZABLE (mock hoy, API mañana)
    membersService.js  plansService.js  movementsService.js  eventsService.js
    inventoryService.js  usersService.js  settingsService.js  authService.js

  hooks/                   # hooks reutilizables (useModal, useMembers, useTheme, ...)
  lib/                     # utilidades puras (fechas, dinero, festivos, validaciones)
  data/                    # datos semilla del prototipo (solo para el mock)
```

Regla de oro: **la UI reutilizable (`components/`) no sabe nada del gimnasio.** La lógica de negocio vive
en `modules/`, `services/`, `hooks/` y `lib/`.

---

## 3. Anatomía de un módulo (autocontenido)

Cada módulo es una carpeta que se puede borrar entera sin romper el resto. Ejemplo:

```
modules/members/
  index.js               # export { default as meta } y { default as Module }
  MembersModule.jsx      # componente contenedor del módulo (delgado)
  components/            # piezas SOLO de este módulo
    MemberTable.jsx      MemberRow.jsx      MemberCard.jsx
    MemberModal.jsx      MemberWizard.jsx   StatusChip.jsx
  useMembers.js          # estado/lógica del módulo (hook)
  members.module.css
```

- El contenedor (`MembersModule.jsx`) **orquesta**, no dibuja todo: compone piezas pequeñas.
- Toda dependencia de datos entra por `services/` (nunca `fetch` suelto dentro de un componente).
- Si el módulo se elimina de `moduleRegistry.js`, la app sigue compilando y funcionando.

---

## 4. Las 5 capacidades (agregar / quitar / reemplazar / ocultar / reutilizar)

Esto se logra con **un registro central de módulos** y un **contrato** común. No con `if/else` regados.

### `app/moduleRegistry.js` — fuente única de verdad
```js
// Cada módulo se auto-describe con un "meta". Agregar/quitar un módulo = editar SOLO este array.
import dashboard from '../modules/dashboard';
import members   from '../modules/members';
// ...
export const MODULES = [dashboard, members, calendar, finance, inventory, settings,
                        classes, trainers, reports];
```

Cada módulo exporta un **meta** con esta forma (contrato):
```js
// modules/members/index.js
export default {
  id: 'members',            // clave estable
  label: 'Miembros',
  icon: 'members',          // nombre de icono en <Icon/>
  core: true,               // true = núcleo (no se puede desactivar); false = opcional
  Component: MembersModule, // el componente a montar
};
```

Con eso:

- **AGREGAR** un módulo → crear su carpeta + añadir una línea en `moduleRegistry.js`. Nada más.
- **QUITAR** → borrar la carpeta + quitar la línea. La app compila igual.
- **REEMPLAZAR** → apuntar `Component` a otra implementación; el resto no se entera.
- **OCULTAR** → `moduleFlags[id] === false` (para opcionales) filtra el módulo de la navegación y del host,
  **sin borrar código**. Es exactamente el toggle de Ajustes → Módulos del prototipo.
- **REUTILIZAR** → el shell, `ModuleHost`, la navegación y los `components/` no cambian al variar la lista.

El **mismo patrón de registro** aplica dentro de módulos con sub-vistas:
- Ajustes: un `settingsSections.js` (array de sub-secciones) en vez de condicionales.
- Inventario: un `inventoryTabs.js` (productos/equipo/gas).
- Widgets de Inicio: un array de widgets, cada uno un componente montable/ocultable.

### Navegación derivada, no hardcodeada
`TopBar` y `Dock` se construyen **mapeando** `MODULES` (filtrando por `core || flag`). Nunca listas fijas
duplicadas. Así "ocultar" y "reordenar" son datos, no código.

---

## 5. Contrato de componente (para que nada afecte a lo demás)

- **Props explícitas y planas.** Un componente recibe lo que necesita; no lee estado global por su cuenta
  salvo contextos bien definidos (tema, sesión).
- **Sin efectos colaterales fuera de su alcance.** Un componente no muta datos de otro módulo.
- **Estado lo más local posible.** Sube estado solo cuando dos hermanos deben compartirlo. Estado
  verdaderamente global (sesión, tema, flags de módulos) va en contextos dedicados (`ThemeProvider`,
  `SessionProvider`, `ModulesProvider`).
- **Comunicación hacia arriba por callbacks** (`onSave`, `onClose`, `onSelect`), nunca tocando el padre.
- Componentes de `components/` son **tontos y reutilizables**: no importan nada de `modules/` ni de
  `services/`.

---

## 6. Tamaño de componentes — nada de gigantes

- **Límite guía: ~150 líneas** por componente (JSX). Si crece, **extraer** sub-componentes.
- Una tabla no es un archivo: `Table` (genérica) + `MemberRow` + `MemberCard` (móvil).
- Un modal complejo (wizard) se parte en pasos: `WizardStepPlan`, `WizardStepFechas`, `WizardStepResumen`.
- Si un `renderVals`/función del prototipo hace muchas cosas, **descomponer** en varias piezas + hooks +
  utilidades puras en `lib/`. El prototipo tiene un archivo enorme a propósito (es un prototipo);
  **la app NO debe reproducir ese monolito.**

---

## 7. Política de librerías externas (estricta)

Orden a seguir **siempre**:
1. ¿Se puede con la plataforma (JS/CSS/React) a mano? → hazlo a mano.
2. Si crees que hace falta una librería → **PÁRATE**. Escribe: qué problema, por qué no es viable a mano,
   qué librería, tamaño/mantenimiento, alternativa. **Pregunta y espera respuesta.** No instales nada.

Casos típicos y expectativa por defecto (implementación propia):
- **Calendario mensual** → grid propio (el prototipo ya lo resuelve con lógica de fechas nativa).
- **Iconos** → set de SVG propio en `components/Icon/` con un mapa `nombre → path`. Reutilizable y sin peso.
- **Gráfico de finanzas** → SVG/`<canvas>` simple hecho a mano; empezar mínimo.
- **Fechas** → `Date` nativo + utilidades en `lib/date.js`. Nada de moment/dayjs sin aprobación.
- **Formato de dinero** → `Intl.NumberFormat('es-CO')` en `lib/money.js`.
- **Estado** → `useState`/`useContext`. Nada de Redux/Zustand sin aprobación.
- **Router** → si se necesita, discutir React Router vs. un router mínimo propio; **preguntar primero**.

---

## 8. Estándar de comentarios (para juniors)

- Cada archivo empieza con un bloque corto: **qué es, qué recibe, qué hace**.
- Comentar el **por qué** de decisiones no obvias (reglas de negocio: vencimientos, festivos, presets de
  renovación, cierre diferido de modales).
- Nombres descriptivos > comentarios que narran lo obvio. No comentar `i++`.
- JSDoc breve en funciones de `lib/` y `services/` (params y return).
- Mantener comentarios en **español** (coherente con el dominio y el equipo).

Ejemplo de tono:
```js
// Un miembro "vence pronto" si su fecha de fin cae dentro de los próximos 7 días.
// Lo calculamos aquí (no en el componente) para que la misma regla se use en Inicio,
// en el chip de Miembros y en el filtro de KPIs — una sola fuente de verdad.
export function getMemberStatus(member, today = new Date()) { /* ... */ }
```

---

## 9. Capa de datos reemplazable

- Cada `service` expone funciones async (`listMembers()`, `saveMember()`, …) y **oculta el origen**.
- Hoy: implementación mock leyendo de `data/` + `localStorage`. Mañana: cambiar el interior del service a
  `fetch`/axios-a-mano **sin tocar** módulos ni componentes.
- Los componentes **nunca** llaman a la red directamente; usan hooks (`useMembers`) que usan services.

---

## 10. Definición de "hecho" para cada pieza

Una pieza está lista cuando:
- Vive en su carpeta, con su CSS Module y sus comentarios.
- Se puede borrar/ocultar sin romper la compilación ni otras piezas.
- No supera ~150 líneas (o está justificado).
- No introdujo librerías nuevas sin aprobación.
- Coincide visualmente con el prototipo (tokens de §6 del README).
