import type { Task } from "../../domain.js";
import type { TaskRepository } from "./TaskRepository.js";

export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>();

  findAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  findById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  save(task: Task): void {
    this.tasks.set(task.id, task);
  }

  remove(id: string): boolean {
    return this.tasks.delete(id);
  }

  count(): number {
    return this.tasks.size;
  }
}
