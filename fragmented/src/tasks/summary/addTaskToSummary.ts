import type { Task, TaskSummary } from "../../domain.js";
import { isTaskOverdue } from "../overdue/isTaskOverdue.js";

export function addTaskToSummary(
  summary: TaskSummary,
  task: Task,
  today: string
): void {
  summary.byStatus[task.status] += 1;
  summary.byPriority[task.priority] += 1;

  if (isTaskOverdue(task, today)) {
    summary.overdue += 1;
  }
}
