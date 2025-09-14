import { useEffect, useRef, useState } from "react";
import type { Task } from "../types/Task";
import styles from "../styles/TaskFormModal.module.css";
import {
  getColumnFromDueDate,
  formatLocalDateTime,
  toLocalInputValue,
  parseLocalInputToDate,
} from "../utils/date";

interface Props {
  onAdd: (task: Omit<Task, "id">) => void;
  onClose: () => void;
  defaultColumn?: "today" | "future" | "past";
}

export default function TaskFormModal({
  onAdd,
  onClose,
  defaultColumn = "today",
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [dueDateTime, setDueDateTime] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return toLocalInputValue(d);
  });
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [error, setError] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSubmit(new Event("submit") as unknown as React.FormEvent);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // preview column based on parsed local Date
  const previewColumn = (() => {
    try {
      const parsed = parseLocalInputToDate(dueDateTime);
      return getColumnFromDueDate(parsed);
    } catch {
      return defaultColumn;
    }
  })();

  // preview formatted date
  const previewFormatted = (() => {
    try {
      const parsed = parseLocalInputToDate(dueDateTime);
      return formatLocalDateTime(parsed.toISOString());
    } catch {
      return "";
    }
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Tiêu đề không được để trống.");
      titleRef.current?.focus();
      return;
    }
    if (!dueDateTime) {
      setError("Vui lòng chọn ngày & thời gian.");
      return;
    }
    const parsedLocalDate = parseLocalInputToDate(dueDateTime);
    const dueIso = parsedLocalDate.toISOString();

    onAdd({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueIso,
      priority,
      createdAt: new Date().toISOString(),
      completed: false,
    } as Omit<Task, "id">);

    onClose();
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-task-title"
    >
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h3 id="add-task-title" className={styles.title}>
            Thêm task
          </h3>

          <div className={styles.badgeWrap}>
            <span className={`${styles.columnBadge} ${styles[previewColumn]}`}>
              {previewColumn === "today"
                ? "📅 Hôm nay"
                : previewColumn === "future"
                ? "🔮 Tương lai"
                : "⏳ Quá khứ"}
            </span>
          </div>

          <button
            aria-label="Close"
            className={styles.closeBtn}
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Tiêu đề <span className={styles.required}>*</span>
            <input
              ref={titleRef}
              type="text"
              placeholder="Viết tiêu đề ngắn gọn..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Mô tả
            <textarea
              placeholder="Mô tả chi tiết (tùy chọn)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              rows={4}
            />
          </label>

          <div className={styles.row}>
            <label className={styles.labelInline}>
              Ngày & giờ
              <input
                type="datetime-local"
                value={dueDateTime}
                onChange={(e) => setDueDateTime(e.target.value)}
                className={styles.input}
              />
              <div className={styles.smallMeta}>
                <small>Hiển thị tương đương: {previewFormatted}</small>
              </div>
            </label>

            <label className={styles.labelInline}>
              Ưu tiên
              <div className={styles.segment}>
                <button
                  type="button"
                  className={`${styles.segmentBtn} ${
                    priority === "low" ? styles.active : ""
                  }`}
                  onClick={() => setPriority("low")}
                >
                  Low
                </button>
                <button
                  type="button"
                  className={`${styles.segmentBtn} ${
                    priority === "medium" ? styles.active : ""
                  }`}
                  onClick={() => setPriority("medium")}
                >
                  Medium
                </button>
                <button
                  type="button"
                  className={`${styles.segmentBtn} ${
                    priority === "high" ? styles.active : ""
                  }`}
                  onClick={() => setPriority("high")}
                >
                  High
                </button>
              </div>
            </label>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>
              Lưu (Enter)
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Hủy (Esc)
            </button>
          </div>
        </form>

        <footer className={styles.footer}>
          <small>
            Tip: Nhấn <kbd>Esc</kbd> để đóng, <kbd>Ctrl/⌘ + S</kbd> để lưu
            nhanh. Hệ thống tự phân cột dựa trên ngày bạn chọn.
          </small>
        </footer>
      </div>
    </div>
  );
}
