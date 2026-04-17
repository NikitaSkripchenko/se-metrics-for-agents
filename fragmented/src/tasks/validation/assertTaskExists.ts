import type { Task } from "../../domain.js";
import { ApiError } from "../../errors.js";

export function assertTaskExists(task: Task | undefined): Task {
  if (task === undefined) {
    throw new ApiError(404, "TASK_NOT_FOUND", "Task was not found.");
  }

  return task;
}
