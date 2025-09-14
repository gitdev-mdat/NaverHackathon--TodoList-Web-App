export type ColumnKey = "today" | "future" | "past";

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

export function formatLocalDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const dd = pad(d.getDate());
  const mmth = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${hh}:${mm} — ${dd}/${mmth}/${yyyy}`;
}

//   Helpers for datetime-local input (local timezone)
export function toLocalInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// Parse "YYYY-MM-DDTHH:MM" into local Date object (not UTC).

export function parseLocalInputToDate(value: string) {
  const [datePart, timePart = "00:00"] = value.split("T");
  const [y, m, day] = datePart.split("-").map((v) => parseInt(v, 10));
  const [hh, mm] = timePart.split(":").map((v) => parseInt(v, 10));
  return new Date(y, (m || 1) - 1, day || 1, hh || 0, mm || 0, 0, 0);
}
