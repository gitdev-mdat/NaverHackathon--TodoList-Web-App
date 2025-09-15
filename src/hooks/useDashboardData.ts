import { useMemo } from "react";
import useTasks from "./useTasks";
import type { Task } from "../types/Task";

function formatDateYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = startOfDay(d);
  x.setDate(x.getDate() + 1);
  return x;
}

function taskOccursOnDay(task: Task, day: Date) {
  try {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const s = new Date(task.dueDate);
    const e = task.endDate ? new Date(task.endDate) : new Date(s.getTime() + 1);
    return s < dayEnd && e > dayStart;
  } catch {
    return false;
  }
}

export default function useDashboardData(opts?: {
  heatmapDays?: number;
  trendDays?: number;
}) {
  const { tasks } = useTasks();
  const heatmapDays = opts?.heatmapDays ?? 120;
  const trendDays = opts?.trendDays ?? 30;

  const now = new Date();

  return useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = total - completed;
    const overdue = tasks.filter((t) => {
      try {
        if (t.completed) return false;
        const due = new Date(t.dueDate);
        return due < now;
      } catch {
        return false;
      }
    }).length;

    // heatmap: build last N days
    const heatmap: { date: string; count: number; completed: number }[] = [];
    for (let i = heatmapDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = formatDateYMD(d);
      const dayTasks = tasks.filter((t) => taskOccursOnDay(t, d));
      heatmap.push({
        date: dateKey,
        count: dayTasks.length,
        completed: dayTasks.filter((t) => t.completed).length,
      });
    }

    // trend last M days: tasks created vs completed per day (by createdAt and updatedAt)
    const trend: { date: string; created: number; completed: number }[] = [];
    for (let i = trendDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = formatDateYMD(d);
      const created = tasks.filter((t) => {
        try {
          return formatDateYMD(new Date(t.createdAt)) === dateKey;
        } catch {
          return false;
        }
      }).length;
      const completedCount = tasks.filter((t) => {
        try {
          // if completed true and updatedAt on that day (fallback)
          return (
            t.completed &&
            t.updatedAt &&
            formatDateYMD(new Date(t.updatedAt)) === dateKey
          );
        } catch {
          return false;
        }
      }).length;
      trend.push({ date: dateKey, created, completed: completedCount });
    }

    // perfect days: days where there is at least 1 task, and all tasks in that day are completed
    const perfectDays = heatmap.filter(
      (h) => h.count > 0 && h.count === h.completed
    ).length;

    // recent activity (last 20): gather created / updated events from tasks
    type Activity = {
      id: string;
      type: "created" | "updated" | "completed";
      when: string;
      taskId: string;
      title: string;
    };
    const activities: Activity[] = [];
    tasks.forEach((t) => {
      if (t.createdAt)
        activities.push({
          id: `${t.id}-c`,
          type: "created",
          when: t.createdAt,
          taskId: t.id,
          title: t.title,
        });
      if (t.updatedAt) {
        const typ = t.completed ? "completed" : "updated";
        activities.push({
          id: `${t.id}-u`,
          type: typ,
          when: t.updatedAt,
          taskId: t.id,
          title: t.title,
        });
      }
    });
    activities.sort(
      (a, b) => new Date(b.when).getTime() - new Date(a.when).getTime()
    );
    const recent = activities.slice(0, 20);

    return {
      total,
      completed,
      active,
      overdue,
      perfectDays,
      heatmap,
      trend,
      recent,
      tasks,
    };
  }, [tasks, heatmapDays, trendDays, now]);
}
