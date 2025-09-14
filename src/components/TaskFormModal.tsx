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
  onAdd?: (task: Omit<Task, "id">) => void;
  onUpdate?: (task: Task) => void;
  onClose: () => void;
  initialTask?: Task | null;
}

const MAX_TITLE = 80;

export default function TaskFormModal({
  onAdd,
  onUpdate,
  onClose,
  initialTask = null,
}: Props) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(
    initialTask?.description ?? ""
  );
  const [dueDateTime, setDueDateTime] = useState<string>(() => {
    if (initialTask?.dueDate)
      return toLocalInputValue(new Date(initialTask.dueDate));
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return toLocalInputValue(d);
  });
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    initialTask?.priority ?? "medium"
  );
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
  }, [onClose]);

  const previewColumn = (() => {
    try {
      const parsed = parseLocalInputToDate(dueDateTime);
      return getColumnFromDueDate(parsed);
    } catch {
      return "today";
    }
  })();

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
      setError("Title cannot be empty.");
      titleRef.current?.focus();
      return;
    }
    if (title.trim().length > MAX_TITLE) {
      setError(`Title is too long (max ${MAX_TITLE} characters).`);
      titleRef.current?.focus();
      return;
    }
    if (!dueDateTime) {
      setError("Please choose date & time.");
      return;
    }

    const parsedLocalDate = parseLocalInputToDate(dueDateTime);
    const dueIso = parsedLocalDate.toISOString();

    if (initialTask && onUpdate) {
      const updated: Task = {
        ...initialTask,
        title: title.trim(),
        description: description.trim(),
        dueDate: dueIso,
        priority,
        updatedAt: new Date().toISOString(),
      };
      onUpdate(updated);
    } else if (onAdd) {
      onAdd({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueIso,
        priority,
        createdAt: new Date().toISOString(),
        completed: false,
      });
    }

    onClose();
  };

  const onPasteTitle = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text");
    const allowed = MAX_TITLE - title.length;
    if (paste.length > allowed) {
      e.preventDefault();
      const trimmed = paste.slice(0, allowed);
      const newVal = (title + trimmed).slice(0, MAX_TITLE);
      setTitle(newVal);
    }
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
            {initialTask ? "Edit task" : "Add task"}
          </h3>

          <div className={styles.badgeWrap}>
            <span className={`${styles.columnBadge} ${styles[previewColumn]}`}>
              {previewColumn === "today"
                ? "Today"
                : previewColumn === "future"
                ? "Future"
                : "Past"}
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
            Title
            <input
              ref={titleRef}
              type="text"
              placeholder="Write a short title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
              onPaste={onPasteTitle}
              className={styles.input}
              maxLength={MAX_TITLE}
              aria-describedby="title-help"
            />
            <div className={styles.titleRow}>
              <div id="title-help" className={styles.smallMeta}>
                <small>
                  {title.length}/{MAX_TITLE}
                </small>
              </div>
              {title.length >= MAX_TITLE - 10 && (
                <div className={styles.smallWarn}>
                  <small>Almost at limit</small>
                </div>
              )}
            </div>
          </label>

          <label className={styles.label}>
            Description
            <textarea
              placeholder="Describe your task (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              rows={4}
            />
          </label>

          <div className={styles.row}>
            <label className={styles.label}>
              Date & Time
              <input
                type="datetime-local"
                value={dueDateTime}
                onChange={(e) => setDueDateTime(e.target.value)}
                className={styles.input}
              />
              <div className={styles.smallMeta}>
                <small>Preview: {previewFormatted}</small>
              </div>
            </label>

            <label className={styles.label}>
              Priority
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
              {initialTask ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Close (Esc)
            </button>
          </div>
        </form>

        <footer className={styles.footer}>
          <small>
            Tip: Press <kbd>Esc</kbd> to close, <kbd>Ctrl/⌘ + S</kbd> to save.
          </small>
        </footer>
      </div>
    </div>
  );
}
