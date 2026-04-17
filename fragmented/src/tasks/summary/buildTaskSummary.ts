import type { Task, TaskSummary } from "../../domain.js";
import { addTaskToSummary } from "./addTaskToSummary.js";
import { createEmptyTaskSummary } from "./createEmptyTaskSummary.js";

export function buildTaskSummary(tasks: Task[], today: string): TaskSummary {
  const summary = createEmptyTaskSummary(tasks.length);

  for (const task of tasks) {
    addTaskToSummary(summary, task, today);
  }

  return summary;
}
