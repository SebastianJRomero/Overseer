# OVERSEER · Backend (Fase 10)

API del gimnasio en **Node + Express + SQLite** (decisión #9). Reemplaza el
mock de `localStorage` del front: reescribimos SOLO el interior de
`overseer/src/services/*` para que hagan `fetch` a esta API; módulos, hooks y
componentes del front NO cambian (ARQUITECTURA §9).

## Cómo correr

Requisitos: Node 18+ (probado en Node 22).

```bash
cd server
npm install        # instala express + better-sqlite3 (binario precompilado)
npm start          # arranca en http://localhost:3001  (o: npm run dev con --watch)
```

Luego, en otra terminal, el front:

```bash
cd overseer
npm run dev        # Vite en http://localhost:5173
```

El front apunta por defecto a `http://localhost:3001`. Para cambiarlo, define
`VITE_API_URL` (p. ej. en `overseer/.env`).

## Base de datos

- Archivo local `server/overseer.db` (SQLite). Se crea y **siembra** solo al
  arrancar si está vacío, con las mismas semillas del prototipo (fechas
  relativas a hoy, igual que el mock). No se versiona (ver `.gitignore`).
- **Reset total:** borra `overseer.db*` y reinicia el servidor → resiembra.

## Estructura

```
server/src/
  index.js            arranca Express, CORS a mano, monta routers bajo /api
  db.js               conexión SQLite + esquema (migrate) + helper de orden
  seed.js             siembra inicial (espeja overseer/src/data/)
  finance.js          generador demo determinista + agregados de Finanzas
  lib/                date.js · id.js · seededRandom.js  (portados del front)
  routes/             un router por entidad, espejando services/ del front
    members · movements · events · inventory · plans · users · settings
    classes · trainers
```

## Endpoints (bajo `/api`)

Cada endpoint devuelve **exactamente** la forma que espera el service del front
que lo consume (misma firma y forma de retorno que el mock). Ver la cabecera
de cada archivo en `routes/` para el detalle.

- `members` · `movements` (mes/día/historial/desgloses) · `events` (+upcoming)
- `inventory/products` (+apply-sale) · `inventory/equipment` · `inventory/gas`
- `plans` (+active) · `users` · `settings/{gym,notifications,backup}`
- `classes` · `trainers` · `health`

## Notas de la Fase 10 (Tramo A)

- **Paridad total:** la app se comporta igual que con el mock. Los movimientos
  de demo se siguen generando (deterministas por mes) para no cambiar lo que se
  ve; desaparecerán en el Tramo B, cuando exista el libro mayor real.
- **Se queda en el front (no en el backend):** apariencia/tema y flags de
  módulos (localStorage, decisión #2, se leen al arrancar); `authService` y
  `reportsService` (login y reportes reales son Tramo B); `GYM_FIELDS` y
  `ROLE_LEGEND` (constantes estáticas de UI).
- **CORS a mano** (sin dependencia extra) para respetar la política de no sumar
  librerías fuera del stack acordado.
