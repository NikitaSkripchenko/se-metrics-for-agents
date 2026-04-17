import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { expectErrorShape } from "../support/assert.js";
import { INVALID_DATE, PAST_DAY } from "../support/dates.js";
import { ApiClient } from "../support/http.js";
import { startConfiguredServer, type RunningServer } from "../support/server.js";
import type { ErrorResponse, Task } from "../support/types.js";

describe("validation contract", () => {
  let server: RunningServer | undefined;
  let client: ApiClient;

  beforeEach(async () => {
    server = await startConfiguredServer();
    client = new ApiClient(server.baseUrl);
  });

  afterEach(async () => {
    await server?.stop();
  });

  it("rejects invalid create payloads with contracted errors", async () => {
    const emptyTitle = await client.post<ErrorResponse>("/tasks", { title: " " });
    expect(emptyTitle.status).toBe(400);
    expectErrorShape(emptyTitle.body, "VALIDATION_ERROR");
    expect(emptyTitle.body?.message).toContain("Title is required");

    const pastDueDate = await client.post<ErrorResponse>("/tasks", {
      title: "Old task",
      dueDate: PAST_DAY
    });
    expect(pastDueDate.status).toBe(400);
    expect(pastDueDate.body).toEqual({
      error: "INVALID_DUE_DATE",
      message: "Due date must be today or a future date."
    });

    const invalidDate = await client.post<ErrorResponse>("/tasks", {
      title: "Bad date",
      dueDate: INVALID_DATE
    });
    expect(invalidDate.status).toBe(400);
    expectErrorShape(invalidDate.body, "VALIDATION_ERROR");

    const extraField = await client.post<ErrorResponse>("/tasks", {
      title: "Extra",
      unknown: true
    });
    expect(extraField.status).toBe(400);
    expectErrorShape(extraField.body, "VALIDATION_ERROR");
  });

  it("rejects invalid updates, queries, and malformed JSON", async () => {
    const created = await client.post<Task>("/tasks", { title: "Valid" });
    expect(created.status).toBe(201);

    const emptyPatch = await client.patch<ErrorResponse>(
      `/tasks/${created.body?.id}`,
      {}
    );
    expect(emptyPatch.status).toBe(400);
    expectErrorShape(emptyPatch.body, "VALIDATION_ERROR");
    expect(emptyPatch.body?.message).toContain("At least one field must be provided");

    const invalidQuery = await client.get<ErrorResponse>("/tasks", {
      overdue: "maybe",
      unknown: "field"
    });
    expect(invalidQuery.status).toBe(400);
    expectErrorShape(invalidQuery.body, "VALIDATION_ERROR");

    const invalidJson = await client.malformedJson<ErrorResponse>("/tasks");
    expect(invalidJson.status).toBe(400);
    expect(invalidJson.body).toEqual({
      error: "INVALID_JSON",
      message: "Request body is not valid JSON."
    });
  });
});
