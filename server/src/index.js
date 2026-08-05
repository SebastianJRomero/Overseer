/*
  index.js — Arranque del backend de OVERSEER (Node + Express + SQLite).

  - Crea/migra la BD y la siembra si está vacía (mismas semillas del mock).
  - CORS resuelto A MANO (sin dependencia extra: respeta la política de no
    sumar librerías fuera del stack acordado) para que el front en Vite
    (localhost:5173) pueda hablar con la API (localhost:3001).
  - Monta un router por entidad bajo /api, espejando services/ del front.

  Correr:  npm start   (o  npm run dev  para recarga con --watch)
*/

import express from 'express';
import { migrate } from './db.js';
import { seedAll, isSeeded } from './seed.js';

import authRouter from './routes/auth.js';
import membersRouter from './routes/members.js';
import movementsRouter from './routes/movements.js';
import eventsRouter from './routes/events.js';
import inventoryRouter from './routes/inventory.js';
import plansRouter from './routes/plans.js';
import usersRouter from './routes/users.js';
import settingsRouter from './routes/settings.js';
import classesRouter from './routes/classes.js';
import trainersRouter from './routes/trainers.js';
import maintenanceRouter from './routes/maintenance.js';

const PORT = process.env.PORT || 3001;

migrate();
// La semilla corre solo la primera vez: si el usuario vacía/resetea datos
// (menú de mantenimiento), el arranque no debe volver a sembrar la demo.
if (!isSeeded()) seedAll();

const app = express();
app.use(express.json({ limit: '8mb' }));

// CORS mínimo a mano (dev: el front vive en otro puerto).
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  // Permite preflight de "Private Network Access" (localhost → IP privada) si
  // algún día el front y la API viven en hosts distintos.
  res.header('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/members', membersRouter);
app.use('/api/movements', movementsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/plans', plansRouter);
app.use('/api/users', usersRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/classes', classesRouter);
app.use('/api/trainers', trainersRouter);
app.use('/api/maintenance', maintenanceRouter);

// Manejador de errores: cualquier throw en una ruta responde 500 con el mensaje.
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`OVERSEER API escuchando en http://localhost:${PORT}`);
});
