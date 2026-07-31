/*
  DashboardKpis — Tarjetas de indicadores del Inicio.

  Reutiliza el componente genérico <KpiCard> (components/), así que aquí solo
  vive el VOCABULARIO del negocio: qué se mide, con qué color y a dónde lleva
  cada tarjeta.

  Los tres KPI de miembros abren su modal AQUÍ MISMO (filtro de useMembers); el
  de ingresos abre el modal-resumen de caja (ya no redirige a Finanzas).

  Enforcement (Tramo C): cada tarjeta declara la FUNCIÓN que exige (`need`) y se
  oculta si el usuario no la tiene — los KPI de miembros piden 'Miembros' y el de
  ingresos 'Finanzas'. El Admin/super ven todo.

  Recibe:
    - counts: { activos, pronto, vencidos } de useMembers
    - total: nº de miembros registrados
    - ingresos: caja recibida este mes (número, del libro mayor)
    - session: datos de useSession para filtrar por permisos
    - onFilterMembers: (filtro) => void   'activos' | 'pronto' | 'vencidos'
    - onOpenSummary: () => void   — abre el modal-resumen de ingresos
*/

import KpiCard from '../../../components/KpiCard/KpiCard';
import { hasPermission } from '../../../app/moduleRegistry';
import { formatMoney } from '../../../lib/money';
import styles from '../dashboard.module.css';

export default function DashboardKpis({ counts, total, ingresos, session, onFilterMembers, onOpenSummary }) {
  // Formateadores para la cifra animada (redondea el valor intermedio del tween).
  const asInt = (n) => String(Math.round(n));
  const asMoney = (n) => formatMoney(Math.round(n));

  const cards = [
    {
      key: 'activos', need: 'Miembros', label: 'Miembros activos',
      numericValue: counts.activos, format: asInt,
      delta: `de ${total} registrados`, icon: 'dot',
      color: 'var(--ok-strong)', glow: 'rgba(62,207,116,.12)',
      onClick: () => onFilterMembers('activos'),
    },
    {
      key: 'vencidos', need: 'Miembros', label: 'Vencidos',
      numericValue: counts.vencidos, format: asInt,
      delta: 'requieren renovación', icon: 'drop',
      color: 'var(--danger-strong)', glow: 'rgba(255,92,56,.13)',
      onClick: () => onFilterMembers('vencidos'),
    },
    {
      key: 'pronto', need: 'Miembros', label: 'Vencen pronto',
      numericValue: counts.pronto, format: asInt,
      delta: 'próximos 7 días', icon: 'gas',
      color: 'var(--warn)', glow: 'rgba(255,179,92,.13)',
      onClick: () => onFilterMembers('pronto'),
    },
    {
      key: 'ingresos', need: 'Finanzas', label: 'Ingresos del mes',
      numericValue: ingresos, format: asMoney,
      delta: 'caja recibida', icon: 'wave',
      color: 'var(--info)', glow: 'rgba(127,177,245,.12)',
      onClick: onOpenSummary,
    },
  ];

  const visible = cards.filter((c) => !session || !c.need || hasPermission(session, c.need));

  return (
    <div className={styles.kpiGrid}>
      {visible.map((c) => (
        <KpiCard
          key={c.key}
          label={c.label}
          numericValue={c.numericValue}
          format={c.format}
          delta={c.delta}
          icon={c.icon}
          color={c.color}
          glow={c.glow}
          onClick={c.onClick}
        />
      ))}
    </div>
  );
}
