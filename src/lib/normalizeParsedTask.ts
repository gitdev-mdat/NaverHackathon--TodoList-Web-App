import type { Task, Priority } from "../types/Task";

type ParsedTask = {
  title: string;
  description?: string | null;
  priority?: Priority;
  allDay?: boolean;
  dueDate?: string | null;
  endDate?: string | null;
  tags?: string[];
};

export type NormalizeResult = {
  task?: Omit<Task, "id">;
  warnings: string[];
  error?: string;
};

function isISODateString(s?: string | null) {
  if (!s) return false;
  // simple check: contains T or looks like YYYY-MM-DD
  return /\d{4}-\d{2}-\d{2}/.test(s);
}

export function normalizeParsedTask(parsed: ParsedTask): NormalizeResult {
  const warnings: string[] = [];

  if (!parsed || !parsed.title || String(parsed.title).trim() === "") {
    return { warnings, error: "Missing title" };
  }

  const title = String(parsed.title).trim();
  const description = parsed.description ?? "";

  // priority
  const priority: Priority = ["low", "medium", "high"].includes(
    String(parsed.priority || "")
  )
    ? (parsed.priority as Priority)
    : "medium";

  if (!parsed.priority)
    warnings.push("Priority missing → default to 'medium'.");

  const allDay = !!parsed.allDay;

  let dueISO: string;
  let endISO: string | undefined = undefined;

  if (!parsed.dueDate) {
    // no due date provided: default behaviour — set to now (caller can override)
    const now = new Date();
    warnings.push("No due date provided → defaulting to now.");
    dueISO = now.toISOString();
    // if allDay, set exclusive end next day
    if (allDay) {
      const e = new Date(dueISO);
      e.setDate(e.getDate() + 1);
      endISO = e.toISOString();
    }
  } else {
    // we have some date string
    const d = parsed.dueDate;
    // If YYYY-MM-DD only (length 10), interpret as local date
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      if (allDay) {
        const dt = new Date(d + "T00:00:00");
        dueISO = dt.toISOString();
        // endExclusive next day
        const e = new Date(dueISO);
        e.setDate(e.getDate() + 1);
        endISO = e.toISOString();
      } else {
        // default 09:00 local
        const dt = new Date(d + "T09:00:00");
        dueISO = dt.toISOString();
      }
    } else if (isISODateString(d)) {
      try {
        const parsedDt = new Date(d);
        if (isNaN(parsedDt.getTime())) throw new Error("invalid date");
        dueISO = parsedDt.toISOString();
        if (parsed.endDate) {
          const parsedEnd = new Date(parsed.endDate);
          if (!isNaN(parsedEnd.getTime())) endISO = parsedEnd.toISOString();
        }
      } catch {
        warnings.push("Could not parse provided dueDate. Defaulting to now.");
        const now = new Date();
        dueISO = now.toISOString();
      }
    } else {
      warnings.push("Unsupported dueDate format; defaulting to now.");
      dueISO = new Date().toISOString();
    }
  }

  const task: Omit<Task, "id"> = {
    title,
    description,
    dueDate: dueISO,
    endDate: endISO,
    allDay,
    priority,
    createdAt: new Date().toISOString(),
    completed: false,
  };

  return { task, warnings };
}
