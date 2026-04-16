import { Router } from "express";
import { parseRequest } from "../shared/http.js";
import {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
  updateTaskStatusSchema
} from "./schemas.js";
import { TaskService } from "./service.js";

export function createTaskRouter(taskService: TaskService): Router {
  const router = Router();

  router.post("/tasks", (request, response, next) => {
    try {
      const input = parseRequest(createTaskSchema, request.body);
      response.status(201).json(taskService.create(input));
    } catch (error) {
      next(error);
    }
  });

  router.get("/tasks/summary", (_request, response, next) => {
    try {
      response.json(taskService.summary());
    } catch (error) {
      next(error);
    }
  });

  router.get("/tasks", (request, response, next) => {
    try {
      const query = parseRequest(listTasksQuerySchema, request.query);
      response.json(taskService.list(query));
    } catch (error) {
      next(error);
    }
  });

  router.get("/tasks/:id", (request, response, next) => {
    try {
      response.json(taskService.get(request.params.id));
    } catch (error) {
      next(error);
    }
  });

  router.patch("/tasks/:id", (request, response, next) => {
    try {
      const input = parseRequest(updateTaskSchema, request.body);
      response.json(taskService.update(request.params.id, input));
    } catch (error) {
      next(error);
    }
  });

  router.patch("/tasks/:id/status", (request, response, next) => {
    try {
      const input = parseRequest(updateTaskStatusSchema, request.body);
      response.json(taskService.updateStatus(request.params.id, input.status));
    } catch (error) {
      next(error);
    }
  });

  router.delete("/tasks/:id", (request, response, next) => {
    try {
      taskService.delete(request.params.id);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
