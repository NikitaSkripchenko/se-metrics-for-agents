import type { Task, TaskPriority } from "../../domain.js";

export function taskMatchesPriority(
  task: Task,
  priority: TaskPriority | undefined
): boolean {
  return priority === undefined || task.priority === priority;
}
