// src/hooks/useTasks.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Task, Priority } from "../types/Task";

const STORAGE_KEY = "tasks_v1";

type NewTask = Omit<Task, "id">;

function migrateRawToTask(o: any): Task {
  return {
    id: o?.id ?? String(Date.now()),
    title: String(o?.title ?? ""),
    description: o?.description ?? undefined,
    dueDate: o?.dueDate ?? new Date().toISOString(),
    endDate: o?.endDate ?? undefined,
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
      // ignore storage errors
    }
  }, [tasks]);

  const addTask = useCallback((payload: NewTask) => {
    const newTask: Task = {
      ...payload,
      id: String(Date.now()),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((updated: Task) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? { ...updated, updatedAt: new Date().toISOString() }
          : t
      )
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
    setTasks(next.map(migrateRawToTask));
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
