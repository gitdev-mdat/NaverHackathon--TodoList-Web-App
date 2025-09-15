export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string (UTC) — start / deadline
  endDate?: string;
  allDay?: boolean;
  completed: boolean;
  createdAt: string; // ISO
  updatedAt?: string; // ISO
  priority: Priority;
}
