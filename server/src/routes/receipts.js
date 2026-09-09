/*
  routes/receipts.js — Recibo digital: consecutivo global único + validación.

  Consecutivo GLOBAL (altas + renovaciones comparten la serie, nunca se
  reutiliza). Se guarda en settings `receipts = { enabled, prefix, next }`.
  `next` null = sin inicializar: se calcula como max(números RC-XXXX en
  members) + 1 al primer uso, dentro de transacción.

  Endpoints (todos exigen sesión, igual que el resto de /api):
    GET  /receipts/next      → { numero } (previsualiza sin consumir)
    POST /receipts/issue     → { numero, codigo } (consume uno; body { memberId? })
    GET  /receipts/:numero   → datos mínimos para validar el QR

  El `codigo` es un verificador corto (no secreto criptográfico): evita que
  un consecutivo inventado pase como válido sin conocer la fórmula.
*/

import { Router } from 'express';
import { db } from '../db.js';
import { readSetting, writeSetting, getReceiptsConfig } from './settings.js';

const router = Router();

const DEFAULT_RECEIPTS = { enabled: false, prefix: 'RC', next: null, autoDownload: false, receiptsDir: '' };

/** Extrae el número de un recibo "RC-1056" → 1056 (null si no calza). */
function parseNumero(recibo, prefix) {
  const m = String(recibo || '').trim().match(new RegExp(`^${prefix}-(\\d{1,6})$`, 'i'));
  return m ? Number(m[1]) : null;
}

/** Máximo consecutivo usado en members (0 si no hay ninguno). */
function maxUsado(prefix) {
  let max = 0;
  const rows = db.prepare('SELECT recibo FROM members').all();
  for (const r of rows) {
    const n = parseNumero(r.recibo, prefix);
    if (n != null && n > max) max = n;
  }
  return max;
}

/**
 * Reserva el siguiente número SIN consumirlo (para previsualizar).
 * Si `next` está sin inicializar, parte de max(usados)+1.
 */
function peekNext() {
  const cfg = getReceiptsConfig();
  if (cfg.next != null) return { numero: `${cfg.prefix}-${String(cfg.next).padStart(4, '0')}`, next: cfg.next };
  const next = maxUsado(cfg.prefix) + 1;
  return { numero: `${cfg.prefix}-${String(next).padStart(4, '0')}`, next };
}

/** Código verificador corto de un recibo (6 chars base36, determinista). */
export function codigoFor(numero, memberId = '') {
  const s = `${numero}|${memberId}|overseer-recibo`;
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(36).toUpperCase().padStart(6, '0').slice(-6);
}

router.get('/next', (req, res) => {
  res.json({ numero: peekNext().numero });
});

/**
 * Consume un número del consecutivo (transacción: lee, asigna al miembro si
 * viene memberId, y avanza `next`). Si el recibo digital está apagado,
 * responde 409 para que el front use el flujo manual.
 */
router.post('/issue', (req, res) => {
  const cfg = getReceiptsConfig();
  if (!cfg.enabled) return res.status(409).json({ error: 'Recibo digital desactivado' });
  const { memberId } = req.body || {};

  const run = db.transaction(() => {
    const cur = readSetting('receipts', DEFAULT_RECEIPTS);
    const base = cur.next != null ? cur.next : maxUsado(cur.prefix) + 1;
    const numero = `${cur.prefix}-${String(base).padStart(4, '0')}`;
    writeSetting('receipts', { ...cur, next: base + 1 });
    if (memberId) {
      db.prepare('UPDATE members SET recibo = @recibo WHERE id = @id').run({ recibo: numero, id: memberId });
    }
    return numero;
  });

  const numero = run();
  res.status(201).json({ numero, codigo: codigoFor(numero, memberId || '') });
});

/** Datos mínimos para validar un recibo desde el QR (sin datos sensibles). */
router.get('/:numero', (req, res) => {
  const numero = String(req.params.numero || '').trim().toUpperCase();
  const m = db.prepare('SELECT id, nombre, tipo, valor, inicio, fin, medio_pago FROM members WHERE UPPER(recibo) = ?').get(numero);
  if (!m) return res.status(404).json({ error: 'Recibo no encontrado' });
  const primero = String(m.nombre || '').split(' ')[0] || '';
  res.json({
    numero,
    nombre: primero ? `${primero} ${String(m.nombre).slice(primero.length).trim().charAt(0) || ''}`.trim() : '—',
    plan: m.tipo, valor: m.valor, inicio: m.inicio, fin: m.fin,
    medio_pago: m.medio_pago === 'nequi' ? 'nequi' : 'efectivo',
    codigo: codigoFor(numero, m.id),
  });
});

export default router;
