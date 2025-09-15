import styles from "../../styles/Dashboard.module.css";

interface Props {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  perfectDays: number;
  onClick?: (key: string) => void;
}

export default function KPIGrid({
  total,
  completed,
  active,
  overdue,
  perfectDays,
  onClick,
}: Props) {
  const items = [
    { key: "total", label: "Total tasks", value: total },
    { key: "completed", label: "Completed", value: completed },
    { key: "active", label: "To do", value: active },
    { key: "overdue", label: "Overdue", value: overdue },
    { key: "perfect", label: "Perfect days", value: perfectDays },
  ];

  return (
    <div className={styles.kpiGrid}>
      {items.map((it) => (
        <button
          key={it.key}
          className={styles.kpiCard}
          onClick={() => onClick?.(it.key)}
          aria-label={it.label}
        >
          <div className={styles.kpiValue}>{it.value}</div>
          <div className={styles.kpiLabel}>{it.label}</div>
        </button>
      ))}
    </div>
  );
}
