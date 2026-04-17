import type { Task, TaskStatus } from "../../domain.js";
import type { Clock } from "../service/TaskServiceOptions.js";

export function applyTaskStatusUpdate(
  task: Task,
  status: TaskStatus,
  clock: Clock
): Task {
  return {
    ...task,
    status,
    updatedAt: clock().toISOString()
  };
}
