import type { RequestHandler } from "express";
import { updateTaskStatusSchema } from "../../../schemas.js";
import type { TaskService } from "../../../taskService.js";
import { parseWithSchema } from "../../validation/parseWithSchema.js";
import { taskIdParam } from "../params/taskIdParam.js";
import { routeHandler } from "./routeHandler.js";

export function createUpdateTaskStatusHandler(
  taskService: TaskService
): RequestHandler {
  return routeHandler((request, response) => {
    const input = parseWithSchema(updateTaskStatusSchema, request.body);
    response.json(taskService.updateStatus(taskIdParam(request), input.status));
  });
}
