/*
  ClassesModule — Contenedor del módulo Clases (opcional, ARQUITECTURA §3).

  Orquesta: datos de useClasses, KPIs (StatTiles), rejilla de ClassCard y el
  modal de alta. Módulo opcional (core:false): solo aparece si su flag está
  encendido (Ajustes → Módulos).
*/

import { useState } from 'react';
import useClasses from './useClasses';
import useModal from '../../hooks/useModal';
import Icon from '../../components/Icon/Icon';
import StatTiles from '../../components/StatTiles/StatTiles';
import EmptyState from '../../components/EmptyState/EmptyState';
import ClassCard from './components/ClassCard';
import ClassModal from './components/ClassModal';
import styles from './classes.module.css';

export default function ClassesModule() {
  const { classes, createClass, updateClass, deleteClass } = useClasses();
  const modal = useModal();
  const [editing, setEditing] = useState(null); // clase en edición o null (alta)
  const [key, setKey] = useState(0);            // remonta el modal en cada apertura

  const open = (clase) => {
    setEditing(clase);
    setKey((k) => k + 1);
    modal.open();
  };

  const inscritosHoy = classes.reduce((s, c) => s + c.inscritos, 0);
  const ocupacion = classes.length
    ? Math.round((classes.reduce((s, c) => s + c.inscritos / c.cupo, 0) / classes.length) * 100)
    : 0;

  const kpis = [
    { label: 'Clases activas', value: String(classes.length), color: 'var(--info)' },
    { label: 'Inscritos hoy', value: String(inscritosHoy), color: 'var(--ok)' },
    { label: 'Ocupación media', value: `${ocupacion}%`, color: '#c6a0f5' },
  ];

  const save = async (datos) => {
    if (editing) await updateClass(editing.id, datos);
    else await createClass(datos);
    modal.close();
  };

  const remove = async () => {
    if (editing) await deleteClass(editing.id);
    modal.close();
  };

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.title}>Clases</span>
          <span className={styles.subtitle}>Programación de clases grupales</span>
        </div>
        <button type="button" className={styles.addBtn} onClick={() => open(null)}>
          <Icon name="add" /> Nueva clase
        </button>
      </div>

      <StatTiles items={kpis} />

      {classes.length > 0 ? (
        <div className={styles.grid}>
          {classes.map((c) => <ClassCard key={c.id} clase={c} onEdit={open} />)}
        </div>
      ) : (
        <EmptyState>Sin clases programadas. Crea la primera con "Nueva clase".</EmptyState>
      )}

      <ClassModal key={key} controller={modal} clase={editing} onSave={save} onDelete={remove} />
    </div>
  );
}
