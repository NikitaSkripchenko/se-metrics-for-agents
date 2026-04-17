import type { Task } from "../../domain.js";

export function taskMatchesDueBefore(
  task: Task,
  dueBefore: string | undefined
): boolean {
  return (
    dueBefore === undefined ||
    (task.dueDate !== null && task.dueDate <= dueBefore)
  );
}
