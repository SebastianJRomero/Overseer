/*
  MemberDetailModal — Ficha del miembro (modal de 560px).

  Columna izquierda: "foto" (clic → adjuntar imagen) + cédula/teléfono
  formateados. Columna derecha: nombre editable, badges de estado/plan,
  valor pagado y la grilla editable (fechas, plan, recibo y observaciones).

  Decisiones de UX pedidas por el cliente:
    - overflowVisible: los calendarios de las fechas SOBRESALEN del modal
      (nada de scroll ni popovers recortados).
    - Editar el nombre despliega una barra a lo ANCHO por debajo del valor
      pagado, para no encimarse con el valor ni con la ✕.
    - Recibo y observaciones son editables (se guardan al escribir).
    - Cédula y teléfono son editables (se guardan al salir del campo o con
      Enter) SOLO si el usuario es Admin o tiene 'Editar miembros' (canEdit).
    - La foto se adjunta desde un selector de archivo (se muestra al instante).

  Reglas de negocio: cambiar la fecha de INICIO recalcula el fin según el
  plan (computeFin); cambiar fin o plan a mano no arrastra nada más.

  Recibe:
    - controller: useModal del módulo
    - member: miembro seleccionado (con status derivado) o null
    - planOptions: nombres de plan que ofrece el gimnasio
    - onUpdate: (id, patch) => void
    - onRenew: (member) => void — abre el wizard de renovación
    - canEdit: con permiso 'Editar miembros'. Si es false, la ficha es de SOLO
      LECTURA: los controles editables se muestran como texto y se ocultan
      "Renovar", el editor de nombre y el selector de foto.
    - gymName / receiptsDir: para reimprimir el recibo guardado (botón Ver recibo).
*/

import { useEffect, useRef, useState } from 'react';
import useModal from '../../../hooks/useModal';
import { useSession } from '../../../context/SessionProvider';
import Modal from '../../../components/Modal/Modal';
import Badge from '../../../components/Badge/Badge';
import Button from '../../../components/Button/Button';
import Field from '../../../components/Field/Field';
import DatePicker from '../../../components/DatePicker/DatePicker';
import PlanDropdown from './PlanDropdown';
import MemberPhotoPreview from './MemberPhotoPreview';
import MemberUndoRenew from './MemberUndoRenew';
import ReceiptModal from './ReceiptModal';
import { getInitials } from '../../../lib/initials';
import { formatMoney } from '../../../lib/money';
import { formatCedula, formatPhone, onlyDigits, toTitleCase } from '../../../lib/format';
import { formatShortDate } from '../../../lib/date';
import { computeFin, STATUS } from '../../../lib/memberStatus';
import { receiptCode } from '../../../lib/receiptCode';
import { resizeImage } from '../../../lib/image';
import { ESTADO_STYLES, getPlanStyle } from '../memberStyles';
import styles from './MemberDetailModal.module.css';

export default function MemberDetailModal({ controller, member, planOptions, onUpdate, onRenew, onUndo, canEdit = true, gymName = 'OVERSEER Fitness Club', receiptsDir = '', msgWhatsapp = '', msgPie = '' }) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  // Cédula y teléfono se editan en la columna izquierda: borrador local que se
  // confirma al salir del campo (Enter/blur) para no llamar a la API por tecla.
  const [editingCedula, setEditingCedula] = useState(false);
  const [cedulaDraft, setCedulaDraft] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState('');
  const fileInputRef = useRef(null);
  // Vista ampliada de la foto: se abre al tocar la foto cuando ya hay una
  // adjunta; desde ahí se puede cambiar la foto (canEdit) o cerrar.
  const previewCtrl = useModal();
  // Reimpresión del recibo: reutiliza ReceiptModal en modo lectura
  // (autoDownload=false, no consume consecutivo ni crea movimiento).
  const receiptViewCtrl = useModal();
  const { isSuper } = useSession();

  // Al cerrar el modal, salir de los modos edición para que la próxima apertura
  // empiece en modo vista.
  useEffect(() => {
    if (!controller.isOpen) {
      setEditingName(false);
      setEditingCedula(false);
      setEditingPhone(false);
    }
  }, [controller.isOpen]);

  if (!member) return null;

  const vencido = member.status === STATUS.VENCIDO;
  const estado = vencido ? ESTADO_STYLES[STATUS.VENCIDO] : ESTADO_STYLES[STATUS.VIGENTE];
  const plan = getPlanStyle(member.tipo);

  // Cambiar el inicio arrastra el fin automático del plan (si se puede calcular).
  const changeInicio = (inicio) => {
    const fin = computeFin(member.tipo, inicio);
    onUpdate(member.id, fin ? { inicio, fin } : { inicio });
  };

  const startEditName = () => {
    setNameDraft(member.nombre);
    setEditingName(true);
  };
  const saveName = () => {
    const clean = nameDraft.trim();
    if (clean) onUpdate(member.id, { nombre: toTitleCase(clean) });
    setEditingName(false);
  };

  // Edición de cédula/teléfono: se guarda solo si cambió el valor; la cédula
  // no puede quedar vacía (es el documento de identidad). Se guarda "cruda"
  // (solo dígitos); la UI la formatea al mostrar (lib/format.js).
  const startEditCedula = () => {
    setCedulaDraft(member.cedula);
    setEditingCedula(true);
  };
  const commitCedula = () => {
    const clean = onlyDigits(cedulaDraft);
    if (clean && clean !== onlyDigits(member.cedula)) onUpdate(member.id, { cedula: clean });
    setEditingCedula(false);
  };
  const startEditPhone = () => {
    setPhoneDraft(member.telefono);
    setEditingPhone(true);
  };
  const commitPhone = () => {
    const clean = onlyDigits(phoneDraft);
    if (clean !== onlyDigits(member.telefono)) onUpdate(member.id, { telefono: clean });
    setEditingPhone(false);
  };

  // Adjuntar foto: la redimensionamos en el cliente (512px máx.) y la
  // guardamos en el miembro; se ve al instante y persiste como cualquier
  // otro campo. Si algo falla (no es imagen, muy grande), dejamos la foto
  // anterior y mostramos el error en consola.
  const onPhotoPick = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (!file) return;
    try {
      const foto = await resizeImage(file);
      onUpdate(member.id, { foto });
    } catch (err) {
      console.error('[OVERSEER] no se pudo adjuntar la foto:', err.message || err);
    }
  };

  // Recibo existente para reimprimir: número guardado + código derivado.
  // Si no hay recibo (flujo manual sin digitar), no se ofrece la vista.
  const hasReceipt = !!(member.recibo && String(member.recibo).trim());
  const receiptView = hasReceipt
    ? { numero: member.recibo, codigo: receiptCode(member.recibo, member.id), fecha: member.inicio }
    : null;

  // Tocar la foto: si ya hay una foto adjunta se AMPLÍA (vista previa); si no,
  // se abre directo el selector de archivos/cámara para subir la primera foto.
  const onPhotoClick = () => {
    if (member.foto) {
      previewCtrl.open();
    } else if (canEdit) {
      fileInputRef.current?.click();
    }
  };

  // "Cambiar foto" desde la vista ampliada: cerrar la vista previa y abrir el
  // selector. El input file lo maneja onPhotoPick, que persiste el nuevo valor.
  const changePhotoFromPreview = () => {
    previewCtrl.close();
    fileInputRef.current?.click();
  };

  return (
    <>
      <Modal controller={controller} width={560} overflowVisible>
      <div className={styles.header}>
        {/* Columna izquierda: foto (adjuntable) + identidad fija */}
        <div className={styles.photoCol}>
          <button
            type="button"
            className={styles.photo}
            title={member.foto ? 'Ver foto ampliada' : canEdit ? 'Subir foto' : undefined}
            onClick={onPhotoClick}
            disabled={!member.foto && !canEdit}
          >
            {member.foto ? (
              <img className={styles.photoImg} src={member.foto} alt={member.nombre} />
            ) : (
              <>
                <span className={styles.photoInitials}>{getInitials(member.nombre)}</span>
                {canEdit && <span className={styles.photoLabel}>SUBIR FOTO</span>}
              </>
            )}
          </button>
          {canEdit && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onPhotoPick}
              hidden
            />
          )}

          <div className={styles.idField}>
            <div className={styles.idHead}>
              <span className={styles.idLabel}>Cédula</span>
              {canEdit && !editingCedula && (
                <button type="button" className={styles.idEdit} title="Editar cédula" onClick={startEditCedula}>✎</button>
              )}
            </div>
            {canEdit && editingCedula ? (
              <input
                className={`${styles.idInput} ${styles.mono}`}
                value={cedulaDraft}
                onChange={(e) => setCedulaDraft(onlyDigits(e.target.value))}
                onBlur={commitCedula}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                  else if (e.key === 'Escape') setEditingCedula(false);
                }}
                autoFocus
              />
            ) : (
              <span className={styles.idValue}>{formatCedula(member.cedula)}</span>
            )}
          </div>
          <div className={styles.idField}>
            <div className={styles.idHead}>
              <span className={styles.idLabel}>Teléfono</span>
              {canEdit && !editingPhone && (
                <button type="button" className={styles.idEdit} title="Editar teléfono" onClick={startEditPhone}>✎</button>
              )}
            </div>
            {canEdit && editingPhone ? (
              <input
                className={`${styles.idInput} ${styles.mono}`}
                value={phoneDraft}
                onChange={(e) => setPhoneDraft(onlyDigits(e.target.value))}
                onBlur={commitPhone}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur();
                  else if (e.key === 'Escape') setEditingPhone(false);
                }}
                autoFocus
              />
            ) : (
              <span className={styles.idValue}>{formatPhone(member.telefono)}</span>
            )}
          </div>
        </div>

        {/* Columna derecha: identidad + grilla */}
        <div className={styles.mainCol}>
          <div className={styles.identityRow}>
            <div className={styles.identity}>
              {/* En modo edición ocultamos el nombre aquí; se edita abajo. */}
              {!editingName && (
                <div className={styles.nameView}>
                  <span className={styles.name}>{member.nombre}</span>
                  {canEdit && (
                    <button type="button" className={styles.editBtn} title="Editar nombre" onClick={startEditName}>✎</button>
                  )}
                </div>
              )}
              <div className={styles.badges}>
                <Badge color={estado.color} bg={estado.bg} dot={estado.dot}>
                  {vencido ? 'Vencido' : 'Vigente'}
                </Badge>
                <Badge color={plan.color} bg={plan.bg}>{member.tipo}</Badge>
              </div>
            </div>
            <span className={styles.valor}>{formatMoney(member.valor)}</span>
            <button type="button" className={styles.close} onClick={() => controller.close()}>✕</button>
          </div>

          {/* Barra de edición del nombre: a lo ANCHO, por debajo del valor,
              para no encimarse con los controles de la fila superior. */}
          {editingName && (
            <div className={styles.nameEditor}>
              <input
                className={styles.nameInput}
                value={nameDraft}
                onChange={(e) => setNameDraft(toTitleCase(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveName();
                  else if (e.key === 'Escape') setEditingName(false);
                }}
                autoFocus
              />
              <button type="button" className={styles.saveBtn} title="Guardar" onClick={saveName}>✓</button>
              <button type="button" className={styles.cancelBtn} title="Cancelar" onClick={() => setEditingName(false)}>✕</button>
            </div>
          )}

          <div className={styles.grid}>
            <Field label="Fecha inicio">
              {canEdit
                ? <DatePicker value={member.inicio} onChange={changeInicio} display={formatShortDate} />
                : <span className={styles.roValue}>{formatShortDate(member.inicio)}</span>}
            </Field>
            <Field label="Fecha fin">
              {canEdit
                ? <DatePicker value={member.fin} onChange={(fin) => onUpdate(member.id, { fin })} align="right" display={formatShortDate} />
                : <span className={styles.roValue}>{formatShortDate(member.fin) || '—'}</span>}
            </Field>
            <Field label="Membresía">
              {canEdit
                ? (
                  <PlanDropdown
                    value={member.tipo}
                    options={planOptions}
                    onChange={(tipo) => onUpdate(member.id, { tipo })}
                  />
                )
                : <span className={styles.roValue}>{member.tipo}</span>}
            </Field>
            <Field label="N° Recibo">
              {canEdit
                ? (
                  <input
                    className={`${styles.editInput} ${styles.mono}`}
                    value={member.recibo}
                    onChange={(e) => onUpdate(member.id, { recibo: e.target.value })}
                    placeholder="RC-0000"
                  />
                )
                : <span className={`${styles.roValue} ${styles.mono}`}>{member.recibo || '—'}</span>}
            </Field>
            <div className={styles.obsField}>
              <Field label="Observaciones">
                {canEdit
                  ? (
                    <textarea
                      className={styles.editTextarea}
                      value={member.obs}
                      onChange={(e) => onUpdate(member.id, { obs: e.target.value })}
                      placeholder="Sin observaciones"
                      rows={2}
                    />
                  )
                  : <span className={styles.roValue}>{member.obs || 'Sin observaciones'}</span>}
              </Field>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.lastRenewal}>Última renovación: {formatShortDate(member.inicio)}</span>
        <div className={styles.actions}>
          {hasReceipt && (
            <Button variant="outline" onClick={() => receiptViewCtrl.open()}>⎙ Ver recibo</Button>
          )}
          <Button variant="outline" onClick={() => controller.close()}>Cerrar</Button>
          {canEdit && <Button onClick={() => onRenew(member)}>↻ Renovar membresía</Button>}
        </div>
      </div>

      {/* Superusuario: corregir duplicado por doble renovar (fuera del flujo normal). */}
      {isSuper && onUndo && (
        <div style={{ padding: '0 20px 18px' }}>
          <MemberUndoRenew member={member} onUndo={onUndo} />
        </div>
      )}
    </Modal>

      {/* Vista ampliada de la foto (solo si hay foto adjunta). */}
      <MemberPhotoPreview
        controller={previewCtrl}
        foto={member.foto}
        nombre={member.nombre}
        canEdit={canEdit}
        onChangePhoto={changePhotoFromPreview}
      />

      {/* Reimpresión del recibo guardado (lectura, sin consumir consecutivo). */}
      {receiptView && (
        <ReceiptModal
          controller={receiptViewCtrl}
          gymName={gymName}
          member={member}
          recibo={receiptView}
          autoDownload={false}
          receiptsDir={receiptsDir}
          msgWhatsapp={msgWhatsapp}
          msgPie={msgPie}
        />
      )}
    </>
  );
}
