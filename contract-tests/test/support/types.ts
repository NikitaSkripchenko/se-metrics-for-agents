export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskSummary = {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  overdue: number;
};

export type ErrorResponse = {
  error: string;
  message: string;
};

export type QueryValue = string | number | boolean | undefined;

export type QueryShape = Record<string, QueryValue>;

export type JsonObject = Record<string, unknown>;
