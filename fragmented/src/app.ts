import type { Express } from "express";
import { createTaskManagementApp } from "./http/app/createTaskManagementApp.js";
import { TaskService } from "./taskService.js";

export function createApp(taskService = new TaskService()): Express {
  return createTaskManagementApp(taskService);
}
