// components/QuickCreateModal.tsx
import React, { useState } from "react";
import styles from "../styles/CalendarPage.module.css";
import type { Task } from "../types/Task";

interface Prefill {
  title?: string;
  description?: string;
  allDay?: boolean;
  priority?: "low" | "medium" | "high";
  endDate?: string;
}
interface Props {
  day: Date;
  onClose: () => void;
  onCreate: (prefill: Prefill) => void;
}
export default function QuickCreateModal({ day, onClose, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [desc, setDesc] = useState("");

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <header className={styles.modalHeaderSmall}>
          <h3>Create task on {day.toLocaleDateString()}</h3>
          <button onClick={onClose} className={styles.closeSmall}>
            ✕
          </button>
        </header>

        <div className={styles.modalBody}>
          <label className={styles.field}>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            Description (optional)
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </label>

          <label className={styles.inlineField}>
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
            />
            <span>All day</span>
          </label>

          <label className={styles.field}>
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className={styles.input}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={styles.saveBtn}
              onClick={() => {
                onCreate({
                  title: title || (allDay ? "Deadline" : "Work session"),
                  description: desc,
                  allDay,
                  priority,
                });
              }}
            >
              Create
            </button>
            <button className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
