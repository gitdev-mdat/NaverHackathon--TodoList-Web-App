import type { Task } from "../types/Task";

export type ColumnKey = "today" | "future" | "past";

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function toLocalInputValue(d: Date) {
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hour}:${min}`;
}

export function parseLocalInputToDate(value: string) {
  if (!value) throw new Error("Invalid datetime value");
  // If full ISO with Z/offset, let Date parse it
  if (value.includes("Z") || /[+\-]\d{2}:\d{2}$/.test(value))
    return new Date(value);
  const parts = value.split("T");
  if (parts.length !== 2) return new Date(value);
  const [y, m, d] = parts[0].split("-").map(Number);
  const [hh, mm] = parts[1].split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
}

export function formatLocalDateTime(iso: string) {
  const d = new Date(iso);
  if (!isFinite(d.getTime())) return "";
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const dd = pad(d.getDate());
  const mmth = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${hh}:${mm} — ${dd}/${mmth}/${yyyy}`;
}

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

export function taskToEvent(task: Task) {
  // Ensure start exists
  const start = task.dueDate;
  let end = task.endDate ?? undefined;

  // If allDay and no explicit end, make end = next day start
  if (task.allDay) {
    if (!end) {
      const s = new Date(task.dueDate);
      const r = normalizeAllDayRange(s);
      end = r.endISO;
      // for some calendars you may set allDay:true and end = next day
    }
  }

  return {
    id: task.id,
    title: task.title,
    start,
    end,
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
