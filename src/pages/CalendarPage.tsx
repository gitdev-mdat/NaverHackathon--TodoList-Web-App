import { useMemo, useState } from "react";
import styles from "../styles/CalendarPage.module.css";
import CalendarDayDot from "../components/CalendarDayDot";
import DayTasksModal from "../components/DayTasksModal";
import QuickCreateModal from "../components/QuickCreateModal";
import useTasks from "../hooks/useTasks";
import type { Task } from "../types/Task";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
// function endOfMonth(d: Date) {
//   return new Date(d.getFullYear(), d.getMonth() + 1, 0);
// }
function startOfWeekMon(d: Date) {
  // Monday start
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  const res = new Date(d);
  res.setDate(d.getDate() + diff);
  res.setHours(0, 0, 0, 0);
  return res;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Determine if task occurs on given day (local) */
function taskOccursOnDay(task: Task, day: Date) {
  try {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    if (task.allDay) {
      const start = new Date(task.dueDate);
      const end = task.endDate
        ? new Date(task.endDate)
        : new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
      // task spans [start, end) — check overlap
      return start < dayEnd && end > dayStart;
    } else {
      const start = new Date(task.dueDate);
      const end = task.endDate
        ? new Date(task.endDate)
        : new Date(start.getTime() + 1);
      return start < dayEnd && end > dayStart;
    }
  } catch {
    return false;
  }
}

export default function CalendarPage() {
  const { tasks, addTask, updateTask } = useTasks(); // assumed default export hook
  const [cursor, setCursor] = useState<Date>(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showCreateForDay, setShowCreateForDay] = useState<Date | null>(null);
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  const monthStart = startOfMonth(cursor);
  // const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeekMon(monthStart);
  // build 6 weeks grid (6*7 = 42 cells)
  const grid: Date[] = [];
  for (let i = 0; i < 42; i++) {
    grid.push(addDays(gridStart, i));
  }

  // map dayKey -> tasks[]
  const dayTaskMap = useMemo(() => {
    const m = new Map<string, Task[]>();
    (tasks || []).forEach((t) => {
      // for each day in grid, check overlap
      grid.forEach((d) => {
        if (taskOccursOnDay(t, d)) {
          const k = dayKey(d);
          if (!m.has(k)) m.set(k, []);
          m.get(k)!.push(t);
        }
      });
    });
    return m;
  }, [tasks, grid]);

  const prevMonth = () => {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() - 1);
    setCursor(d);
  };
  const nextMonth = () => {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() + 1);
    setCursor(d);
  };
  const goToday = () => setCursor(new Date());

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <button
            onClick={prevMonth}
            className={styles.iconBtn}
            aria-label="Previous month"
          >
            ‹
          </button>
          <button onClick={goToday} className={styles.todayBtn}>
            Today
          </button>
          <button
            onClick={nextMonth}
            className={styles.iconBtn}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
        <h2 className={styles.title}>
          {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
        </h2>
        <div className={styles.controls}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
            />
            <span>Show completed</span>
          </label>
        </div>
      </div>

      <div className={styles.calendarGrid}>
        {/* weekday headers */}
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
          <div key={w} className={styles.weekdayCell}>
            {w}
          </div>
        ))}

        {grid.map((d) => {
          const key = dayKey(d);
          const dayTasks = dayTaskMap.get(key) || [];
          const visibleTasks = showCompleted
            ? dayTasks
            : dayTasks.filter((t) => !t.completed);
          const isThisMonth = d.getMonth() === monthStart.getMonth();
          const isToday = isSameDay(d, new Date());

          return (
            <button
              key={key}
              className={`${styles.dayCell} ${
                isThisMonth ? "" : styles.outsideMonth
              } ${isToday ? styles.today : ""}`}
              onClick={() => setSelectedDay(d)}
              aria-label={`Open tasks for ${d.toDateString()}`}
            >
              <div className={styles.dayNumberRow}>
                <span className={styles.dayNumber}>{d.getDate()}</span>

                <button
                  className={styles.quickCreateBtn}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setShowCreateForDay(d);
                  }}
                  aria-label="Create task on this day"
                >
                  ＋
                </button>
              </div>

              <div className={styles.dotsRow}>
                <CalendarDayDot tasks={visibleTasks} maxDots={3} />
              </div>
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <DayTasksModal
          day={selectedDay}
          tasks={(dayTaskMap.get(dayKey(selectedDay)) || []).filter((t) =>
            showCompleted ? true : !t.completed
          )}
          onClose={() => setSelectedDay(null)}
          onEdit={async (task: Task) => {
            try {
              await Promise.resolve(updateTask?.(task));
            } catch (err) {
              console.error("CalendarPage: updateTask failed", err);
            }
          }}
        />
      )}

      {showCreateForDay && (
        <QuickCreateModal
          day={showCreateForDay}
          onClose={() => setShowCreateForDay(null)}
          onCreate={(partial) => {
            const now = new Date();
            const due = new Date(showCreateForDay);
            due.setHours(partial.allDay ? 0 : 9, 0, 0, 0); // default 09:00 for timed
            let endISO: string | undefined;
            if (partial.allDay) {
              const end = new Date(due);
              end.setDate(end.getDate() + 1); // exclusive
              endISO = end.toISOString();
            } else if (partial.endDate) {
              endISO = partial.endDate;
            }
            const toAdd: Omit<Task, "id"> = {
              title:
                partial.title || (partial.allDay ? "Deadline" : "Work session"),
              description: partial.description || "",
              dueDate: due.toISOString(),
              endDate: endISO,
              allDay: !!partial.allDay,
              priority: partial.priority || "medium",
              createdAt: now.toISOString(),
              completed: false,
            };
            addTask?.(toAdd);
            setShowCreateForDay(null);
          }}
        />
      )}
    </div>
  );
}
