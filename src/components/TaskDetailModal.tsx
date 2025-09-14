import React from "react";
import type { Task } from "../types/Task";
import modalStyles from "../styles/TaskFormModal.module.css";
import { formatLocalDateTime } from "../utils/date";

interface Props {
  task: Task;
  onClose: () => void;
  onEdit?: (t: Task) => void;
}

export default function TaskDetailModal({ task, onClose, onEdit }: Props) {
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
        <header
          className={modalStyles.modalHeader}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3 id="task-detail-title" className={modalStyles.title}>
            Chi tiết task
          </h3>
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
            padding: "6px 0 0 0",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18 }}>{task.title}</h2>
            <span
              style={{
                alignSelf: "flex-start",
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            >
              {task.priority}
            </span>
          </div>

          {task.description ? (
            <p style={{ margin: 0, color: "#334155", whiteSpace: "pre-wrap" }}>
              {task.description}
            </p>
          ) : (
            <p style={{ margin: 0, color: "#94a3b8" }}>
              <i>Không có mô tả</i>
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              color: "#475569",
              fontSize: 13,
            }}
          >
            <div>🕒 {formatLocalDateTime(task.dueDate)}</div>
            <div>🆔 {task.id}</div>
            <div>
              🗓 Tạo:{" "}
              {task.createdAt ? formatLocalDateTime(task.createdAt) : "-"}
            </div>
            <div>
              Cập nhật:{" "}
              {task.updatedAt ? formatLocalDateTime(task.updatedAt) : "-"}
            </div>
            <div>Trạng thái: {task.completed ? "Completed" : "Active"}</div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 6,
            }}
          >
            {onEdit && (
              <button
                type="button"
                className={modalStyles.saveBtn}
                onClick={() => {
                  onEdit(task);
                  onClose();
                }}
              >
                Edit
              </button>
            )}
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
