import React from "react";
import { Task } from "../types/Task";

interface Props {
  task: Task;
}

const TaskItem: React.FC<Props> = ({ task }) => {
  return (
    <li
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
        marginBottom: "8px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        backgroundColor: task.completed ? "#e6ffe6" : "#fff",
      }}
    >
      <div>
        <strong>{task.title}</strong> <br />
        <small>📅 {new Date(task.dueDate).toLocaleDateString()}</small>
      </div>
      <div>{task.completed ? "✅ Done" : "⏳ Pending"}</div>
    </li>
  );
};

export default TaskItem;
