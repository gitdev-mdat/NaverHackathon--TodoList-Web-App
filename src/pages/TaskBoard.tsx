// components/TaskBoard.tsx
import { useEffect, useMemo, useState } from "react";
import TaskItem from "../components/TaskItem";
import TaskFormModal from "../components/TaskFormModal";
import type { Task } from "../types/Task";
import styles from "../styles/TaskBoard.module.css";
import { getColumnFromDueDate } from "../utils/date";

const STORAGE_KEY = "tasks_v1";

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? (JSON.parse(s) as Task[]) : [];
    } catch {
      return [];
    }
  });
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const handleAddTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: String(Date.now()),
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    setShowModal(false);
  };

  const handleToggleComplete = (id: string) => {
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
  };

  const handleDelete = (id: string) => {
    if (!confirm("Xóa task này?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // filtered + search
  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (priorityFilter !== "all" && t.priority !== priorityFilter)
        return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !(t.description || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [tasks, search, priorityFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const na = new Date(a.dueDate).getTime();
      const nb = new Date(b.dueDate).getTime();
      return sortAsc ? na - nb : nb - na;
    });
  }, [filtered, sortAsc]);

  // group by column using utils
  const todayTasks = sorted.filter(
    (t) => getColumnFromDueDate(t.dueDate) === "today" && !t.completed
  );
  const futureTasks = sorted.filter(
    (t) => getColumnFromDueDate(t.dueDate) === "future" && !t.completed
  );
  const pastTasks = sorted.filter(
    (t) => getColumnFromDueDate(t.dueDate) === "past" && !t.completed
  );

  // counts (including completed hidden? we show only active counts)
  const counts = {
    today: todayTasks.length,
    future: futureTasks.length,
    past: pastTasks.length,
    completed: tasks.filter((t) => t.completed).length,
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <h2 className={styles.title}>📝 Task Board</h2>
          <div className={styles.searchWrap}>
            <input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.search}
            />
            <button
              className={styles.clear}
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          </div>
          <select
            className={styles.filter}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
          >
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button
            className={styles.sortBtn}
            onClick={() => setSortAsc((s) => !s)}
            title="Toggle sort"
          >
            {sortAsc ? "Sort ↑" : "Sort ↓"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className={styles.countBadge}>
            Active: {counts.today + counts.future + counts.past}
          </div>
          <button
            className={styles.globalAddBtn}
            onClick={() => setShowModal(true)}
          >
            + Task
          </button>
        </div>
      </div>

      <div className={styles.board}>
        {/* Today */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>
            📅 Hôm nay <span className={styles.colCount}>{counts.today}</span>
          </h3>
          {todayTasks.length === 0 && (
            <p className={styles.empty}>Không có task hôm nay 🎉</p>
          )}
          {todayTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleComplete}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Future */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>
            🔮 Tương lai{" "}
            <span className={styles.colCount}>{counts.future}</span>
          </h3>
          {futureTasks.length === 0 && (
            <p className={styles.empty}>Chưa có task tương lai</p>
          )}
          {futureTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleComplete}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Past */}
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>
            ⏳ Quá khứ <span className={styles.colCount}>{counts.past}</span>
          </h3>
          {pastTasks.length === 0 && (
            <p className={styles.empty}>Không có task trễ hạn 🎉</p>
          )}
          {pastTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleComplete}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <TaskFormModal
          onAdd={handleAddTask}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
