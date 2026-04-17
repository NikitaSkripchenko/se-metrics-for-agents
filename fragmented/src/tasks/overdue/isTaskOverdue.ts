import type { Task } from "../../domain.js";

export function isTaskOverdue(task: Task, today: string): boolean {
  return task.status !== "done" && task.dueDate !== null && task.dueDate < today;
}
