import { useEffect, useRef, useState } from "react";
import type { Task } from "../types/Task";
import styles from "../styles/TaskFormModal.module.css";
import {
  getColumnFromDueDate,
  formatLocalDateTime,
  toLocalInputValue,
  normalizeAllDayRange,
  parseLocalInputToDate,
} from "../utils/date";

interface Props {
  onAdd?: (task: Omit<Task, "id">) => void;
  onUpdate?: (task: Task) => void;
  onClose: () => void;
  initialTask?: Task | null;
  saving?: boolean;
}

const MAX_TITLE = 80;

function dateOnlyFromISO(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`; // yyyy-mm-dd
}

export default function TaskFormModal({
  onAdd,
  onUpdate,
  onClose,
  initialTask = null,
  saving = false,
}: Props) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(
    initialTask?.description ?? ""
  );
  const [allDay, setAllDay] = useState<boolean>(!!initialTask?.allDay);

  const [dueDateTime, setDueDateTime] = useState<string>(() => {
    if (initialTask?.dueDate) {
      return initialTask?.allDay
        ? dateOnlyFromISO(initialTask.dueDate)
        : toLocalInputValue(new Date(initialTask.dueDate));
    }
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return toLocalInputValue(d);
  });

  const [endDateTime, setEndDateTime] = useState<string>(() => {
    if (initialTask?.endDate) {
      return initialTask?.allDay
        ? dateOnlyFromISO(initialTask.endDate)
        : toLocalInputValue(new Date(initialTask.endDate));
    }
    return "";
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

  const handleAllDayToggle = (checked: boolean) => {
    if (checked) {
      // convert any datetime-local -> date-only yyyy-mm-dd
      if (dueDateTime.includes("T")) {
        try {
          const d = parseLocalInputToDate(dueDateTime);
          setDueDateTime(dateOnlyFromISO(d.toISOString()));
        } catch {
          // fallback: keep original if parse fails
        }
      }
      if (endDateTime.includes("T")) {
        try {
          const e = parseLocalInputToDate(endDateTime);
          setEndDateTime(dateOnlyFromISO(e.toISOString()));
        } catch {}
      }
    } else {
      if (!dueDateTime.includes("T") && dueDateTime) {
        const d = new Date(dueDateTime + "T09:00"); // default 09:00 local
        setDueDateTime(toLocalInputValue(d));
      }
      if (!endDateTime.includes("T") && endDateTime) {
        const e = new Date(endDateTime + "T17:00"); // default 17:00 local
        setEndDateTime(toLocalInputValue(e));
      }
    }
    setAllDay(checked);
    setError(null);
  };

  const previewColumn = (() => {
    try {
      const parsed = allDay
        ? dueDateTime.includes("T")
          ? parseLocalInputToDate(dueDateTime)
          : new Date(`${dueDateTime}T00:00`)
        : parseLocalInputToDate(dueDateTime);
      return getColumnFromDueDate(parsed);
    } catch {
      return "today";
    }
  })();

  const previewFormatted = (() => {
    try {
      const start = allDay
        ? dueDateTime.includes("T")
          ? parseLocalInputToDate(dueDateTime)
          : new Date(`${dueDateTime}T00:00`)
        : parseLocalInputToDate(dueDateTime);

      const end = endDateTime
        ? allDay
          ? endDateTime.includes("T")
            ? parseLocalInputToDate(endDateTime)
            : new Date(`${endDateTime}T00:00`)
          : parseLocalInputToDate(endDateTime)
        : undefined;

      if (!end) return formatLocalDateTime(start.toISOString());
      return `${formatLocalDateTime(
        start.toISOString()
      )} → ${formatLocalDateTime(end.toISOString())}`;
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
      setError(`Title too long (max ${MAX_TITLE}).`);
      titleRef.current?.focus();
      return;
    }
    if (!dueDateTime) {
      setError("Please pick start date/time.");
      return;
    }

    let startISO: string;
    let endISO: string | undefined;

    try {
      if (allDay) {
        const s = dueDateTime.includes("T")
          ? parseLocalInputToDate(dueDateTime)
          : new Date(dueDateTime + "T00:00");
        if (!isFinite(s.getTime())) throw new Error("invalid start date");
        startISO = s.toISOString();

        if (endDateTime) {
          const e = endDateTime.includes("T")
            ? parseLocalInputToDate(endDateTime)
            : new Date(endDateTime + "T00:00");
          if (!isFinite(e.getTime())) throw new Error("invalid end date");
          // endExclusive = next day midnight
          const endExclusive = new Date(e);
          endExclusive.setDate(endExclusive.getDate() + 1);
          endISO = endExclusive.toISOString();
        } else {
          const { endISO: n } = normalizeAllDayRange(new Date(startISO));
          endISO = n;
        }
      } else {
        const s = parseLocalInputToDate(dueDateTime);
        if (!isFinite(s.getTime())) throw new Error("invalid start");
        startISO = s.toISOString();
        if (endDateTime) {
          const e = parseLocalInputToDate(endDateTime);
          if (!isFinite(e.getTime())) throw new Error("invalid end");
          if (e.getTime() < s.getTime()) {
            setError("End must be after start.");
            return;
          }
          endISO = e.toISOString();
        }
      }
    } catch {
      setError("Invalid date/time input.");
      return;
    }

    if (initialTask && onUpdate) {
      const updated: Task = {
        ...initialTask,
        title: title.trim(),
        description: description.trim(),
        dueDate: startISO,
        endDate: endISO,
        allDay,
        priority,
        updatedAt: new Date().toISOString(),
      };
      onUpdate(updated);
    } else if (onAdd) {
      onAdd({
        title: title.trim(),
        description: description.trim(),
        dueDate: startISO,
        endDate: endISO,
        allDay,
        priority,
        createdAt: new Date().toISOString(),
        completed: false,
      });
    }

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
              className={styles.input}
              maxLength={MAX_TITLE}
            />
            <div className={styles.titleRow}>
              <div className={styles.smallMeta}>
                <small>
                  {title.length}/{MAX_TITLE}
                </small>
              </div>
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

          {/* CONTROLS ROW: all-day toggle (left) + priority (right) */}
          <div
            className={styles.row}
            style={{ alignItems: "center", gap: 16, marginTop: 6 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                id="allDay"
                type="checkbox"
                checked={allDay}
                onChange={(e) => handleAllDayToggle(e.target.checked)}
              />
              <label
                htmlFor="allDay"
                style={{ fontSize: 13, userSelect: "none" }}
              >
                All day
              </label>
            </div>

            <div style={{ marginLeft: "auto" }}>
              <label style={{ display: "block" }}>
                Priority
                <div className={styles.segment} style={{ marginTop: 6 }}>
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
          </div>
          {/* START ROW: start input (full width) */}
          <div className={styles.row}>
            <label className={styles.label} style={{ flex: 1 }}>
              {allDay ? "Date (all-day)" : "Start (date & time)"}
              {allDay ? (
                <input
                  type="date"
                  value={dueDateTime}
                  onChange={(e) => setDueDateTime(e.target.value)}
                  className={styles.input}
                />
              ) : (
                <input
                  type="datetime-local"
                  value={dueDateTime}
                  onChange={(e) => setDueDateTime(e.target.value)}
                  className={styles.input}
                />
              )}
              <div className={styles.smallMeta}>
                <small>Preview: {previewFormatted}</small>
              </div>
            </label>
          </div>

          {/* END ROW */}
          <div className={styles.row} style={{ marginTop: 6 }}>
            <label className={styles.label} style={{ flex: 1 }}>
              {allDay ? "End date (optional)" : "End (optional)"}
              {allDay ? (
                <input
                  type="date"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className={styles.input}
                />
              ) : (
                <input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  className={styles.input}
                />
              )}
              <div className={styles.smallMeta}>
                <small>
                  {endDateTime
                    ? `Preview end: ${
                        allDay
                          ? formatLocalDateTime(
                              new Date(`${endDateTime}T00:00`).toISOString()
                            )
                          : (() => {
                              try {
                                return formatLocalDateTime(
                                  parseLocalInputToDate(
                                    endDateTime
                                  ).toISOString()
                                );
                              } catch {
                                return "";
                              }
                            })()
                      }`
                    : "No end set"}
                </small>
              </div>
            </label>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving
                ? initialTask
                  ? "Updating..."
                  : "Saving..."
                : initialTask
                ? "Update"
                : "Save"}
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
