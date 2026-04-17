import type { TaskService } from "../../taskService.js";
import type { TaskController } from "./TaskController.js";
import { createCreateTaskHandler } from "./handlers/createCreateTaskHandler.js";
import { createDeleteTaskHandler } from "./handlers/createDeleteTaskHandler.js";
import { createGetTaskHandler } from "./handlers/createGetTaskHandler.js";
import { createListTasksHandler } from "./handlers/createListTasksHandler.js";
import { createTaskSummaryHandler } from "./handlers/createTaskSummaryHandler.js";
import { createUpdateTaskHandler } from "./handlers/createUpdateTaskHandler.js";
import { createUpdateTaskStatusHandler } from "./handlers/createUpdateTaskStatusHandler.js";

export function createTaskController(taskService: TaskService): TaskController {
  return {
    create: createCreateTaskHandler(taskService),
    summary: createTaskSummaryHandler(taskService),
    list: createListTasksHandler(taskService),
    get: createGetTaskHandler(taskService),
    update: createUpdateTaskHandler(taskService),
    updateStatus: createUpdateTaskStatusHandler(taskService),
    delete: createDeleteTaskHandler(taskService)
  };
}
