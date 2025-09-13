import { useEffect, useState } from "react";
import TaskItem from "../components/TaskItem";
import TaskForm from "../components/TaskForm";
import { taskApi } from "../api/taskApi";
import type { Task } from "../types/Task";
import styles from "../styles/TaskBoard.module.css";

const ITEMS_PER_LOAD = 10;

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState<{ [key: string]: number }>({
    today: ITEMS_PER_LOAD,
    future: ITEMS_PER_LOAD,
    past: ITEMS_PER_LOAD,
  });

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const data = await taskApi.getAll();
        setTasks(data);
      } catch {
        setError("❌ Không thể tải danh sách task");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // CRUD
  const handleAddTask = async (task: Omit<Task, "id">) => {
    const newTask = await taskApi.create(task);
    setTasks((prev) => [...prev, newTask]);
  };

  const handleToggle = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const updated = await taskApi.update(id, { completed: !task.completed });
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleDelete = async (id: string) => {
    await taskApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Group tasks by time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const groups = {
    today: [] as Task[],
    future: [] as Task[],
    past: [] as Task[],
  };

  tasks.forEach((task) => {
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    if (due.getTime() === today.getTime()) groups.today.push(task);
    else if (due > today) groups.future.push(task);
    else groups.past.push(task);
  });

  // Sort groups
  groups.future.sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate));
  groups.past.sort((a, b) => +new Date(b.dueDate) - +new Date(a.dueDate));

  // Section renderer
  const renderColumn = (
    key: "today" | "future" | "past",
    label: string,
    icon: string
  ) => {
    const list = groups[key];
    const visibleCount = visible[key];
    return (
      <div className={styles.column}>
        <h3 className={styles.columnTitle}>
          <span>{icon}</span> {label}
        </h3>
        {list.length === 0 ? (
          <p className={styles.empty}>🎉 Không có task.</p>
        ) : (
          <>
            {list.slice(0, visibleCount).map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
            {visibleCount < list.length && (
              <button
                onClick={() =>
                  setVisible((prev) => ({
                    ...prev,
                    [key]: prev[key] + ITEMS_PER_LOAD,
                  }))
                }
                className={styles.loadMore}
              >
                Xem thêm...
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  if (loading) return <p className={styles.state}>⏳ Đang tải tasks...</p>;
  if (error) return <p className={styles.state}>{error}</p>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2>📝 Task Board</h2>
        <TaskForm onAdd={handleAddTask} />
      </div>
      <div className={styles.board}>
        {renderColumn("today", "Hôm nay", "📅")}
        {renderColumn("future", "Tương lai", "🔮")}
        {renderColumn("past", "Quá khứ", "⏳")}
      </div>
    </div>
  );
}
