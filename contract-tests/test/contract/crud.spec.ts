import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { expectErrorShape, expectTaskShape, expectUpdatedAfter } from "../support/assert.js";
import { FUTURE_DAY_A } from "../support/dates.js";
import { ApiClient } from "../support/http.js";
import { startConfiguredServer, type RunningServer } from "../support/server.js";
import type { ErrorResponse, Task } from "../support/types.js";

describe("crud contract", () => {
  let server: RunningServer | undefined;
  let client: ApiClient;

  beforeEach(async () => {
    server = await startConfiguredServer();
    client = new ApiClient(server.baseUrl);
  });

  afterEach(async () => {
    await server?.stop();
  });

  it("supports create, get, update, delete, and post-delete lookup failure", async () => {
    const created = await client.post<Task>("/tasks", {
      title: "Original",
      description: "Keep details",
      priority: "high",
      dueDate: FUTURE_DAY_A
    });
    expect(created.status).toBe(201);

    const fetched = await client.get<Task>(`/tasks/${created.body?.id}`);
    expect(fetched.status).toBe(200);
    expectTaskShape(fetched.body);
    expect(fetched.body).toMatchObject({
      title: "Original",
      description: "Keep details",
      priority: "high",
      dueDate: FUTURE_DAY_A
    });

    const retitled = await client.patch<Task>(`/tasks/${created.body?.id}`, {
      title: "Updated"
    });
    expect(retitled.status).toBe(200);
    expect(retitled.body).toMatchObject({
      title: "Updated",
      description: "Keep details",
      priority: "high",
      dueDate: FUTURE_DAY_A
    });
    expectUpdatedAfter(created.body as Task, retitled.body as Task);

    const cleared = await client.patch<Task>(`/tasks/${created.body?.id}`, {
      description: null,
      priority: "low",
      dueDate: null
    });
    expect(cleared.status).toBe(200);
    expect(cleared.body).toMatchObject({
      title: "Updated",
      description: null,
      priority: "low",
      dueDate: null
    });

    const deleted = await client.delete<void>(`/tasks/${created.body?.id}`);
    expect(deleted.status).toBe(204);
    expect(deleted.text).toBe("");

    const missing = await client.get<ErrorResponse>(`/tasks/${created.body?.id}`);
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({
      error: "TASK_NOT_FOUND",
      message: "Task was not found."
    });
  });

  it("returns not-found when deleting a missing task", async () => {
    const deleted = await client.delete<ErrorResponse>("/tasks/missing");

    expect(deleted.status).toBe(404);
    expectErrorShape(deleted.body, "TASK_NOT_FOUND");
  });
});
