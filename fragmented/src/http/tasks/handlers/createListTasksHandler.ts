import type { RequestHandler } from "express";
import { listTasksQuerySchema } from "../../../schemas.js";
import type { TaskService } from "../../../taskService.js";
import { parseWithSchema } from "../../validation/parseWithSchema.js";
import { routeHandler } from "./routeHandler.js";

export function createListTasksHandler(
  taskService: TaskService
): RequestHandler {
  return routeHandler((request, response) => {
    const query = parseWithSchema(listTasksQuerySchema, request.query);
    response.json(taskService.list(query));
  });
}
