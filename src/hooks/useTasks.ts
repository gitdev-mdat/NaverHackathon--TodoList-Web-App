import { useCallback, useEffect, useMemo, useState } from "react";
import type { Task, Priority } from "../types/Task";

const STORAGE_KEY = "tasks_v1";

type NewTask = Omit<Task, "id">;

function migrateRawToTask(o: any): Task {
  const due = o?.dueDate ?? new Date().toISOString();
  const end = o?.endDate ?? due;
  return {
    id: String(o?.id ?? Date.now()),
    title: String(o?.title ?? ""),
    description: o?.description ?? undefined,
    dueDate: String(due),
    endDate: end ? String(end) : undefined,
    allDay: typeof o?.allDay === "boolean" ? o.allDay : false,
    completed: !!o?.completed,
    createdAt: o?.createdAt ?? new Date().toISOString(),
    updatedAt: o?.updatedAt ?? undefined,
    priority: (o?.priority as Priority) ?? "medium",
  };
}

export default function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (!s) return [];
      const raw = JSON.parse(s);
      if (!Array.isArray(raw)) return [];
      return raw.map(migrateRawToTask);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  const addTask = useCallback((payload: NewTask) => {
    const now = new Date().toISOString();
    const due = payload.dueDate ?? now;
    const newTask: Task = {
      ...payload,
      id: String(Date.now()),
      dueDate: String(due),
      endDate: payload.endDate ?? String(due),
      allDay: typeof payload.allDay === "boolean" ? payload.allDay : false,
      completed:
        typeof payload.completed === "boolean" ? payload.completed : false,
      createdAt: payload.createdAt ?? now,
      updatedAt: now,
      priority: (payload.priority as Priority) ?? "medium",
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((updated: Task) => {
    const normalized: Task = {
      ...updated,
      dueDate: String(updated.dueDate),
      endDate: updated.endDate ?? String(updated.dueDate),
      allDay: typeof updated.allDay === "boolean" ? updated.allDay : false,
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) =>
      prev.map((t) => (t.id === normalized.id ? normalized : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  }, []);

  const replaceAll = useCallback((next: Task[]) => {
    try {
      setTasks(next.map(migrateRawToTask));
    } catch {
      // ignore invalid payload
    }
  }, []);

  const getById = useCallback(
    (id: string) => tasks.find((t) => t.id === id) ?? null,
    [tasks]
  );

  const counts = useMemo(() => {
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      active: tasks.filter((t) => !t.completed).length,
    };
  }, [tasks]);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    replaceAll,
    getById,
    counts,
  } as const;
}
