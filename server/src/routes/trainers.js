/*
  routes/trainers.js — Endpoints de entrenadores (módulo opcional).

  Espejan services/trainersService.js:
    GET    /trainers      → Trainer[]                   (listTrainers)
    POST   /trainers      → Trainer[] (nace disponible) (createTrainer)
    PATCH  /trainers/:id  → Trainer[]                    (updateTrainer)
    DELETE /trainers/:id  → Trainer[]                    (deleteTrainer)

  Trainer: { id, nombre, esp, clientes, clases, activo(boolean) }
*/

import { Router } from 'express';
import { db, nextOrd } from '../db.js';
import { newId } from '../lib/id.js';

const router = Router();

const toTrainer = (r) => ({ id: r.id, nombre: r.nombre, esp: r.esp, clientes: r.clientes, clases: r.clases, activo: !!r.activo });

function listAll() {
  return db.prepare('SELECT * FROM trainers ORDER BY ord ASC').all().map(toTrainer);
}

router.get('/', (req, res) => res.json(listAll()));

router.post('/', (req, res) => {
  const { nombre, esp, clientes, clases } = req.body || {};
  const record = {
    id: newId('tr'), nombre, esp,
    clientes: Number(clientes) || 0, clases: Number(clases) || 0, activo: 1,
  };
  db.prepare(`INSERT INTO trainers (id, ord, nombre, esp, clientes, clases, activo)
    VALUES (@id, @ord, @nombre, @esp, @clientes, @clases, @activo)`)
    .run({ ...record, ord: nextOrd('trainers', 'end') });
  res.status(201).json(listAll());
});

router.patch('/:id', (req, res) => {
  const patch = req.body || {};
  const clean = {
    ...patch,
    ...(patch.clientes != null ? { clientes: Number(patch.clientes) || 0 } : {}),
    ...(patch.clases != null ? { clases: Number(patch.clases) || 0 } : {}),
    ...(patch.activo != null ? { activo: patch.activo ? 1 : 0 } : {}),
  };
  const allowed = ['nombre', 'esp', 'clientes', 'clases', 'activo'];
  const keys = Object.keys(clean).filter((k) => allowed.includes(k));
  if (keys.length) {
    const setSql = keys.map((k) => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE trainers SET ${setSql} WHERE id = @id`).run({ ...clean, id: req.params.id });
  }
  res.json(listAll());
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM trainers WHERE id = ?').run(req.params.id);
  res.json(listAll());
});

export default router;
