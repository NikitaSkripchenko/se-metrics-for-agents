import express, {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { ZodError, type ZodType } from "zod";
import { ApiError, errorResponse } from "./errors.js";
import {
  createTaskSchema,
  listTasksQuerySchema,
  updateTaskSchema,
  updateTaskStatusSchema
} from "./schemas.js";
import { TaskService } from "./taskService.js";

export function createApp(taskService = new TaskService()) {
  const app = express();

  app.use(express.json());

  app.post("/tasks", (request, response, next) => {
    try {
      const input = parse(createTaskSchema, request.body);
      response.status(201).json(taskService.create(input));
    } catch (error) {
      next(error);
    }
  });

  app.get("/tasks/summary", (_request, response, next) => {
    try {
      response.json(taskService.summary());
    } catch (error) {
      next(error);
    }
  });

  app.get("/tasks", (request, response, next) => {
    try {
      const query = parse(listTasksQuerySchema, request.query);
      response.json(taskService.list(query));
    } catch (error) {
      next(error);
    }
  });

  app.get("/tasks/:id", (request, response, next) => {
    try {
      response.json(taskService.get(request.params.id));
    } catch (error) {
      next(error);
    }
  });

  app.patch("/tasks/:id", (request, response, next) => {
    try {
      const input = parse(updateTaskSchema, request.body);
      response.json(taskService.update(request.params.id, input));
    } catch (error) {
      next(error);
    }
  });

  app.patch("/tasks/:id/status", (request, response, next) => {
    try {
      const input = parse(updateTaskStatusSchema, request.body);
      response.json(taskService.updateStatus(request.params.id, input.status));
    } catch (error) {
      next(error);
    }
  });

  app.delete("/tasks/:id", (request, response, next) => {
    try {
      taskService.delete(request.params.id);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  app.use((_request, response) => {
    response
      .status(404)
      .json(errorResponse("NOT_FOUND", "Requested route was not found."));
  });

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction
    ) => {
      if (isJsonSyntaxError(error)) {
        response
          .status(400)
          .json(errorResponse("INVALID_JSON", "Request body is not valid JSON."));
        return;
      }

      if (error instanceof ApiError) {
        response
          .status(error.statusCode)
          .json(errorResponse(error.code, error.message));
        return;
      }

      response
        .status(500)
        .json(errorResponse("INTERNAL_ERROR", "Unexpected server error."));
    }
  );

  return app;
}

function parse<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApiError(400, "VALIDATION_ERROR", formatZodError(result.error));
  }

  return result.data;
}

function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return path.length > 0 ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
}

function isJsonSyntaxError(error: unknown): boolean {
  return error instanceof SyntaxError && "body" in error;
}
