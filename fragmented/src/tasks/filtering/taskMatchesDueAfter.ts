import type { Task } from "../../domain.js";

export function taskMatchesDueAfter(
  task: Task,
  dueAfter: string | undefined
): boolean {
  return (
    dueAfter === undefined || (task.dueDate !== null && task.dueDate >= dueAfter)
  );
}
