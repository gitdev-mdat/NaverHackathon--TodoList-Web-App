import { useState } from "react";
import styles from "../styles/CalendarPage.module.css";
import TaskFormModal from "./TaskFormModal";
import TaskDetailModal from "./TaskDetailModal";
import useTasks from "../hooks/useTasks";
import type { Task } from "../types/Task";

interface Props {
  day: Date;
  tasks: Task[];
  onClose: () => void;

  onEdit?: (task: Task) => void;
}
export default function DayTasksModal({ day, tasks, onClose, onEdit }: Props) {
  const { updateTask: localUpdateTask } = useTasks();
  const [editing, setEditing] = useState<Task | null>(null);
  const [viewing, setViewing] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
    return (
      (new Date(a.dueDate).getTime() || 0) -
      (new Date(b.dueDate).getTime() || 0)
    );
  });

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard} role="dialog" aria-modal="true">
        <header className={styles.modalHeaderSmall}>
          <h3>Tasks on {day.toLocaleDateString()}</h3>
          <button onClick={onClose} className={styles.closeSmall}>
            ✕
          </button>
        </header>

        <div className={styles.modalBody}>
          {sorted.length === 0 && (
            <p className={styles.empty}>No tasks this day</p>
          )}
          {sorted.map((t) => (
            <div
              key={t.id}
              className={`${styles.taskRow} ${
                t.completed ? styles.taskCompleted : ""
              }`}
            >
              <div className={styles.taskLeft}>
                <div className={styles.taskTitle}>{t.title}</div>
                <div className={styles.taskMeta}>
                  <small>
                    {t.allDay
                      ? "All day"
                      : new Date(t.dueDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                  </small>
                  <small> • {t.priority}</small>
                </div>
              </div>

              <div className={styles.taskActions}>
                {t.completed ? (
                  <button
                    onClick={() => setViewing(t)}
                    className={styles.viewBtn}
                  >
                    View
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing(t)}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}

          {error && (
            <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>
          )}
        </div>

        <footer className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelBtn}>
            Close
          </button>
        </footer>
      </div>

      {editing && (
        <TaskFormModal
          initialTask={editing}
          onUpdate={async (updated) => {
            setError(null);
            setIsSaving(true);
            try {
              if (onEdit) {
                await Promise.resolve(onEdit(updated));
              } else if (localUpdateTask) {
                await Promise.resolve(localUpdateTask(updated));
              } else {
                console.warn("No update handler available for task update.");
              }
              setEditing(null);
            } catch (err) {
              console.error("Failed to update task:", err);
              setError("Update failed. Check console for details.");
            } finally {
              setIsSaving(false);
            }
          }}
          onClose={() => setEditing(null)}
          saving={isSaving}
        />
      )}

      {viewing && (
        <TaskDetailModal
          task={viewing}
          onClose={() => setViewing(null)}
          onEdit={(t) => {
            setViewing(null);
            setEditing(t);
          }}
        />
      )}
    </div>
  );
}
