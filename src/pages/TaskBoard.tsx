// components/TaskBoard.tsx
import { useEffect, useMemo, useState, useRef } from "react";
import TaskItem from "../components/TaskItem";
import TaskFormModal from "../components/TaskFormModal";
import type { Task } from "../types/Task";
import styles from "../styles/TaskBoard.module.css";
import { getColumnFromDueDate } from "../utils/date";

const STORAGE_KEY = "tasks_v1";

export default function TaskBoard() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const completedRef = useRef<HTMLDivElement | null>(null);

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? (JSON.parse(s) as Task[]) : [];
    } catch {
      return [];
    }
  });
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
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

  const updateHeights = () => {
    const wrapperEl = wrapperRef.current;
    if (!wrapperEl) return;
    const headerH = headerRef.current
      ? headerRef.current.getBoundingClientRect().height
      : 0;
    const completedH = completedRef.current
      ? completedRef.current.getBoundingClientRect().height
      : 0;
    const gap = 40;
    wrapperEl.style.setProperty("--header-height", `${Math.ceil(headerH)}px`);
    wrapperEl.style.setProperty(
      "--completed-height",
      `${Math.ceil(completedH)}px`
    );
    wrapperEl.style.setProperty("--bottom-gap", `${gap}px`);
  };

  useEffect(() => {
    updateHeights();
    const onResize = () => updateHeights();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => updateHeights());
    return () => cancelAnimationFrame(id);
  }, [showCompleted, tasks]);

  const handleAddTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: String(Date.now()),
      completed: false,
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    setShowModal(false);
  };

  const handleUpdateTask = (updated: Task) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === updated.id
          ? { ...updated, updatedAt: new Date().toISOString() }
          : t
      )
    );
    setEditingTask(null);
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

  const todayTasks = sorted.filter(
    (t) => getColumnFromDueDate(t.dueDate) === "today" && !t.completed
  );
  const futureTasks = sorted.filter(
    (t) => getColumnFromDueDate(t.dueDate) === "future" && !t.completed
  );
  const pastTasks = sorted.filter(
    (t) => getColumnFromDueDate(t.dueDate) === "past" && !t.completed
  );
  const completedTasks = sorted.filter((t) => t.completed);

  const counts = {
    today: todayTasks.length,
    future: futureTasks.length,
    past: pastTasks.length,
    completed: completedTasks.length,
  };

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div ref={headerRef} className={styles.header}>
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
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>
            📅 Today <span className={styles.colCount}>{counts.today}</span>
          </h3>
          {todayTasks.length === 0 && (
            <p className={styles.empty}>No tasks for today</p>
          )}
          {todayTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleComplete}
              onDelete={handleDelete}
              onEdit={(t) => setEditingTask(t)}
            />
          ))}
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>
            🔮 Future <span className={styles.colCount}>{counts.future}</span>
          </h3>
          {futureTasks.length === 0 && (
            <p className={styles.empty}>No upcoming tasks.</p>
          )}
          {futureTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleComplete}
              onDelete={handleDelete}
              onEdit={(t) => setEditingTask(t)}
            />
          ))}
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>
            ⏳ Pass <span className={styles.colCount}>{counts.past}</span>
          </h3>
          {pastTasks.length === 0 && (
            <p className={styles.empty}>No overdue tasks</p>
          )}
          {pastTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleComplete}
              onDelete={handleDelete}
              onEdit={(t) => setEditingTask(t)}
            />
          ))}
        </div>
      </div>

      <div
        ref={completedRef}
        style={{
          padding: 12,
          borderTop: "1px solid #eef2f7",
          background: "#fff",
        }}
      >
        <button
          onClick={() => setShowCompleted((s) => !s)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "#f1f5f9",
            border: "1px solid #e6e9ee",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {showCompleted ? "Hide" : "Show"} completed ({counts.completed})
        </button>

        {showCompleted && (
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            {completedTasks.length === 0 && (
              <div className={styles.empty}>Không có task đã hoàn thành</div>
            )}
            {completedTasks.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                onToggle={handleToggleComplete}
                onDelete={handleDelete}
                onEdit={(tt) => setEditingTask(tt)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <TaskFormModal
          onAdd={handleAddTask}
          onClose={() => setShowModal(false)}
        />
      )}

      {editingTask && (
        <TaskFormModal
          initialTask={editingTask}
          onUpdate={handleUpdateTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
