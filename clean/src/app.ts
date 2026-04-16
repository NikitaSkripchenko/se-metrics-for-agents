import express from "express";
import { errorHandler, notFoundHandler } from "./shared/http.js";
import { createTaskRouter } from "./tasks/routes.js";
import { TaskService } from "./tasks/service.js";

export function createApp(taskService = new TaskService()) {
  const app = express();

  app.use(express.json());
  app.use(createTaskRouter(taskService));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
