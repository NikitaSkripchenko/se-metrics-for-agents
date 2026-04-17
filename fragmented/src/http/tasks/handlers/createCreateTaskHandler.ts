import type { RequestHandler } from "express";
import { createTaskSchema } from "../../../schemas.js";
import type { TaskService } from "../../../taskService.js";
import { parseWithSchema } from "../../validation/parseWithSchema.js";
import { routeHandler } from "./routeHandler.js";

export function createCreateTaskHandler(
  taskService: TaskService
): RequestHandler {
  return routeHandler((request, response) => {
    const input = parseWithSchema(createTaskSchema, request.body);
    response.status(201).json(taskService.create(input));
  });
}
