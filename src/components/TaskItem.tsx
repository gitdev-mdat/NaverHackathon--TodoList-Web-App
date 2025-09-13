import React from "react";
import type { Task } from "../types/Task";
import styles from "../styles/TaskBoard.module.css";

interface Props {
  task: Task;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const TaskItem: React.FC<Props> = ({ task, onToggle, onDelete }) => {
  return (
    <div className={`${styles.card} ${task.completed ? styles.completed : ""}`}>
      <div className={styles.cardHeader}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle?.(task.id)}
        />
        <h4 className={styles.cardTitle}>{task.title}</h4>
      </div>

      <div className={styles.cardMeta}>
        <span className={styles.dueDate}>
          ⏰ {new Date(task.dueDate).toLocaleDateString()}
        </span>
        <span className={`${styles.priority} ${styles[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <button onClick={() => onDelete?.(task.id)} className={styles.deleteBtn}>
        ❌
      </button>
    </div>
  );
};

export default TaskItem;
