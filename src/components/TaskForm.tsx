import { useState } from "react";
import type { Task } from "../types/Task";
import styles from "../styles/TaskForm.module.css";

interface TaskFormProps {
  onAdd: (task: Omit<Task, "id">) => void;
}

export default function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) {
      alert("⚠️ Nhập đầy đủ Title + Due Date");
      return;
    }

    const now = new Date().toISOString();

    onAdd({
      title,
      dueDate,
      priority,
      completed: false,
      createdAt: now,
      description: "",
    });

    setTitle("");
    setDueDate("");
    setPriority("medium");
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={styles.input}
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className={styles.input}
      />
      <select
        value={priority}
        onChange={(e) =>
          setPriority(e.target.value as "low" | "medium" | "high")
        }
        className={styles.select}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button type="submit" className={styles.button}>
        ➕ Add
      </button>
    </form>
  );
}
