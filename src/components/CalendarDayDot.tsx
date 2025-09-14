import React from "react";
import type { Task } from "../types/Task";
import styles from "../styles/CalendarPage.module.css";

interface Props {
  tasks: Task[];
  maxDots?: number;
}
export default function CalendarDayDot({ tasks, maxDots = 3 }: Props) {
  if (!tasks || tasks.length === 0) return null;
  const visible = tasks.slice(0, maxDots);
  const more = tasks.length - maxDots;
  const colorFor = (p: string) =>
    p === "high"
      ? styles.dotHigh
      : p === "low"
      ? styles.dotLow
      : styles.dotMedium;

  return (
    <div className={styles.dotWrap}>
      {visible.map((t) => (
        <span
          key={t.id}
          className={`${styles.dot} ${colorFor(t.priority)}`}
          title={`${t.title} ${t.allDay ? "(All-day)" : ""}`}
        />
      ))}
      {more > 0 && <span className={styles.moreDots}>+{more}</span>}
    </div>
  );
}
