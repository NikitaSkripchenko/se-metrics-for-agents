import type { Task } from "../../domain.js";

export function cloneTask(task: Task): Task {
  return { ...task };
}
