import type { ErrorResponse, Task, TaskSummary } from "./types.js";

type ResolveLabel = (id: string) => string | undefined;

export function normalizeTask(task: Task, resolveLabel: ResolveLabel) {
  return {
    ...task,
    id: resolveLabel(task.id) ?? task.id,
    createdAt: "<timestamp>",
    updatedAt: "<timestamp>"
  };
}

export function normalizeTasks(tasks: Task[], resolveLabel: ResolveLabel) {
  return tasks.map((task) => normalizeTask(task, resolveLabel));
}

export function normalizeSummary(summary: TaskSummary): TaskSummary {
  return summary;
}

export function normalizeError(error: ErrorResponse): ErrorResponse {
  return error;
}
