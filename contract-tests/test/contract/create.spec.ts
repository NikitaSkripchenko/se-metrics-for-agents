import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { expectCreatedTask, expectTaskShape } from "../support/assert.js";
import { FUTURE_DAY_A } from "../support/dates.js";
import { ApiClient } from "../support/http.js";
import { startConfiguredServer, type RunningServer } from "../support/server.js";
import type { Task } from "../support/types.js";

describe("task creation contract", () => {
  let server: RunningServer | undefined;
  let client: ApiClient;

  beforeEach(async () => {
    server = await startConfiguredServer();
    client = new ApiClient(server.baseUrl);
  });

  afterEach(async () => {
    await server?.stop();
  });

  it("creates tasks with defaults and trimmed titles", async () => {
    const response = await client.post<Task>("/tasks", {
      title: "  Write tests  "
    });

    expect(response.status).toBe(201);
    expectCreatedTask(response.body);
    expect(response.body).toMatchObject({
      title: "Write tests",
      description: null,
      status: "todo",
      priority: "medium",
      dueDate: null
    });
  });

  it("creates tasks with explicit fields", async () => {
    const response = await client.post<Task>("/tasks", {
      title: "Document contract",
      description: "Cover cross-implementation behavior",
      priority: "high",
      dueDate: FUTURE_DAY_A
    });

    expect(response.status).toBe(201);
    expectTaskShape(response.body);
    expect(response.body).toMatchObject({
      title: "Document contract",
      description: "Cover cross-implementation behavior",
      priority: "high",
      dueDate: FUTURE_DAY_A,
      status: "todo"
    });
    expect(response.body?.createdAt).toBe(response.body?.updatedAt);
  });
});
