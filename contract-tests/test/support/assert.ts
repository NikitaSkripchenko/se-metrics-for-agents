import { expect } from "vitest";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type ErrorResponse,
  type Task,
  type TaskSummary
} from "./types.js";

const isoInstantPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export function expectTaskShape(value: unknown): asserts value is Task {
  const task = value as Task;

  expect(task.id).toEqual(expect.any(String));
  expect(task.title).toEqual(expect.any(String));
  expect(task.description === null || typeof task.description === "string").toBe(
    true
  );
  expect(TASK_STATUSES).toContain(task.status);
  expect(TASK_PRIORITIES).toContain(task.priority);
  expect(task.dueDate === null || /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)).toBe(
    true
  );
  expect(task.createdAt).toMatch(isoInstantPattern);
  expect(task.updatedAt).toMatch(isoInstantPattern);
}

export function expectCreatedTask(task: unknown): asserts task is Task {
  expectTaskShape(task);
  expect(task.status).toBe("todo");
  expect(task.createdAt).toBe(task.updatedAt);
}

export function expectErrorShape(
  value: unknown,
  expectedCode?: string
): asserts value is ErrorResponse {
  const error = value as ErrorResponse;

  expect(error.error).toEqual(expect.any(String));
  expect(error.message).toEqual(expect.any(String));

  if (expectedCode !== undefined) {
    expect(error.error).toBe(expectedCode);
  }
}

export function expectSummaryShape(value: unknown): asserts value is TaskSummary {
  const summary = value as TaskSummary;

  expect(summary.total).toEqual(expect.any(Number));
  expect(summary.overdue).toEqual(expect.any(Number));
  expect(summary.byStatus).toEqual({
    todo: expect.any(Number),
    in_progress: expect.any(Number),
    done: expect.any(Number)
  });
  expect(summary.byPriority).toEqual({
    low: expect.any(Number),
    medium: expect.any(Number),
    high: expect.any(Number)
  });
}

export function expectUpdatedAfter(previous: Task, current: Task): void {
  expect(Date.parse(current.updatedAt)).toBeGreaterThanOrEqual(
    Date.parse(previous.updatedAt)
  );
}
