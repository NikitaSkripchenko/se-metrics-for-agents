import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getCapabilities } from "../support/capabilities.js";
import { expectSummaryShape } from "../support/assert.js";
import { FUTURE_DAY_A, FUTURE_DAY_C } from "../support/dates.js";
import { ApiClient } from "../support/http.js";
import { startConfiguredServer, type RunningServer } from "../support/server.js";
import type { Task, TaskSummary } from "../support/types.js";

const capabilities = getCapabilities();
const statefulIt = capabilities.stateSensitiveAssertions ? it : it.skip;

describe("summary contract", () => {
  let server: RunningServer | undefined;
  let client: ApiClient;

  beforeEach(async () => {
    server = await startConfiguredServer();
    client = new ApiClient(server.baseUrl);
  });

  afterEach(async () => {
    await server?.stop();
  });

  statefulIt("returns an empty summary on a fresh managed instance", async () => {
    const response = await client.get<TaskSummary>("/tasks/summary");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      total: 0,
      byStatus: {
        todo: 0,
        in_progress: 0,
        done: 0
      },
      byPriority: {
        low: 0,
        medium: 0,
        high: 0
      },
      overdue: 0
    });
  });

  it("returns summary counts for populated state", async () => {
    const todo = await client.post<Task>("/tasks", {
      title: "Todo",
      priority: "high",
      dueDate: FUTURE_DAY_A
    });
    expect(todo.status).toBe(201);

    const progress = await client.post<Task>("/tasks", {
      title: "Progress",
      priority: "medium",
      dueDate: FUTURE_DAY_C
    });

    const done = await client.post<Task>("/tasks", {
      title: "Done",
      priority: "low",
      dueDate: FUTURE_DAY_A
    });

    await client.patch<Task>(`/tasks/${progress.body?.id}/status`, {
      status: "in_progress"
    });
    await client.patch<Task>(`/tasks/${done.body?.id}/status`, {
      status: "done"
    });

    const summary = await client.get<TaskSummary>("/tasks/summary");

    expect(summary.status).toBe(200);
    expectSummaryShape(summary.body);
    expect(summary.body).toEqual({
      total: 3,
      byStatus: {
        todo: 1,
        in_progress: 1,
        done: 1
      },
      byPriority: {
        low: 1,
        medium: 1,
        high: 1
      },
      overdue: 0
    });
  });
});
