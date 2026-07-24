/*
  TrainersModule — Contenedor del módulo Entrenadores (opcional).

  Orquesta: datos de useTrainers, KPIs (StatTiles), rejilla de TrainerCard y
  el modal de alta. Módulo opcional (core:false).
*/

import { useState } from 'react';
import useTrainers from './useTrainers';
import useModal from '../../hooks/useModal';
import Icon from '../../components/Icon/Icon';
import StatTiles from '../../components/StatTiles/StatTiles';
import EmptyState from '../../components/EmptyState/EmptyState';
import TrainerCard from './components/TrainerCard';
import TrainerModal from './components/TrainerModal';
import styles from './trainers.module.css';

export default function TrainersModule() {
  const { trainers, createTrainer, updateTrainer, deleteTrainer } = useTrainers();
  const modal = useModal();
  const [editing, setEditing] = useState(null);
  const [key, setKey] = useState(0);

  const open = (trainer) => {
    setEditing(trainer);
    setKey((k) => k + 1);
    modal.open();
  };

  const disponibles = trainers.filter((t) => t.activo).length;
  const clientes = trainers.reduce((s, t) => s + t.clientes, 0);

  const kpis = [
    { label: 'Entrenadores', value: String(trainers.length), color: 'var(--info)' },
    { label: 'Disponibles', value: String(disponibles), color: 'var(--ok)' },
    { label: 'Clientes asignados', value: String(clientes), color: '#c6a0f5' },
  ];

  const save = async (datos) => {
    if (editing) await updateTrainer(editing.id, datos);
    else await createTrainer(datos);
    modal.close();
  };

  const remove = async () => {
    if (editing) await deleteTrainer(editing.id);
    modal.close();
  };

  return (
    <div className={styles.module}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.title}>Entrenadores</span>
          <span className={styles.subtitle}>Staff y asignación de clientes</span>
        </div>
        <button type="button" className={styles.addBtn} onClick={() => open(null)}>
          <Icon name="add" /> Nuevo entrenador
        </button>
      </div>

      <StatTiles items={kpis} />

      {trainers.length > 0 ? (
        <div className={styles.grid}>
          {trainers.map((t) => <TrainerCard key={t.id} trainer={t} onEdit={open} />)}
        </div>
      ) : (
        <EmptyState>Sin entrenadores. Agrega el primero con "Nuevo entrenador".</EmptyState>
      )}

      <TrainerModal key={key} controller={modal} trainer={editing} onSave={save} onDelete={remove} />
    </div>
  );
}
