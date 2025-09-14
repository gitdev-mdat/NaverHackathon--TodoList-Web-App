// components/TaskItem.tsx
import React from "react";
import type { Task } from "../types/Task";
import styles from "../styles/TaskItem.module.css";
import { formatLocalDateTime, getColumnFromDueDate } from "../utils/date";

interface Props {
  task: Task;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function TaskItem({ task, onToggle, onDelete }: Props) {
  const due = new Date(task.dueDate);
  const isOverdue = !task.completed && due.getTime() < Date.now();
  const column = getColumnFromDueDate(task.dueDate);

  return (
    <div
      className={`${styles.card} ${task.completed ? styles.completed : ""} ${
        isOverdue ? styles.overdue : ""
      }`}
    >
      <div className={styles.cardHeader}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle?.(task.id)}
          aria-label={`Toggle complete ${task.title}`}
        />
        <div className={styles.titleWrap}>
          <h4 className={styles.cardTitle}>{task.title}</h4>
          {task.description && (
            <p className={styles.desc}>{task.description}</p>
          )}
        </div>
        <button
          className={styles.deleteBtn}
          title="Delete"
          onClick={() => onDelete?.(task.id)}
        >
          🗑
        </button>
      </div>

      <div className={styles.cardMeta}>
        <span className={styles.dueDate}>
          {formatLocalDateTime(task.dueDate)}
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className={`${styles.priority} ${styles[task.priority]}`}>
            {task.priority}
          </span>
          <span className={styles.columnTiny}>
            {column === "today" ? "📅" : column === "future" ? "🔮" : "⏳"}
          </span>
        </div>
      </div>
    </div>
  );
}
