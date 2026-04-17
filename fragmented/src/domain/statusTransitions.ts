import type { TaskStatus } from "./taskStatus.js";

export const ALLOWED_STATUS_TRANSITIONS: Record<
  TaskStatus,
  readonly TaskStatus[]
> = {
  todo: ["in_progress", "done"],
  in_progress: ["done"],
  done: []
};

export function canTransitionTaskStatus(
  from: TaskStatus,
  to: TaskStatus
): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}
