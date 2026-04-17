import type { RequestHandler } from "express";
import type { TaskService } from "../../../taskService.js";
import { taskIdParam } from "../params/taskIdParam.js";
import { routeHandler } from "./routeHandler.js";

export function createDeleteTaskHandler(
  taskService: TaskService
): RequestHandler {
  return routeHandler((request, response) => {
    taskService.delete(taskIdParam(request));
    response.status(204).send();
  });
}
