import type { Task } from "../../domain.js";
import type { CreateTaskInput } from "../../schemas.js";
import type { Clock, IdGenerator } from "../service/TaskServiceOptions.js";

export function createTaskEntity(
  input: CreateTaskInput,
  idGenerator: IdGenerator,
  clock: Clock
): Task {
  const timestamp = clock().toISOString();

  return {
    id: idGenerator(),
    title: input.title,
    description: input.description,
    status: "todo",
    priority: input.priority,
    dueDate: input.dueDate,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
