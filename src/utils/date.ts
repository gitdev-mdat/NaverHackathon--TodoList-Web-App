import type { Task } from "../types/Task";

export type ColumnKey = "today" | "future" | "past";

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

// Convert a Date -> "YYYY-MM-DDTHH:MM" (local) for <input type="datetime-local">
export function toLocalInputValue(d: Date) {
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hour}:${min}`;
}

// Parse "YYYY-MM-DDTHH:MM" (from datetime-local) -> Date in local time
export function parseLocalInputToDate(value: string) {
  if (!value) throw new Error("Invalid datetime value");
  if (value.includes("Z") || value.includes("+")) return new Date(value);
  const parts = value.split("T");
  if (parts.length !== 2) return new Date(value);
  const [y, m, d] = parts[0].split("-").map(Number);
  const [hh, mm] = parts[1].split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
}

// Format ISO -> "HH:MM — DD/MM/YYYY" (local)
export function formatLocalDateTime(iso: string) {
  const d = new Date(iso);
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const dd = pad(d.getDate());
  const mmth = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${hh}:${mm} — ${dd}/${mmth}/${yyyy}`;
}

// midnight local timestamp (ms)
export function localMidnightTs(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function getColumnFromDueDate(due: string | Date): ColumnKey {
  const dueDate = typeof due === "string" ? new Date(due) : new Date(due);
  const today = new Date();
  const dueTs = localMidnightTs(dueDate);
  const todayTs = localMidnightTs(today);
  if (dueTs === todayTs) return "today";
  if (dueTs > todayTs) return "future";
  return "past";
}

export function normalizeAllDayRange(start: Date) {
  const startCopy = new Date(start);
  startCopy.setHours(0, 0, 0, 0);
  const end = new Date(startCopy);
  end.setDate(end.getDate() + 1);
  end.setHours(0, 0, 0, 0);
  return { startISO: startCopy.toISOString(), endISO: end.toISOString() };
}

// Map Task -> FullCalendar event-like object
export function taskToEvent(task: Task) {
  return {
    id: task.id,
    title: task.title,
    start: task.dueDate,
    end: task.endDate ?? undefined,
    allDay: !!task.allDay,
    extendedProps: {
      priority: task.priority,
      completed: task.completed,
      description: task.description,
    },
  };
}

export function eventToTaskUpdate(event: {
  id?: string;
  start?: Date | null;
  end?: Date | null;
  allDay?: boolean;
}) {
  if (!event.id) throw new Error("missing event.id");
  const startISO = event.start ? event.start.toISOString() : undefined;
  const endISO = event.end ? event.end.toISOString() : undefined;
  return {
    id: event.id,
    dueDate: startISO,
    endDate: endISO,
    allDay: !!event.allDay,
  } as Partial<Task> & { id: string };
}
