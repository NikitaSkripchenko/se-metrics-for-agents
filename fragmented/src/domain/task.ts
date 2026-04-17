import type { TaskPriority } from "./taskPriority.js";
import type { TaskStatus } from "./taskStatus.js";

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
