import type { Task } from "./types.js";

export function createScenarioContext() {
  const idsByLabel = new Map<string, string>();
  const labelsById = new Map<string, string>();

  return {
    remember(label: string, task: Pick<Task, "id">): void {
      idsByLabel.set(label, task.id);
      labelsById.set(task.id, label);
    },
    id(label: string): string {
      const id = idsByLabel.get(label);

      if (id === undefined) {
        throw new Error(`Unknown scenario label '${label}'.`);
      }

      return id;
    },
    labelFor(id: string): string | undefined {
      return labelsById.get(id);
    }
  };
}

export type ScenarioContext = ReturnType<typeof createScenarioContext>;
