/*
  NotificationsSection — Ajustes → Notificaciones.

  Dos tarjetas de interruptores: avisos automáticos y canales de envío. Cada
  toggle persiste vía settingsService (setNotification).

  Recibe (de useSettings): notifications, setNotification.
*/

import Toggle from '../../../components/Toggle/Toggle';
import SettingsCard from './SettingsCard';
import shared from './SettingsShared.module.css';
import styles from './NotificationsSection.module.css';

const RULES = [
  { key: 'rem3', label: 'Recordatorio 3 días antes', desc: 'Avisa al miembro y al staff antes del vencimiento' },
  { key: 'remDay', label: 'Aviso el día del vencimiento', desc: 'Notificación automática cuando expira una membresía' },
  { key: 'stockLow', label: 'Alerta de stock bajo', desc: 'Cuando un artículo del inventario baja de 5 unidades' },
  { key: 'dailySummary', label: 'Resumen diario', desc: 'Correo con la actividad del día al cerrar' },
];

const CHANNELS = [
  { key: 'chWhats', label: 'WhatsApp', desc: 'Canal principal de recordatorios' },
  { key: 'chMail', label: 'Correo electrónico', desc: 'Copia de avisos por email' },
  { key: 'chSms', label: 'SMS', desc: 'Mensajes de texto (costo adicional)' },
];

export default function NotificationsSection({ notifications, setNotification }) {
  const renderRow = (item) => {
    const on = !!notifications[item.key];
    return (
      <div key={item.key} className={shared.row}>
        <div className={shared.rowInfo}>
          <span className={shared.rowLabel}>{item.label}</span>
          <span className={shared.rowDesc}>{item.desc}</span>
        </div>
        <Toggle checked={on} onChange={(v) => setNotification(item.key, v)} label={item.label} />
      </div>
    );
  };

  return (
    <div className={styles.wrap}>
      <SettingsCard title="Avisos automáticos">{RULES.map(renderRow)}</SettingsCard>
      <SettingsCard title="Canales de envío">{CHANNELS.map(renderRow)}</SettingsCard>
    </div>
  );
}
