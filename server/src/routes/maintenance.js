/*
  routes/maintenance.js — Menú avanzado / secreto (Tramo C · frente 5).

  Endpoints destructivos de mantenimiento del sistema. En el FRONT solo los
  alcanza el Admin (o el superusuario) tras un atajo, y cada acción pide una
  palabra de confirmación; aquí el backend se limita a ejecutar.

    GET    /maintenance/export        → volcado completo de la BD { tabla: filas[] }
    POST   /maintenance/import        → restaura desde un volcado (body = el volcado)
    DELETE /maintenance/entity/:name  → borra los registros de una entidad
    POST   /maintenance/reset         → borra TODO y deja el sistema limpio (sin sembrar)

  Nota: importar o resetear marca la instalación como "ya sembrada" para que el
  siguiente arranque NO repueble los datos de demo (la semilla corre solo en la
  primera inicialización; ver seed.js).

  Espeja services/maintenanceService.js del front.
*/

import { Router } from 'express';
import { exportAll, importAll, clearAll, clearTables } from '../db.js';
import { markSeeded } from '../seed.js';

const router = Router();

/* Nombre amigable de entidad → tabla(s) que la componen. El inventario agrupa
   productos, equipos y gas (cilindros + usos, que caen por CASCADE). */
const ENTITY_TABLES = {
  miembros: ['members'],
  movimientos: ['movements'],
  eventos: ['events'],
  inventario: ['products', 'equipment', 'gas_cylinders', 'gas_usos'],
  planes: ['plans'],
  cuentas: ['users'],
  clases: ['classes'],
  entrenadores: ['trainers'],
};

/** Exporta la BD completa (respaldo). */
router.get('/export', (req, res) => res.json(exportAll()));

/** Importa un volcado. Acepta el volcado directo o envuelto en { db }. */
router.post('/import', (req, res) => {
  const bundle = req.body && req.body.db ? req.body.db : req.body;
  if (!bundle || typeof bundle !== 'object') {
    return res.status(400).json({ ok: false, error: 'Volcado inválido' });
  }
  importAll(bundle);
  markSeeded(); // un sistema restaurado no debe resembrarse en el arranque
  return res.json({ ok: true });
});

/** Borra los registros de una entidad (borrado selectivo). */
router.delete('/entity/:name', (req, res) => {
  const tables = ENTITY_TABLES[req.params.name];
  if (!tables) return res.status(400).json({ ok: false, error: 'Entidad desconocida' });
  clearTables(tables);
  return res.json({ ok: true });
});

/** Reset total: borra todo y deja el sistema limpio (sin demo ni usuarios de
    prueba). El acceso queda para el superusuario (vive fuera de la BD); las
    cuentas se crean desde Ajustes → Cuentas. La marca "seeded" se conserva para
    que el arranque no resembre. */
router.post('/reset', (req, res) => {
  clearAll();
  markSeeded();
  return res.json({ ok: true });
});

export default router;
