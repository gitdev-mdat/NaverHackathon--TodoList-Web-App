import React from "react";
import type { Task } from "../types/Task";
import styles from "../styles/TaskItem.module.css";
import { formatLocalDateTime, getColumnFromDueDate } from "../utils/date";

interface Props {
  task: Task;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onView?: (task: Task) => void;
}

export default function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
  onView,
}: Props) {
  const due = new Date(task.dueDate);
  const isOverdue = !task.completed && due.getTime() < Date.now();
  const column = getColumnFromDueDate(task.dueDate);

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
          onChange={(e) => {
            e.stopPropagation();
            onToggle?.(task.id);
          }}
          aria-label={`Toggle complete ${task.title}`}
        />
        <div className={styles.titleWrap}>
          <h4 className={styles.cardTitle} title={task.title}>
            {task.title}
          </h4>
          {task.description && (
            <p className={styles.desc}>{task.description}</p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className={`${styles.priority} ${styles[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>

      <div className={styles.cardMeta}>
        <span className={styles.dueDate}>
          {formatLocalDateTime(task.dueDate)}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className={styles.iconBtn}
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(task);
            }}
          >
            ✏️
          </button>
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
