/*
  DashboardKpis — Las 4 tarjetas de indicadores del Inicio.

  Reutiliza el componente genérico <KpiCard> (components/), así que aquí solo
  vive el VOCABULARIO del negocio: qué se mide, con qué color y a dónde lleva
  cada tarjeta.

  Los tres primeros KPI navegan a Miembros con un filtro (params de
  ModulesProvider) y el cuarto a Finanzas: el Inicio nunca abre los modales
  de otro módulo, solo pide "muéstrame esto allá" (ver ModulesProvider).

  Recibe:
    - counts: { activos, pronto, vencidos } de useMembers
    - total: nº de miembros registrados
    - ingresos: suma del valor pagado de las membresías (número)
    - onFilterMembers: (filtro) => void   'activos' | 'pronto' | 'vencidos'
    - onOpenFinance: () => void
*/

import KpiCard from '../../../components/KpiCard/KpiCard';
import { formatMoney } from '../../../lib/money';
import styles from '../dashboard.module.css';

export default function DashboardKpis({ counts, total, ingresos, onFilterMembers, onOpenFinance }) {
  const cards = [
    {
      key: 'activos', label: 'Miembros activos', value: String(counts.activos),
      delta: `de ${total} registrados`, icon: 'dot',
      color: 'var(--ok-strong)', glow: 'rgba(62,207,116,.12)',
      onClick: () => onFilterMembers('activos'),
    },
    {
      key: 'vencidos', label: 'Vencidos', value: String(counts.vencidos),
      delta: 'requieren renovación', icon: 'drop',
      color: 'var(--danger-strong)', glow: 'rgba(255,92,56,.13)',
      onClick: () => onFilterMembers('vencidos'),
    },
    {
      key: 'pronto', label: 'Vencen pronto', value: String(counts.pronto),
      delta: 'próximos 7 días', icon: 'gas',
      color: 'var(--warn)', glow: 'rgba(255,179,92,.13)',
      onClick: () => onFilterMembers('pronto'),
    },
    {
      key: 'ingresos', label: 'Ingresos del mes', value: formatMoney(ingresos),
      delta: `${total} pagos`, icon: 'wave',
      color: 'var(--info)', glow: 'rgba(127,177,245,.12)',
      onClick: onOpenFinance,
    },
  ];

  return (
    <div className={styles.kpiGrid}>
      {cards.map((c) => (
        <KpiCard
          key={c.key}
          label={c.label}
          value={c.value}
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
