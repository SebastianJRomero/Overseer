# Guia de inicio — OVERSEER · Gym Manager

## Correr la app (2 procesos)

```bash
cd server && npm install && npm start      # API en http://localhost:3001
```
```bash
cd overseer && npm install && npm run dev  # front en http://localhost:5173
```

Login: **auth real con contraseña hasheada**. 
Cuentas semilla y sus claves de desarrollo:
- `admin@overseer.gym` / `admin123` (Admin)
- `recepcion@overseer.gym` / `recepcion123` (Recepción)
- `recepcion2@overseer.gym` / `recepcion123` (Recepción)
- `entrenador@overseer.gym` / `entrenador123` (Entrenador, viene inactivo)

Se puede entrar con el email o con el nombre.

Resetear la BD a semilla limpia: parar el backend y borrar `server/overseer.db*`
(`.db`, `.db-wal`, `.db-shm`); al volver a `npm start` se resiembra.
