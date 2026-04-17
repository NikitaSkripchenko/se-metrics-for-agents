import type { Task } from "../../domain.js";
import type { ListTasksQuery } from "../../schemas.js";
import { filterSearchText } from "./filterSearchText.js";
import { taskMatchesDueAfter } from "./taskMatchesDueAfter.js";
import { taskMatchesDueBefore } from "./taskMatchesDueBefore.js";
import { taskMatchesOverdue } from "./taskMatchesOverdue.js";
import { taskMatchesPriority } from "./taskMatchesPriority.js";
import { taskMatchesSearch } from "./taskMatchesSearch.js";
import { taskMatchesStatus } from "./taskMatchesStatus.js";

export function taskMatchesFilters(
  task: Task,
  filters: ListTasksQuery,
  today: string
): boolean {
  const search = filterSearchText(filters.search);

  return (
    taskMatchesStatus(task, filters.status) &&
    taskMatchesPriority(task, filters.priority) &&
    taskMatchesOverdue(task, filters.overdue, today) &&
    taskMatchesDueBefore(task, filters.dueBefore) &&
    taskMatchesDueAfter(task, filters.dueAfter) &&
    taskMatchesSearch(task, search)
  );
}
