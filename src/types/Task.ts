export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string để sync API
  completed: boolean;
  createdAt: string; // ISO string
  updatedAt?: string;
  priority: "low" | "medium" | "high";
}
