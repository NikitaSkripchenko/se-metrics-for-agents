import type { RequestHandler } from "express";
import { updateTaskSchema } from "../../../schemas.js";
import type { TaskService } from "../../../taskService.js";
import { parseWithSchema } from "../../validation/parseWithSchema.js";
import { taskIdParam } from "../params/taskIdParam.js";
import { routeHandler } from "./routeHandler.js";

export function createUpdateTaskHandler(
  taskService: TaskService
): RequestHandler {
  return routeHandler((request, response) => {
    const input = parseWithSchema(updateTaskSchema, request.body);
    response.json(taskService.update(taskIdParam(request), input));
  });
}
