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
import { join } from 'node:path';
import { migrate } from './db.js';
import { seedAll, isSeeded } from './seed.js';

import authRouter, { requireAuth } from './routes/auth.js';
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

const HOST = process.env.HOST || '127.0.0.1';
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
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Permite preflight de "Private Network Access" (localhost → IP privada) si
  // algún día el front y la API viven en hosts distintos.
  res.header('Access-Control-Allow-Private-Network', 'true');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
// Todo lo demás bajo /api exige sesión (Authorization: Bearer <token>).
app.use('/api/members', requireAuth, membersRouter);
app.use('/api/movements', requireAuth, movementsRouter);
app.use('/api/events', requireAuth, eventsRouter);
app.use('/api/inventory', requireAuth, inventoryRouter);
app.use('/api/plans', requireAuth, plansRouter);
app.use('/api/users', requireAuth, usersRouter);
app.use('/api/settings', requireAuth, settingsRouter);
app.use('/api/classes', requireAuth, classesRouter);
app.use('/api/trainers', requireAuth, trainersRouter);
app.use('/api/maintenance', requireAuth, maintenanceRouter);

// En la app de escritorio (Electron) el front compilado vive en
// OVERSEER_STATIC_DIR y lo servimos junto a la API (ruta relativa /api del
// front = mismo origen). En dev (Vite) esto no se usa y todo queda igual.
const staticDir = process.env.OVERSEER_STATIC_DIR;
if (staticDir) {
  app.use(express.static(staticDir));
  // SPA: cualquier ruta que no sea API cae al index (la app es de una página).
  app.get('*', (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    return res.sendFile(join(staticDir, 'index.html'));
  });
}

// Manejador de errores: cualquier throw en una ruta responde 500 con el mensaje.
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Se exporta el server para que Electron pueda arrancarlo embebido y conocer
// el puerto real (ver desktop/main.cjs). Como entrada normal (node src/index.js)
// el export no estorba.
export const server = app.listen(PORT, HOST, () => {
  console.log(`OVERSEER API escuchando en http://${HOST}:${PORT}`);
});
