import type { Task } from "../../domain.js";
import type { UpdateTaskInput } from "../../schemas.js";
import type { Clock } from "../service/TaskServiceOptions.js";

export function applyTaskUpdate(
  task: Task,
  input: UpdateTaskInput,
  clock: Clock
): Task {
  return {
    ...task,
    ...input,
    updatedAt: clock().toISOString()
  };
}
