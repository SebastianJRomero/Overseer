# HANDOFF — OVERSEER · Gym Manager

Guía corta para **retomar el desarrollo en otro PC / sesión nueva** (con la
misma cuenta). El detalle por fases está en `overseer/PROGRESO.md`; las reglas
de código en `ARQUITECTURA.md`. Este archivo es solo el arranque rápido.

## Qué es

Migración del prototipo (un HTML gigante en `prototipo/`) a una app real:
- **`overseer/`** — frontend Vite + React (JS, sin TypeScript, sin router, sin
  librerías externas fuera del stack).
- **`server/`** — backend Node + Express + SQLite (`better-sqlite3`).

La fuente de verdad es **este repo git** (`SebastianJRomero/Overseer` en GitHub).
La base de datos `server/overseer.db` está en `.gitignore` y **se regenera sola**
desde el seed al arrancar el backend — no hay que copiarla.

## Correr la app (2 procesos)

```bash
cd server && npm install && npm start      # API en http://localhost:3001
```
```bash
cd overseer && npm install && npm run dev  # front en http://localhost:5173
```

Login: cualquier usuario/contraseña no vacíos entra. Para probar roles reales,
entrar con una cuenta semilla: `admin@overseer.gym` (Admin),
`recepcion@overseer.gym` (Recepción). La contraseña no se valida (no se guarda).

Resetear la BD a semilla limpia: parar el backend y borrar `server/overseer.db*`
(`.db`, `.db-wal`, `.db-shm`); al volver a `npm start` se resiembra.

Verificaciones antes de dar algo por hecho: `cd overseer && npm run lint` y
`npm run build` (deben quedar limpios salvo 3 warnings preexistentes de
fast-refresh).

## Estado (2026-07-30)

- **Fases 0–9** (frontend completo) y **Fase 11** (reskin claro/oscuro): mergeadas a `main`.
- **Fase 10 · Tramo A** (backend + `services/` a `fetch`, paridad): mergeada (PR #12).
- **Fase 10 · Tramo B** (backend real): **hecho, en revisión.**
  - **Frente 1** (libro mayor único) ya está en `main` (PR #14).
  - **Frentes 2–4 + refinamientos** (sync Planes, auth con rol, cuentas Admin +
    permisos por usuario, y ajustes de UI) están en la rama `fase-10-tramo-b`,
    **PR #15 abierto** hacia `main` (⚠ falta mergearlo).
- **Fase 10 · Tramo C** (pendiente): frente 5 **menú avanzado/secreto**
  (import config, borrado selectivo, reset total, con confirmación fuerte) +
  **enforcement de permisos** (hoy `users.permisos` se guarda/edita pero la
  navegación NO se restringe; falta que la sesión traiga los permisos y que
  `moduleRegistry`/TopBar/ModuleHost filtren módulos según ellos).

## Cómo retomar en una sesión nueva

1. Instalar Claude Code, iniciar sesión con la misma cuenta Anthropic.
2. Clonar y preparar: `git clone …/Overseer`, `npm install` en `server/` y `overseer/`.
3. **Mergear el PR #15** (para que `main` tenga todo el Tramo B).
4. Sincronizar `main`, crear la rama del Tramo C: `git checkout -b fase-10-tramo-c`.
5. Correr los 2 procesos y pegar en el chat:

   > Lee `overseer/PROGRESO.md` y `ARQUITECTURA.md`, y continúa con la Fase 10 ·
   > Tramo C (frente 5 menú avanzado + enforcement de permisos), avanzando frente
   > por frente y parando para mi revisión.

**Nota sobre continuidad:** el historial de chat y la auto-memoria de Claude Code
se guardan **localmente** en cada máquina (`~/.claude/…`), no se sincronizan solos.
No hacen falta para continuar: `PROGRESO.md` (en el repo) carga todo el estado.
Si quieres llevar la memoria igual, copia `~/.claude/projects/<este-proyecto>/memory/`.

## Reglas que no se negocian (ver ARQUITECTURA.md)

Modularidad total; sin librerías externas fuera del stack (Node+Express+SQLite);
sin router; solo desktop; colores solo por tokens; comentarios en español para
juniors; ~150 líneas máx. por componente; se reescribe el interior de `services/`
+ endpoints manteniendo firmas (§9) — si un contrato debe cambiar, parar y
consultar. Commits/PRs **sin pies de IA**. Avanzar fase por fase, parando para
revisión del usuario antes de commitear.
