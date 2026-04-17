import type { Task } from "../../domain.js";

export function taskMatchesSearch(
  task: Task,
  search: string | undefined
): boolean {
  return (
    search === undefined || task.title.toLocaleLowerCase().includes(search)
  );
}
