import type { Task } from "./domain.js";

export interface TaskRepository {
  save(task: Task): void;
  findById(id: string): Task | undefined;
  findAll(): Task[];
  delete(id: string): boolean;
  count(): number;
}

export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>();

  save(task: Task): void {
    this.tasks.set(task.id, task);
  }

  findById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  findAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }

  count(): number {
    return this.tasks.size;
  }
}
