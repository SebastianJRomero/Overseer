/*
  ReceiptModal — Comprobante digital al final del alta/renovación (modal 560px).

  Solo se monta cuando el recibo digital está ACTIVO en Ajustes (el módulo
  decide). Muestra miembro, plan, valor, medio de pago y el consecutivo
  generado por el backend, más el QR de validación (lib/qr.js vendorizado,
  offline).   Al abrir, el PNG se guarda en disco PRIMERO (si auto-descarga está activa)
  y luego se copia al portapapeles (pegar en WhatsApp); cada paso falla sin
  cancelar el otro. WhatsApp abre el navegador del sistema (puente Electron).

  Recibe:
    - controller: useModal
    - gymName: nombre del gimnasio
    - member: { nombre, telefono, tipo, valor, inicio, fin, medio_pago }
    - recibo: { numero, codigo, fecha }
    - autoDownload: guardar respaldo al generar (Ajustes → Recibo digital)
    - receiptsDir: carpeta elegida ('' = la de la app en escritorio)
*/

import { useEffect, useMemo, useRef, useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Icon from '../../../components/Icon/Icon';
import { makeQrDataUrl } from '../../../lib/qr';
import { drawReceiptCanvas } from '../../../lib/receiptCanvas';
import { downloadBlob } from '../../../lib/download';
import { formatMoney } from '../../../lib/money';
import { formatShortDate } from '../../../lib/date';
import { onlyDigits } from '../../../lib/format';
import { isDesktop, saveReceiptFile, openExternalUrl } from '../../../lib/desktop';
import styles from './ReceiptModal.module.css';

/** wa.me solo acepta TEXTO: el PNG se descarga y se adjunta manual. */
function whatsappLink(member, recibo, gymName) {
  const digits = onlyDigits(member.telefono || '');
  const to = digits.length === 10 ? `57${digits}` : digits;
  const text = `Hola ${member.nombre}, tu recibo ${recibo.numero} (${member.tipo}) por ${formatMoney(member.valor)} fue registrado en ${gymName}. Código: ${recibo.codigo}.`;
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}

export default function ReceiptModal({ controller, gymName, member, recibo, autoDownload, receiptsDir }) {
  const [busy, setBusy] = useState(false);
  // Estado del respaldo automático: pending → ok | disk-fail | clip-fail.
  // El disco va PRIMERO y con su propio try/catch: si el portapapeles falla
  // (foco perdido), el archivo igual debe existir.
  const [saved, setSaved] = useState('pending');
  const startedOnce = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);
  // QR legible al escanear: N° de recibo primero y OVERSEER al final;
  // en medio cliente, plan/valor, vigencia y código (se valida con
  // GET /receipts/:numero).
  const qrText = `${recibo.numero}|${recibo.codigo}|${member.nombre}|${member.tipo}|${formatMoney(member.valor)}|${formatShortDate(member.inicio)}|${formatShortDate(member.fin)}|OVERSEER`;
  const qrDataUrl = useMemo(() => makeQrDataUrl(qrText, 4), [qrText]);

  // Al abrir: renderiza el PNG (diferido para no trabar la animación de
  // entrada), guarda el respaldo en disco PRIMERO y luego copia al
  // portapapeles. Cada paso tiene su try/catch: el fallo de uno no cancela
  // el otro. Si el modal se cierra a mitad, el guardado sigue en fondo.
  useEffect(() => {
    if (startedOnce.current) return;
    startedOnce.current = true;
    const run = async () => {
      // Cede el hilo para que el modal pinte antes del trabajo pesado.
      await new Promise((res) => setTimeout(res, 0));
      let blob = null;
      try {
        const canvas = await drawReceiptCanvas({ gym: gymName, member, recibo, qrDataUrl });
        blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
        if (!blob) throw new Error('sin blob');
      } catch {
        if (mountedRef.current) setSaved('disk-fail');
        return;
      }
      // 1. Disco (respaldo que no se puede perder).
      if (autoDownload) {
        try {
          if (isDesktop()) {
            const path = await saveReceiptFile({ filename: `${recibo.numero}.png`, blob, dir: receiptsDir });
            if (!path) throw new Error('sin guardado');
          } else {
            downloadBlob(`${recibo.numero}.png`, blob);
          }
        } catch {
          if (mountedRef.current) setSaved('disk-fail');
          return;
        }
      }
      // 2. Portapapeles (comodidad: exige foco, puede fallar sin romper nada).
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      } catch {
        if (mountedRef.current) setSaved('clip-fail');
        return;
      }
      if (mountedRef.current) setSaved('ok');
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadPng = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const canvas = await drawReceiptCanvas({ gym: gymName, member, recibo, qrDataUrl });
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
      if (blob) downloadBlob(`${recibo.numero}.png`, blob);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal controller={controller} width={560}>
      <div className={styles.header}>
        <span className={styles.logo}>O</span>
        <div className={styles.heading}>
          <span className={styles.gym}>{gymName}</span>
          <span className={styles.sub}>Recibo digital de pago</span>
        </div>
        <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
      </div>

      <div className={styles.numero}>{recibo.numero}</div>
      <div className={styles.codigo}>{`Código: ${recibo.codigo} · ${formatShortDate(recibo.fecha)}`}</div>

      <div className={styles.rows}>
        <div className={styles.row}><span>Miembro</span><strong>{member.nombre}</strong></div>
        <div className={styles.row}><span>Plan</span><strong>{`${member.tipo} · ${formatShortDate(member.inicio)} → ${formatShortDate(member.fin)}`}</strong></div>
        <div className={styles.row}><span>Medio de pago</span><strong>{member.medio_pago === 'nequi' ? 'Nequi' : 'Efectivo'}</strong></div>
        <div className={styles.row}><span>Valor</span><strong className={styles.valor}>{formatMoney(member.valor)}</strong></div>
      </div>

      <img className={styles.qr} src={qrDataUrl} alt={`QR de validación ${recibo.numero}`} />
      <div className={styles.qrHint}>
        {saved === 'ok'
          ? 'Imagen copiada: pégala en el chat del cliente'
          : saved === 'disk-fail'
            ? 'No se guardó el respaldo: usa ↓ PNG y adjúntala manual'
            : saved === 'clip-fail'
              ? 'Guardado OK · no se pudo copiar sola: usa ↓ PNG'
              : 'Generando imagen…'}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={downloadPng} disabled={busy}><Icon name="download" /> PNG</button>
        <button type="button" className={styles.btn} onClick={() => openExternalUrl(whatsappLink(member, recibo, gymName))}><Icon name="up" /> WhatsApp</button>
        <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => controller.close()}>Cerrar <Icon name="check" /></button>
      </div>
    </Modal>
  );
}
