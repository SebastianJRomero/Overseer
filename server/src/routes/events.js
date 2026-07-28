/*
  routes/events.js — Endpoints del calendario.

  Espejan services/eventsService.js:
    GET    /events                 → { dateKey: Evento[] }  (listEvents)
    PUT    /events                 → mapa (upsert; body {key, evento}) (saveEvent)
    DELETE /events/:key/:id        → mapa                    (deleteEvent)
    GET    /events/upcoming?n=     → Evento[] (con dateKey y ts) (getUpcoming)

  Evento: { id, title, time ("HH:mm" 24h), type }. En el mapa se agrupan por
  día (aaaa-mm-dd) SIN el campo dateKey (igual que el mock).

  Nota: addFromMovement vive en el front (arma el título con formatMoney) y
  llama a PUT /events con el id del movimiento; por eso saveEvent hace UPSERT
  por id (si no existe, lo inserta con ese mismo id).
*/

import { Router } from 'express';
import { db, nextOrd } from '../db.js';
import { newId } from '../lib/id.js';

const router = Router();

/** Reconstruye el mapa { dateKey: [{id,title,time,type}] } en orden de inserción. */
function buildMap() {
  const rows = db.prepare('SELECT id, dateKey, title, time, type FROM events ORDER BY ord ASC').all();
  const map = {};
  for (const r of rows) {
    (map[r.dateKey] ||= []).push({ id: r.id, title: r.title, time: r.time, type: r.type });
  }
  return map;
}

router.get('/', (req, res) => res.json(buildMap()));

router.put('/', (req, res) => {
  const { key, evento } = req.body || {};
  if (!key || !evento) return res.status(400).json({ error: 'faltan key/evento' });
  const base = { dateKey: key, title: evento.title ?? '', time: evento.time ?? '', type: evento.type ?? '' };
  if (evento.id != null) {
    const exists = db.prepare('SELECT id FROM events WHERE id = ?').get(evento.id);
    if (exists) {
      db.prepare('UPDATE events SET dateKey=@dateKey, title=@title, time=@time, type=@type WHERE id=@id')
        .run({ ...base, id: evento.id });
    } else {
      db.prepare('INSERT INTO events (id, ord, dateKey, title, time, type) VALUES (@id, @ord, @dateKey, @title, @time, @type)')
        .run({ ...base, id: evento.id, ord: nextOrd('events', 'end') });
    }
  } else {
    db.prepare('INSERT INTO events (id, ord, dateKey, title, time, type) VALUES (@id, @ord, @dateKey, @title, @time, @type)')
      .run({ ...base, id: newId('ev'), ord: nextOrd('events', 'end') });
  }
  return res.json(buildMap());
});

router.delete('/:key/:id', (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ? AND dateKey = ?').run(req.params.id, req.params.key);
  res.json(buildMap());
});

router.get('/upcoming', (req, res) => {
  const n = Number(req.query.n) || 4;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const rows = db.prepare('SELECT id, dateKey, title, time, type FROM events').all();
  const list = rows
    .map((e) => {
      const [Y, M, D] = e.dateKey.split('-').map(Number);
      const [h, min] = (e.time || '00:00').split(':').map(Number);
      return { ...e, ts: new Date(Y, M - 1, D, h, min).getTime() };
    })
    .filter((e) => e.ts >= today.getTime())
    .sort((a, b) => a.ts - b.ts)
    .slice(0, n);
  res.json(list);
});

export default router;
