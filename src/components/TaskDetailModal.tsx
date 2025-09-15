import type { Task } from "../types/Task";
import modalStyles from "../styles/TaskFormModal.module.css";
import { formatLocalDateTime } from "../utils/date";

interface Props {
  task: Task;
  onClose: () => void;
  onEdit?: (t: Task) => void;
}

function formatDateOnly(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function TaskDetailModal({ task, onClose }: Props) {
  const startLabel = task.allDay
    ? `${formatDateOnly(task.dueDate)} (all day)`
    : formatLocalDateTime(task.dueDate);

  let endLabel: string | null = null;
  if (task.endDate) {
    if (task.allDay) {
      // if endDate stored as exclusive (next day 00:00), show inclusive last day
      const e = new Date(task.endDate);
      e.setDate(e.getDate() - 1);
      endLabel = `${formatDateOnly(e.toISOString())} (all day)`;
    } else {
      endLabel = formatLocalDateTime(task.endDate);
    }
  }

  const isCompleted = !!task.completed;

  return (
    <div
      className={modalStyles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-detail-title"
    >
      <div
        className={modalStyles.modal}
        style={{ width: 520, maxWidth: "95%" }}
      >
        <header className={modalStyles.modalHeader}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <h3 id="task-detail-title" className={modalStyles.title}>
              Task details
            </h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span
                style={{
                  fontWeight: 800,
                  textTransform: "capitalize",
                  padding: "6px 10px",
                  borderRadius: 10,
                  fontSize: 13,
                  background: isCompleted ? "#eef2ff" : "#fff7ed",
                  color: isCompleted ? "#1e3a8a" : "#92400e",
                  border: "1px solid rgba(2,6,23,0.04)",
                }}
              >
                {task.priority}
              </span>
              {isCompleted && (
                <span
                  style={{
                    background: "#ecfccb",
                    color: "#365314",
                    padding: "6px 8px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  Completed
                </span>
              )}
            </div>
          </div>

          <button
            aria-label="Close"
            className={modalStyles.closeBtn}
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div
          style={{
            paddingTop: 8,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, wordBreak: "break-word" }}>
            {task.title}
          </h2>

          <div
            style={{ color: "#475569", fontSize: 14, whiteSpace: "pre-wrap" }}
          >
            {task.description ? (
              task.description
            ) : (
              <i style={{ color: "#94a3b8" }}>No description</i>
            )}
          </div>

          <div className={modalStyles.metaGrid}>
            <div>
              <div className={modalStyles.metaLabel}>Start</div>
              <div className={modalStyles.metaValue}>{startLabel}</div>
            </div>

            <div>
              <div className={modalStyles.metaLabel}>End</div>
              <div className={modalStyles.metaValue}>{endLabel ?? "-"}</div>
            </div>

            <div>
              <div className={modalStyles.metaLabel}>Created</div>
              <div className={modalStyles.metaValue}>
                {task.createdAt ? formatLocalDateTime(task.createdAt) : "-"}
              </div>
            </div>

            <div>
              <div className={modalStyles.metaLabel}>Updated</div>
              <div className={modalStyles.metaValue}>
                {task.updatedAt ? formatLocalDateTime(task.updatedAt) : "-"}
              </div>
            </div>

            <div>
              <div className={modalStyles.metaLabel}>ID</div>
              <div className={modalStyles.metaValue} title={task.id}>
                {task.id.slice(0, 8)}…{/* short id; full on hover */}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            {/* <button
              type="button"
              className={modalStyles.saveBtn}
              onClick={() => {
                if (isCompleted) return;
                onEdit?.(task);
                onClose();
              }}
              disabled={isCompleted}
              title={
                isCompleted ? "Completed tasks are read-only" : "Edit task"
              }
            >
              Edit
            </button> */}

            <button
              type="button"
              className={modalStyles.cancelBtn}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
