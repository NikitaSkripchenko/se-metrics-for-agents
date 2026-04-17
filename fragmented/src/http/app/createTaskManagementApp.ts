import express, { type Express } from "express";
import type { TaskService } from "../../taskService.js";
import { registerErrorMiddleware } from "../middleware/registerErrorMiddleware.js";
import { registerJsonBodyMiddleware } from "../middleware/registerJsonBodyMiddleware.js";
import { registerNotFoundMiddleware } from "../middleware/registerNotFoundMiddleware.js";
import { createTaskRouter } from "../routes/createTaskRouter.js";

export function createTaskManagementApp(taskService: TaskService): Express {
  const app = express();

  registerJsonBodyMiddleware(app);
  app.use("/tasks", createTaskRouter(taskService));
  registerNotFoundMiddleware(app);
  registerErrorMiddleware(app);

  return app;
}
