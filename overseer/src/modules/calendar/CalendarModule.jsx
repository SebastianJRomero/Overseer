/*
  CalendarModule — Contenedor del módulo Calendario (ARQUITECTURA §3).

  Solo ORQUESTA: los datos vienen de useCalendar, las celdas de
  calendarCells, y las piezas visuales son componentes de ./components.
  Aquí se decide qué evento está abierto en el modal y con qué datos.

  Interacción del prototipo:
    - clic en un día vacío → modal "Nuevo evento" para ese día,
    - clic en un evento → modal "Editar evento" (con Eliminar).
  El modal se remonta con `key` en cada apertura (estado inicial limpio).
*/

import { useMemo, useState } from 'react';
import useCalendar from './useCalendar';
import useModal from '../../hooks/useModal';
import useSwapAnimation from '../../hooks/useSwapAnimation';
import { buildCalendarCells } from './calendarCells';
import { MONTH_NAMES } from '../../lib/date';
import CalendarToolbar from './components/CalendarToolbar';
import CalendarGrid from './components/CalendarGrid';
import CalendarLegend from './components/CalendarLegend';
import EventModal from './components/EventModal';
import styles from './calendar.module.css';

export default function CalendarModule() {
  const { events, cursor, isCurrentMonth, prevMonth, nextMonth, goToday, saveEvent, deleteEvent } = useCalendar();
  const eventModal = useModal();
  const [editing, setEditing] = useState(null); // { dateKey, id, title, time, type }
  const [modalKey, setModalKey] = useState(0);   // remonta el modal en cada apertura

  // Celdas del mes visible (se recalculan al cambiar mes o eventos).
  const cells = useMemo(() => buildCalendarCells(cursor, events), [cursor, events]);
  const monthLabel = `${MONTH_NAMES[cursor.m]} ${cursor.y}`;
  // La grilla vuelve a entrar con una micro transición al cambiar de mes
  // (fundido + leve subida), coherente con Finanzas.
  const monthSwap = useSwapAnimation(`${cursor.y}-${cursor.m}`, ['swapA', 'swapB']);

  const openNew = (dateKey) => {
    setEditing({ dateKey, id: null, title: '', time: '', type: 'Reserva' });
    setModalKey((k) => k + 1);
    eventModal.open();
  };

  const openEdit = (dateKey, ev) => {
    setEditing({ dateKey, id: ev.id, title: ev.title, time: ev.time, type: ev.type });
    setModalKey((k) => k + 1);
    eventModal.open();
  };

  const handleSave = async (dateKey, evento) => {
    await saveEvent(dateKey, evento);
    eventModal.close();
  };

  const handleDelete = async (dateKey, id) => {
    await deleteEvent(dateKey, id);
    eventModal.close();
  };

  return (
    <div className={styles.module}>
      <CalendarToolbar
        monthLabel={monthLabel}
        isCurrentMonth={isCurrentMonth}
        onPrev={prevMonth}
        onNext={nextMonth}
        onToday={goToday}
      />

      <div style={{ animation: monthSwap }}>
        <CalendarGrid cells={cells} onDayClick={openNew} onEventClick={openEdit} />
      </div>

      <CalendarLegend />

      {editing && (
        <EventModal
          key={modalKey}
          controller={eventModal}
          initial={editing}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
