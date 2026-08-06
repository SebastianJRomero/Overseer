# AGENTS.md — Guía operativa para agentes de IA (OpenCode / Claude / etc.)

Este archivo lo lee automáticamente OpenCode (y agentes compatibles) al abrir el
repo. Su objetivo: que cualquier agente **conserve el diseño y la funcionalidad**
ya construidos y **no reintroduzca regresiones** conocidas.

> **Fuente vinculante de reglas de código:** [`ARQUITECTURA.md`](ARQUITECTURA.md).
> Este documento **no la reemplaza**: la resume y añade *flujo de trabajo* y
> *trampas reales del proyecto*. Ante cualquier duda, gana `ARQUITECTURA.md`.

---

## 0. Regla de oro

**No apliques cambios de arquitectura, librerías o diseño "por iniciativa
propia". Si algo se aparta de `ARQUITECTURA.md`, PREGUNTA antes.** El proyecto
prioriza: modularidad total · legible para un junior · **sin librerías externas
salvo aprobación** · nada de componentes gigantes (~150 líneas guía).

---

## 1. Mapa del repo (monorepo de 3 partes)

| Carpeta | Qué es | Cómo se ejecuta |
|---|---|---|
| `overseer/` | Frontend **Vite + React (JSX)**, CSS Modules | `npm run dev` (Vite :5173) |
| `server/`   | Backend **Node + Express + SQLite** | `npm start` → `node src/index.js` (:3001) |
| `desktop/`  | **Electron**: front compilado + server embebido + auto-updater | `npm run build` / `npm run dist` |

- Base de datos local: `server/overseer.db` (SQLite, **persistente** — no se
  resiembra en cada arranque).
- La app de escritorio compila `overseer/` → copia a `desktop/web/` y empaqueta
  con `electron-builder` (ver `desktop/scripts/build.mjs`).

---

## 2. Flujo de trabajo para cada cambio

1. **Levantar en desarrollo antes de tocar** (para tener un baseline):
   - Backend: en `server/` → `npm start` (queda en `http://127.0.0.1:3001`).
   - Frontend: en `overseer/` → `npm run dev` (queda en `http://localhost:5173`).
   - Login de prueba local: `admin@overseer.gym` / `admin123` (⚠️ si la BD real
     ya tiene contraseña cambiada, **no la adivines**: pídela o usa una BD limpia).
2. **Hacer el cambio más pequeño posible**, dentro del módulo que corresponde.
3. **Verificar en el navegador** (consola sin errores, la vista afectada se ve
   igual o mejor, nada descuadrado).
4. **Si el cambio puede afectar la app de escritorio** (iconos, fuentes, rutas,
   assets, red), **verificar también en Electron** — ver §4, es donde más se
   rompen cosas que en la web se ven bien.
5. No commitear ni publicar release salvo que se pida explícitamente.

**Comandos rápidos:**
```bash
# dev
cd server   && npm start          # API :3001
cd overseer && npm run dev        # web :5173

# build escritorio (sin publicar)
cd desktop  && npm run dist       # front + server + electron-builder → desktop/release
```

---

## 3. Diseño: cómo mantener la coherencia visual

- **Todos los colores/medidas salen de tokens CSS** en `overseer/src/theme/theme.css`
  y `accents.css`. Usa `var(--ok)`, `var(--danger)`, `var(--surface-1)`,
  `var(--r-card)`, `var(--font-sans)`, etc. **Nunca hardcodees hex** ni px de
  color sueltos.
- **CSS Modules por componente** (`Componente.module.css` al lado). Prohibido
  CSS-in-JS y frameworks de utilidades (Tailwind, etc.).
- El resultado debe **coincidir con el prototipo** (`prototipo/`). Ante duda de
  cómo debe verse algo, míralo ahí antes de improvisar.
- Animaciones/numeros animados ya tienen componentes propios (`AnimatedNumber`,
  `useSwapAnimation`). Reutilízalos; no inventes otros.

---

## 4. ⚠️ Iconos y fuentes — la trampa nº1 de Electron (LEER)

**Estado actual del sistema de iconos:** `overseer/src/components/Icon/Icon.jsx`
es un **mapa `nombre → glifo Unicode`** (p. ej. `up: '↗'`, `down: '↘'`,
`gem: '◆'`, `history: '↺'`), NO SVG todavía. Los consumidores piden
`<Icon name="up" />` y nunca escriben el carácter. El plan documentado (README §8
/ el propio comentario de `Icon.jsx`) es **migrar a SVG reales cambiando SOLO ese
archivo** — hacerlo eliminaría de raíz el problema de abajo.

**El bug real de Electron (causa raíz):** varios iconos son glifos Unicode con
presentación potencialmente *emoji* — sobre todo las flechas `↗` (U+2197) y `↘`
(U+2198). La fuente de la app (`Archivo`) **no los contiene**, así que el
navegador/Electron los resuelve por *fallback*. En el navegador Windows caen a una
fuente de texto y se ven bien; en la **release de Electron** el runtime cae a la
**fuente de emoji** y los pinta a **color y con otro tamaño**, desbordando el chip
y **descuadrando la fila de KPIs**. **No es codificación** (los bytes UTF-8 son
correctos en todo el pipeline; cambiarlos a `\uXXXX` NO arregla nada): es
*resolución de fuente*.

**Cómo está arreglado (mantenerlo):** en `theme/theme.css` el stack de fuentes
incluye `'Segoe UI Symbol'` —una fuente de TEXTO que sí trae esos símbolos— en
`--font-sans` y `--font-mono`. Eso fuerza a que los glifos se dibujen como texto
monocromo en Electron. **No quites `'Segoe UI Symbol'` de esos tokens.**

**Reglas para iconos de aquí en adelante:**
- Prefiere `<Icon name="…" />` en vez de meter glifos crudos en el JSX (Finanzas
  los metía a mano — anti-patrón; ver §7 de ARQUITECTURA).
- ¿Icono nuevo? Añade su glifo al mapa de `Icon.jsx`, y verifica que
  `'Segoe UI Symbol'` lo dibuje como texto (evita glifos con emoji forzado).
- Si el diseño exige un glifo de texto concreto y quieres blindarlo, añádele el
  selector de variación de texto (`'↗︎'` = `'↗︎'`) además del stack de fuente.
- La solución definitiva y más limpia sigue siendo **migrar `Icon.jsx` a SVG**
  (fill `currentColor`, `width/height` = `size`), cambiando solo ese archivo.

**Fuentes:** `Archivo` y `Geist Mono` se cargan por `<link>` desde Google Fonts
(ver `overseer/index.html`). La app de escritorio corre **offline**, así que si no
hay red esas fuentes no cargan y todo cae a fuentes del sistema. Si tocas
tipografía, ten presente el caso offline (idealmente auto-hospedar las fuentes con
`@font-face` local antes de depender de ellas en escritorio).

---

## 5. Codificación de archivos

- Guarda **siempre en UTF-8** (sin BOM). No dejes que el editor reconvierta a
  cp1252/latin-1: corrompe acentos y símbolos (`é → Ã©`, `↗ → â†—`).
- Respeta el fin de línea existente del archivo (no conviertas masivamente
  CRLF↔LF; genera *diffs* de ruido).

---

## 6. Datos y lógica (no romper la modularidad)

- Un **componente no hace `fetch` suelto**. Los datos entran por `services/`
  (mock hoy, API mañana) a través de hooks (`useFinance`, `useMembers`…).
- Un módulo (`modules/<x>/`) debe poder **borrarse u ocultarse** sin romper la
  compilación. Agregar/quitar módulo = editar solo `app/moduleRegistry.js`.
- Formato de dinero → `lib/money.js` (`Intl.NumberFormat('es-CO')`). Fechas →
  `lib/date.js` (`Date` nativo). No metas `moment`, `dayjs`, `lodash`, etc.
- Comentarios **en español**, explicando el *por qué* de reglas de negocio.

---

## 7. Definición de "hecho" (checklist antes de cerrar un cambio)

- [ ] Vive en su carpeta con su CSS Module; usa tokens del tema (sin hex sueltos).
- [ ] No supera ~150 líneas (o está justificado); sin componentes gigantes.
- [ ] No introdujo librerías nuevas sin aprobación explícita.
- [ ] Iconos vía `components/Icon/` (SVG), **no** glyphs Unicode crudos.
- [ ] Verificado en la **web** (consola limpia) y, si aplica, en la **release de
      Electron** (§4).
- [ ] Coincide con el prototipo; se puede borrar/ocultar sin romper el resto.
- [ ] Archivos en UTF-8; sin diffs de ruido por fin de línea.

---

## 8. Bitácora de trampas conocidas (ampliar cuando aparezcan)

| Síntoma | Causa | Solución |
|---|---|---|
| Iconos de KPI (flechas `↗ ↘`) se ven emoji a color **solo** en el `.exe` | `Archivo` no trae esos glifos → Electron cae a la fuente de emoji | **✅ HECHO:** `'Segoe UI Symbol'` añadido a `--font-sans`/`--font-mono` en `theme.css`. No quitarlo. |
| Texto con otra tipografía en escritorio | Fuentes cargadas desde Google Fonts CDN, app offline | Pendiente: auto-hospedar `Archivo`/`Geist Mono` con `@font-face` local |
| Iconos/elementos de cabecera pegados a la izquierda (no llegan a la esquina derecha) **solo** en Electron | Un `<button>` usado como contenedor flex NO estira sus hijos al ancho completo en el Chromium de Electron; `justify-content: space-between` se queda sin espacio | En la fila: `width: 100%` + en el elemento derecho `margin-left: auto; flex-shrink: 0` (ver `FinanceKpis.module.css`) |
| Modales aparecen muy abajo / obligan a scroll en pantallas 768p | `.overlay` usa offset superior fijo (`padding-top: 118px`, `align-items: flex-start`) | `@media (max-height: 860px)` centra el modal y le da más altura (ver `Modal.module.css`) |
| Acentos/símbolos corruptos tras editar | Reguardado en codificación ≠ UTF-8 | Guardar siempre UTF-8; revisar antes de commitear |
