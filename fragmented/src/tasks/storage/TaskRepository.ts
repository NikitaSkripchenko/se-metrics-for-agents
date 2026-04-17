import type { Task } from "../../domain.js";

export type TaskRepository = {
  findAll(): Task[];
  findById(id: string): Task | undefined;
  save(task: Task): void;
  remove(id: string): boolean;
  count(): number;
};
