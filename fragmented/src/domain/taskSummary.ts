import type { TaskPriority } from "./taskPriority.js";
import type { TaskStatus } from "./taskStatus.js";

export type TaskSummary = {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
};
