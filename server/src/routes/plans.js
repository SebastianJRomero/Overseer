/*
  routes/plans.js — Endpoints del catálogo de planes.

  Espejan services/plansService.js:
    GET    /plans           → Plan[] (catálogo completo)   (listPlans)
    GET    /plans/active    → Plan[] (solo activos)         (listActivePlans)
    POST   /plans           → Plan[] (catálogo actualizado) (createPlan; nace activo)
    POST   /plans/:id/toggle→ Plan[] (activar/ocultar)      (togglePlan)
    DELETE /plans/:id       → Plan[] (catálogo actualizado) (deletePlan)

  Plan: { id, nombre, duracionDias, precio, activo(boolean) }
*/

import { Router } from 'express';
import { db, nextOrd } from '../db.js';
import { newId } from '../lib/id.js';

const router = Router();

/** Fila → Plan de dominio (activo como boolean). */
const toPlan = (r) => ({ id: r.id, nombre: r.nombre, duracionDias: r.duracionDias, precio: r.precio, activo: !!r.activo });

function listAll() {
  return db.prepare('SELECT * FROM plans ORDER BY ord ASC').all().map(toPlan);
}

router.get('/', (req, res) => res.json(listAll()));

router.get('/active', (req, res) => res.json(listAll().filter((p) => p.activo)));

router.post('/', (req, res) => {
  const { nombre, duracionDias, precio } = req.body || {};
  const record = {
    id: newId('p'), nombre, duracionDias: Number(duracionDias) || 0,
    precio: Number(precio) || 0, activo: 1,
  };
  db.prepare(`INSERT INTO plans (id, ord, nombre, duracionDias, precio, activo)
    VALUES (@id, @ord, @nombre, @duracionDias, @precio, @activo)`)
    .run({ ...record, ord: nextOrd('plans', 'end') });
  res.status(201).json(listAll());
});

router.post('/:id/toggle', (req, res) => {
  db.prepare('UPDATE plans SET activo = 1 - activo WHERE id = ?').run(req.params.id);
  res.json(listAll());
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM plans WHERE id = ?').run(req.params.id);
  res.json(listAll());
});

export default router;
