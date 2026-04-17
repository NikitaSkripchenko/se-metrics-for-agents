import type { IdGenerator } from "./TaskServiceOptions.js";

export function createSequentialTaskIdGenerator(): IdGenerator {
  let nextId = 1;

  return () => `task_${String(nextId++)}`;
}
