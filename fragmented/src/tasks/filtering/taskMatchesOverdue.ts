import type { Task } from "../../domain.js";
import { isTaskOverdue } from "../overdue/isTaskOverdue.js";

export function taskMatchesOverdue(
  task: Task,
  overdue: boolean | undefined,
  today: string
): boolean {
  return overdue === undefined || isTaskOverdue(task, today) === overdue;
}
