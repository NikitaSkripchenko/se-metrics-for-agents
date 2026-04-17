import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskSummary
} from "../../domain.js";
import { zeroCounts } from "./zeroCounts.js";

export function createEmptyTaskSummary(total: number): TaskSummary {
  return {
    total,
    byStatus: zeroCounts(TASK_STATUSES),
    byPriority: zeroCounts(TASK_PRIORITIES),
    overdue: 0
  };
}
