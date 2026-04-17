import { Router } from "express";
import type { TaskService } from "../../taskService.js";
import { createTaskController } from "../tasks/createTaskController.js";

export function createTaskRouter(taskService: TaskService): Router {
  const router = Router();
  const controller = createTaskController(taskService);

  router.post("/", controller.create);
  router.get("/summary", controller.summary);
  router.get("/", controller.list);
  router.get("/:id", controller.get);
  router.patch("/:id", controller.update);
  router.patch("/:id/status", controller.updateStatus);
  router.delete("/:id", controller.delete);

  return router;
}
