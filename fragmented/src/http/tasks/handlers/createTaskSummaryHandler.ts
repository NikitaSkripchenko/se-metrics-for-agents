import type { RequestHandler } from "express";
import type { TaskService } from "../../../taskService.js";
import { routeHandler } from "./routeHandler.js";

export function createTaskSummaryHandler(
  taskService: TaskService
): RequestHandler {
  return routeHandler((_request, response) => {
    response.json(taskService.summary());
  });
}
