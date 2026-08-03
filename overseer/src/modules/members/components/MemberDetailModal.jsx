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
*/

import { useEffect, useRef, useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Badge from '../../../components/Badge/Badge';
import Button from '../../../components/Button/Button';
import Field from '../../../components/Field/Field';
import DatePicker from '../../../components/DatePicker/DatePicker';
import PlanDropdown from './PlanDropdown';
import { getInitials } from '../../../lib/initials';
import { formatMoney } from '../../../lib/money';
import { formatCedula, formatPhone, toTitleCase } from '../../../lib/format';
import { computeFin, STATUS } from '../../../lib/memberStatus';
import { ESTADO_STYLES, getPlanStyle } from '../memberStyles';
import styles from './MemberDetailModal.module.css';

export default function MemberDetailModal({ controller, member, planOptions, onUpdate, onRenew, canEdit = true }) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const fileInputRef = useRef(null);

  // Al cerrar el modal, salir del modo edición para que la próxima apertura
  // empiece en modo vista.
  useEffect(() => {
    if (!controller.isOpen) setEditingName(false);
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

  // Adjuntar foto: leemos el archivo como data URL y lo guardamos en el
  // miembro; se ve al instante (y persiste como cualquier otro campo).
  const onPhotoPick = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdate(member.id, { foto: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <Modal controller={controller} width={560} overflowVisible>
      <div className={styles.header}>
        {/* Columna izquierda: foto (adjuntable) + identidad fija */}
        <div className={styles.photoCol}>
          <button
            type="button"
            className={styles.photo}
            title={canEdit ? 'Subir foto' : undefined}
            onClick={canEdit ? () => fileInputRef.current?.click() : undefined}
            disabled={!canEdit}
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
          {canEdit && <input ref={fileInputRef} type="file" accept="image/*" onChange={onPhotoPick} hidden />}

          <div className={styles.idField}>
            <span className={styles.idLabel}>Cédula</span>
            <span className={styles.idValue}>{formatCedula(member.cedula)}</span>
          </div>
          <div className={styles.idField}>
            <span className={styles.idLabel}>Teléfono</span>
            <span className={styles.idValue}>{formatPhone(member.telefono)}</span>
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
                ? <DatePicker value={member.inicio} onChange={changeInicio} />
                : <span className={styles.roValue}>{member.inicio}</span>}
            </Field>
            <Field label="Fecha fin">
              {canEdit
                ? <DatePicker value={member.fin} onChange={(fin) => onUpdate(member.id, { fin })} align="right" />
                : <span className={styles.roValue}>{member.fin}</span>}
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
        <span className={styles.lastRenewal}>Última renovación: {member.inicio}</span>
        <div className={styles.actions}>
          <Button variant="outline" onClick={() => controller.close()}>Cerrar</Button>
          {canEdit && <Button onClick={() => onRenew(member)}>↻ Renovar membresía</Button>}
        </div>
      </div>
    </Modal>
  );
}
