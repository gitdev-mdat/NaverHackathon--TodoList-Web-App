import type { Task } from "../types/Task";
import styles from "../styles/TaskItem.module.css";
import { formatLocalDateTime } from "../utils/date";

interface Props {
  task: Task;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onView?: (task: Task) => void;
}

function formatDateOnly(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function TaskItem({ task, onToggle, onDelete, onView }: Props) {
  const due = new Date(task.dueDate);
  const isOverdue = !task.completed && due.getTime() < Date.now();

  const startLabel = task.allDay
    ? `${formatDateOnly(task.dueDate)} (All day)`
    : formatLocalDateTime(task.dueDate);

  let endLabel: string | null = null;
  if (task.endDate) {
    if (task.allDay) {
      const e = new Date(task.endDate);
      e.setDate(e.getDate() - 1);
      endLabel = `${formatDateOnly(e.toISOString())} (All day)`;
    } else {
      endLabel = formatLocalDateTime(task.endDate);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView?.(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onView?.(task);
      }}
      className={`${styles.card} ${task.completed ? styles.completed : ""} ${
        isOverdue ? styles.overdue : ""
      }`}
      aria-label={task.title}
      title={task.title}
    >
      <div className={styles.cardHeader}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => {
            onToggle?.(task.id);
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            // stop Enter / Space from bubbling to parent
            if (e.key === " " || e.key === "Spacebar" || e.key === "Enter") {
              e.stopPropagation();
            }
          }}
          aria-label={`Toggle complete ${task.title}`}
        />

        <div className={styles.titleWrap}>
          <h4 className={styles.cardTitle} title={task.title}>
            {task.title}
          </h4>
          {task.description ? (
            <p className={styles.desc}>{task.description}</p>
          ) : null}
        </div>

        <div className={styles.rightControls}>
          <span className={`${styles.priority} ${styles[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>

      <div className={styles.cardMeta}>
        <div className={styles.dateWrap}>
          <span className={styles.dueDate}>{startLabel}</span>
          {endLabel && <span className={styles.endDate}>→ {endLabel}</span>}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className={styles.deleteBtn}
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(task.id);
            }}
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}
