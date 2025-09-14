
import { useEffect, useMemo, useRef, useState } from "react";
import TaskItem from "../components/TaskItem";
import TaskFormModal from "../components/TaskFormModal";
import TaskDetailModal from "../components/TaskDetailModal";
import useTasks from "../hooks/useTasks";
import type { Task } from "../types/Task";
import styles from "../styles/TaskBoard.module.css";
import { getColumnFromDueDate } from "../utils/date";

export default function TaskBoard() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const completedRef = useRef<HTMLDivElement | null>(null);

  // use centralized hook
  const { tasks, addTask, updateTask, deleteTask, toggleComplete, counts } =
    useTasks();

  // local UI state
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewTask, setViewTask] = useState<Task | null>(null);
  const [showCompleted, setShowCompleted] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");
  const [sortAsc, setSortAsc] = useState(true);

  // calculate layout CSS vars (for column heights)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => updateHeights());
    return () => cancelAnimationFrame(id);
  }, [showCompleted, tasks, viewTask, editingTask]);

  // CRUD handlers mapped to hook
  const handleAddTask = (task: Omit<Task, "id">) => {
    addTask(task);
    setShowModal(false);
  };

  const handleUpdateTask = (updated: Task) => {
    updateTask(updated);
    setEditingTask(null);
  };

  const handleToggleComplete = (id: string) => {
    toggleComplete(id);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this task?")) return;
    deleteTask(id);
  };

  // filter / search / sort (UI-level)
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

  // column grouping
  const todayTasks = sorted.filter(
    (t) => getColumnFromDueDate(t.dueDate) === "today" && !t.completed
  );
  const futureTasks = sorted.filter(
    (t) => getColumnFromDueDate(t.dueDate) === "future" && !t.completed
  );
  const pastTasks = sorted.filter(
    (t) => getColumnFromDueDate(t.dueDate) === "past" && !t.completed
  );

  // completed tasks (show full history)
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <div ref={headerRef} className={styles.header}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <h2 className={styles.title}>📝 Task Board</h2>

          <div className={styles.searchWrap}>
            <input
              aria-label="Search tasks"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.search}
            />
            <button
              className={styles.clear}
              onClick={() => setSearch("")}
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          </div>

          <select
            aria-label="Filter by priority"
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
            Active: {counts.total - counts.completed}
          </div>
          <button
            className={styles.globalAddBtn}
            onClick={() => {
              setEditingTask(null);
              setShowModal(true);
            }}
            aria-label="Add task"
          >
            + Task
          </button>
        </div>
      </div>

      <div className={styles.board}>
        <div className={styles.column}>
          <h3 className={styles.columnTitle}>
            📅 Today{" "}
            <span className={styles.colCount}>{todayTasks.length}</span>
          </h3>
          {todayTasks.length === 0 && <p className={styles.empty}>No tasks</p>}
          {todayTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleComplete}
              onDelete={handleDelete}
              onEdit={(t) => setEditingTask(t)}
              onView={(t) => setViewTask(t)}
            />
          ))}
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>
            🔮 Future{" "}
            <span className={styles.colCount}>{futureTasks.length}</span>
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
              onView={(t) => setViewTask(t)}
            />
          ))}
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnTitle}>
            ⏳ Past <span className={styles.colCount}>{pastTasks.length}</span>
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
              onView={(t) => setViewTask(t)}
            />
          ))}
        </div>
      </div>

      <div ref={completedRef} className={styles.completedSection}>
        <button
          onClick={() => setShowCompleted((s) => !s)}
          className={styles.completedToggle}
          aria-expanded={showCompleted}
        >
          {showCompleted ? "Hide" : "Show"} completed ({completedTasks.length})
        </button>

        {showCompleted && (
          <div className={styles.completedList}>
            {completedTasks.length === 0 && (
              <div className={styles.empty}>No completed tasks</div>
            )}
            {completedTasks.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                onToggle={handleToggleComplete}
                onDelete={handleDelete}
                onEdit={(tt) => setEditingTask(tt)}
                onView={() => {
                  /* completed detail still viewable */
                  setViewTask(t);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <TaskFormModal
          initialTask={editingTask ?? undefined}
          onAdd={(payload) => {
            handleAddTask(payload as Omit<Task, "id">);
          }}
          onUpdate={(updated) => handleUpdateTask(updated)}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
        />
      )}

      {viewTask && (
        <TaskDetailModal
          task={viewTask}
          onClose={() => setViewTask(null)}
          onEdit={(t) => {
            setEditingTask(t);
            setViewTask(null);
            setShowModal(true);
          }}
        />
      )}
    </div>
  );
}
