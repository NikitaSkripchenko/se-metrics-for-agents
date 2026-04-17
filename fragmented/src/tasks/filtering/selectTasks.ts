import type { Task } from "../../domain.js";
import type { ListTasksQuery } from "../../schemas.js";
import { taskMatchesFilters } from "./taskMatchesFilters.js";

export function selectTasks(
  tasks: Task[],
  filters: ListTasksQuery,
  today: string
): Task[] {
  return tasks.filter((task) => taskMatchesFilters(task, filters, today));
}
