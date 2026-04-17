import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getCapabilities } from "../support/capabilities.js";
import {
  FUTURE_DAY_A,
  FUTURE_DAY_B,
  FUTURE_DAY_C
} from "../support/dates.js";
import { ApiClient } from "../support/http.js";
import { createScenarioContext } from "../support/scenario.js";
import { startConfiguredServer, type RunningServer } from "../support/server.js";
import type { Task } from "../support/types.js";

const capabilities = getCapabilities();
const statefulIt = capabilities.stateSensitiveAssertions ? it : it.skip;

describe("task listing contract", () => {
  let server: RunningServer | undefined;
  let client: ApiClient;

  beforeEach(async () => {
    server = await startConfiguredServer();
    client = new ApiClient(server.baseUrl);
  });

  afterEach(async () => {
    await server?.stop();
  });

  statefulIt("returns an empty list on a fresh managed instance", async () => {
    const response = await client.get<Task[]>("/tasks");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("filters by status, priority, dates, overdue, and title search", async () => {
    const scenario = createScenarioContext();

    const alpha = await client.post<Task>("/tasks", {
      title: "Alpha draft",
      priority: "high",
      dueDate: FUTURE_DAY_A
    });
    scenario.remember("alpha", alpha.body as Task);

    const beta = await client.post<Task>("/tasks", {
      title: "Beta review",
      priority: "medium",
      dueDate: FUTURE_DAY_C
    });
    scenario.remember("beta", beta.body as Task);

    const gamma = await client.post<Task>("/tasks", {
      title: "Gamma done",
      priority: "low",
      dueDate: FUTURE_DAY_A
    });
    scenario.remember("gamma", gamma.body as Task);

    await client.patch<Task>(`/tasks/${scenario.id("gamma")}/status`, {
      status: "done"
    });

    const listed = await client.get<Task[]>("/tasks");
    expect(listed.status).toBe(200);
    expect(listed.body?.map((task) => task.id)).toEqual([
      scenario.id("alpha"),
      scenario.id("beta"),
      scenario.id("gamma")
    ]);

    const byStatus = await client.get<Task[]>("/tasks", { status: "done" });
    expect(byStatus.body?.map((task) => task.id)).toEqual([scenario.id("gamma")]);

    const byPriority = await client.get<Task[]>("/tasks", { priority: "high" });
    expect(byPriority.body?.map((task) => task.id)).toEqual([scenario.id("alpha")]);

    const overdueFalse = await client.get<Task[]>("/tasks", { overdue: false });
    expect(overdueFalse.body?.map((task) => task.id)).toEqual([
      scenario.id("alpha"),
      scenario.id("beta"),
      scenario.id("gamma")
    ]);

    const dueBefore = await client.get<Task[]>("/tasks", {
      dueBefore: FUTURE_DAY_A
    });
    expect(dueBefore.body?.map((task) => task.id)).toEqual([
      scenario.id("alpha"),
      scenario.id("gamma")
    ]);

    const dueAfter = await client.get<Task[]>("/tasks", {
      dueAfter: FUTURE_DAY_B
    });
    expect(dueAfter.body?.map((task) => task.id)).toEqual([scenario.id("beta")]);

    const search = await client.get<Task[]>("/tasks", { search: "review" });
    expect(search.body?.map((task) => task.id)).toEqual([scenario.id("beta")]);

    const combined = await client.get<Task[]>("/tasks", {
      status: "todo",
      priority: "high"
    });
    expect(combined.body?.map((task) => task.id)).toEqual([scenario.id("alpha")]);
  });
});
