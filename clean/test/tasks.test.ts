import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { TaskService } from "../src/taskService.js";

function createTestServer() {
  let currentDate = new Date("2026-04-16T12:00:00.000Z");
  let nextId = 1;
  const service = new TaskService({
    now: () => currentDate,
    idGenerator: () => `task-${nextId++}`
  });

  return {
    app: createApp(service),
    setNow: (value: string) => {
      currentDate = new Date(value);
    }
  };
}

describe("task API", () => {
  it("creates tasks with defaults and deterministic metadata", async () => {
    const { app } = createTestServer();

    const response = await request(app).post("/tasks").send({
      title: "  Write tests  ",
      description: "Cover the API",
      priority: "high",
      dueDate: "2026-04-16"
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: "task-1",
      title: "Write tests",
      description: "Cover the API",
      status: "todo",
      priority: "high",
      dueDate: "2026-04-16",
      createdAt: "2026-04-16T12:00:00.000Z",
      updatedAt: "2026-04-16T12:00:00.000Z"
    });
  });

  it("returns contracted validation errors", async () => {
    const { app } = createTestServer();

    const emptyTitle = await request(app).post("/tasks").send({ title: " " });
    expect(emptyTitle.status).toBe(400);
    expect(emptyTitle.body.error).toBe("VALIDATION_ERROR");
    expect(emptyTitle.body.message).toContain("Title is required");

    const pastDueDate = await request(app).post("/tasks").send({
      title: "Old task",
      dueDate: "2026-04-15"
    });
    expect(pastDueDate.status).toBe(400);
    expect(pastDueDate.body).toEqual({
      error: "INVALID_DUE_DATE",
      message: "Due date must be today or a future date."
    });

    const invalidDate = await request(app).post("/tasks").send({
      title: "Bad date",
      dueDate: "2026-02-31"
    });
    expect(invalidDate.status).toBe(400);
    expect(invalidDate.body.error).toBe("VALIDATION_ERROR");
  });

  it("enforces allowed status transitions", async () => {
    const { app } = createTestServer();

    const created = await request(app).post("/tasks").send({ title: "Ship" });

    const started = await request(app)
      .patch(`/tasks/${created.body.id}/status`)
      .send({ status: "in_progress" });
    expect(started.status).toBe(200);
    expect(started.body.status).toBe("in_progress");

    const backwards = await request(app)
      .patch(`/tasks/${created.body.id}/status`)
      .send({ status: "todo" });
    expect(backwards.status).toBe(409);
    expect(backwards.body.error).toBe("INVALID_STATUS_TRANSITION");

    const done = await request(app)
      .patch(`/tasks/${created.body.id}/status`)
      .send({ status: "done" });
    expect(done.status).toBe(200);
    expect(done.body.status).toBe("done");

    const reopened = await request(app)
      .patch(`/tasks/${created.body.id}/status`)
      .send({ status: "in_progress" });
    expect(reopened.status).toBe(409);
  });

  it("allows todo tasks to move directly to done", async () => {
    const { app } = createTestServer();

    const created = await request(app).post("/tasks").send({ title: "Quick" });
    const done = await request(app)
      .patch(`/tasks/${created.body.id}/status`)
      .send({ status: "done" });

    expect(done.status).toBe(200);
    expect(done.body.status).toBe("done");
  });

  it("filters tasks by status, priority, overdue, date, and title search", async () => {
    const { app, setNow } = createTestServer();

    const alpha = await request(app).post("/tasks").send({
      title: "Alpha draft",
      priority: "high",
      dueDate: "2026-04-17"
    });
    const beta = await request(app).post("/tasks").send({
      title: "Beta review",
      priority: "medium",
      dueDate: "2026-04-19"
    });
    const gamma = await request(app).post("/tasks").send({
      title: "Gamma done",
      priority: "low",
      dueDate: "2026-04-17"
    });

    await request(app)
      .patch(`/tasks/${gamma.body.id}/status`)
      .send({ status: "done" });
    setNow("2026-04-18T12:00:00.000Z");

    const byStatus = await request(app).get("/tasks").query({ status: "done" });
    expect(byStatus.body.map((task: { id: string }) => task.id)).toEqual([
      gamma.body.id
    ]);

    const byPriority = await request(app)
      .get("/tasks")
      .query({ priority: "high" });
    expect(byPriority.body.map((task: { id: string }) => task.id)).toEqual([
      alpha.body.id
    ]);

    const overdue = await request(app)
      .get("/tasks")
      .query({ overdue: "true" });
    expect(overdue.body.map((task: { id: string }) => task.id)).toEqual([
      alpha.body.id
    ]);

    const dueBefore = await request(app)
      .get("/tasks")
      .query({ dueBefore: "2026-04-17" });
    expect(dueBefore.body.map((task: { id: string }) => task.id)).toEqual([
      alpha.body.id,
      gamma.body.id
    ]);

    const dueAfter = await request(app)
      .get("/tasks")
      .query({ dueAfter: "2026-04-18" });
    expect(dueAfter.body.map((task: { id: string }) => task.id)).toEqual([
      beta.body.id
    ]);

    const search = await request(app).get("/tasks").query({ search: "review" });
    expect(search.body.map((task: { id: string }) => task.id)).toEqual([
      beta.body.id
    ]);
  });

  it("returns summary counts", async () => {
    const { app, setNow } = createTestServer();

    const todo = await request(app).post("/tasks").send({
      title: "Todo",
      priority: "high",
      dueDate: "2026-04-17"
    });
    const progress = await request(app).post("/tasks").send({
      title: "Progress",
      priority: "medium",
      dueDate: "2026-04-19"
    });
    const done = await request(app).post("/tasks").send({
      title: "Done",
      priority: "low",
      dueDate: "2026-04-17"
    });

    await request(app)
      .patch(`/tasks/${progress.body.id}/status`)
      .send({ status: "in_progress" });
    await request(app)
      .patch(`/tasks/${done.body.id}/status`)
      .send({ status: "done" });
    setNow("2026-04-18T12:00:00.000Z");

    const response = await request(app).get("/tasks/summary");

    expect(todo.body.id).toBe("task-1");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
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
      overdue: 1
    });
  });

  it("supports CRUD behavior", async () => {
    const { app } = createTestServer();

    const created = await request(app).post("/tasks").send({
      title: "Original",
      dueDate: "2026-04-20"
    });

    const fetched = await request(app).get(`/tasks/${created.body.id}`);
    expect(fetched.status).toBe(200);
    expect(fetched.body.title).toBe("Original");

    const updated = await request(app).patch(`/tasks/${created.body.id}`).send({
      title: "Updated",
      description: null,
      priority: "low",
      dueDate: null
    });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({
      title: "Updated",
      description: null,
      priority: "low",
      dueDate: null
    });

    const listed = await request(app).get("/tasks");
    expect(listed.body).toHaveLength(1);

    const deleted = await request(app).delete(`/tasks/${created.body.id}`);
    expect(deleted.status).toBe(204);

    const missing = await request(app).get(`/tasks/${created.body.id}`);
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({
      error: "TASK_NOT_FOUND",
      message: "Task was not found."
    });
  });
});
