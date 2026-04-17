import type { Task, TaskStatus } from "../../domain.js";

export function taskMatchesStatus(
  task: Task,
  status: TaskStatus | undefined
): boolean {
  return status === undefined || task.status === status;
}
