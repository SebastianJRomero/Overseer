/*
  routes/classes.js — Endpoints de clases grupales (módulo opcional).

  Espejan services/classesService.js:
    GET    /classes      → Class[]                     (listClasses)
    POST   /classes      → Class[] (le asigna color)   (createClass)
    PATCH  /classes/:id  → Class[] (conserva color)    (updateClass)
    DELETE /classes/:id  → Class[]                      (deleteClass)

  Class: { id, nombre, coach, dias, hora, inscritos, cupo, color, bg }
*/

import { Router } from 'express';
import { db, nextOrd } from '../db.js';
import { newId } from '../lib/id.js';

const router = Router();

/* Paleta categórica para las clases nuevas (rota por índice), igual que el mock. */
const PALETTE = [
  { color: '#7fb1f5', bg: '#16233a' },
  { color: '#7ee2a0', bg: '#1a2a22' },
  { color: '#c6a0f5', bg: '#221b2e' },
  { color: '#ffb35c', bg: '#2a2417' },
  { color: '#ff8b6e', bg: '#241722' },
];

const COLS = 'id, nombre, coach, dias, hora, inscritos, cupo, color, bg';

function listAll() {
  return db.prepare(`SELECT ${COLS} FROM classes ORDER BY ord ASC`).all();
}

router.get('/', (req, res) => res.json(listAll()));

router.post('/', (req, res) => {
  const { nombre, coach, dias, hora, inscritos, cupo } = req.body || {};
  const count = db.prepare('SELECT COUNT(*) AS n FROM classes').get().n;
  const pal = PALETTE[count % PALETTE.length];
  const record = {
    id: newId('cl'), nombre, coach, dias, hora,
    inscritos: Number(inscritos) || 0, cupo: Number(cupo) || 1, ...pal,
  };
  db.prepare(`INSERT INTO classes (id, ord, nombre, coach, dias, hora, inscritos, cupo, color, bg)
    VALUES (@id, @ord, @nombre, @coach, @dias, @hora, @inscritos, @cupo, @color, @bg)`)
    .run({ ...record, ord: nextOrd('classes', 'end') });
  res.status(201).json(listAll());
});

router.patch('/:id', (req, res) => {
  const patch = req.body || {};
  // Solo columnas conocidas; los números se normalizan (conserva el color).
  const clean = {
    ...patch,
    ...(patch.inscritos != null ? { inscritos: Number(patch.inscritos) || 0 } : {}),
    ...(patch.cupo != null ? { cupo: Number(patch.cupo) || 1 } : {}),
  };
  const allowed = ['nombre', 'coach', 'dias', 'hora', 'inscritos', 'cupo', 'color', 'bg'];
  const keys = Object.keys(clean).filter((k) => allowed.includes(k));
  if (keys.length) {
    const setSql = keys.map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE classes SET ${setSql} WHERE id = @id`).run({ ...clean, id: req.params.id });
  }
  res.json(listAll());
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM classes WHERE id = ?').run(req.params.id);
  res.json(listAll());
});

export default router;
