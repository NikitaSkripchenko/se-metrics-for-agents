import type { RequestHandler } from "express";
import type { TaskService } from "../../../taskService.js";
import { taskIdParam } from "../params/taskIdParam.js";
import { routeHandler } from "./routeHandler.js";

export function createGetTaskHandler(taskService: TaskService): RequestHandler {
  return routeHandler((request, response) => {
    response.json(taskService.get(taskIdParam(request)));
  });
}
