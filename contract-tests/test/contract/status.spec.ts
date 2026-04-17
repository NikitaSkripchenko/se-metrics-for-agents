import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { expectErrorShape, expectTaskShape, expectUpdatedAfter } from "../support/assert.js";
import { ApiClient } from "../support/http.js";
import { startConfiguredServer, type RunningServer } from "../support/server.js";
import type { ErrorResponse, Task } from "../support/types.js";

describe("status transition contract", () => {
  let server: RunningServer | undefined;
  let client: ApiClient;

  beforeEach(async () => {
    server = await startConfiguredServer();
    client = new ApiClient(server.baseUrl);
  });

  afterEach(async () => {
    await server?.stop();
  });

  it("enforces allowed transitions and direct completion", async () => {
    const created = await client.post<Task>("/tasks", { title: "Ship" });
    expect(created.status).toBe(201);

    const started = await client.patch<Task>(`/tasks/${created.body?.id}/status`, {
      status: "in_progress"
    });
    expect(started.status).toBe(200);
    expectTaskShape(started.body);
    expect(started.body?.status).toBe("in_progress");
    expectUpdatedAfter(created.body as Task, started.body as Task);

    const backwards = await client.patch<ErrorResponse>(
      `/tasks/${created.body?.id}/status`,
      { status: "todo" }
    );
    expect(backwards.status).toBe(409);
    expectErrorShape(backwards.body, "INVALID_STATUS_TRANSITION");

    const done = await client.patch<Task>(`/tasks/${created.body?.id}/status`, {
      status: "done"
    });
    expect(done.status).toBe(200);
    expect(done.body?.status).toBe("done");

    const quick = await client.post<Task>("/tasks", { title: "Quick win" });
    const quickDone = await client.patch<Task>(`/tasks/${quick.body?.id}/status`, {
      status: "done"
    });
    expect(quickDone.status).toBe(200);
    expect(quickDone.body?.status).toBe("done");
  });

  it("returns task-not-found for missing resources", async () => {
    const response = await client.patch<ErrorResponse>("/tasks/missing/status", {
      status: "done"
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "TASK_NOT_FOUND",
      message: "Task was not found."
    });
  });
});
