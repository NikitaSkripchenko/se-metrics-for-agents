import { z } from "zod";
import { createTaskSchema } from "./schemas/createTaskSchema.js";
import { listTasksQuerySchema } from "./schemas/listTasksQuerySchema.js";
import { taskPrioritySchema } from "./schemas/taskPrioritySchema.js";
import { taskStatusSchema } from "./schemas/taskStatusSchema.js";
import { updateTaskSchema } from "./schemas/updateTaskSchema.js";
import { updateTaskStatusSchema } from "./schemas/updateTaskStatusSchema.js";

export { createTaskSchema } from "./schemas/createTaskSchema.js";
export { isValidDateOnly } from "./schemas/dateOnly/isValidDateOnly.js";
export { listTasksQuerySchema } from "./schemas/listTasksQuerySchema.js";
export { taskPrioritySchema } from "./schemas/taskPrioritySchema.js";
export { taskStatusSchema } from "./schemas/taskStatusSchema.js";
export { updateTaskSchema } from "./schemas/updateTaskSchema.js";
export { updateTaskStatusSchema } from "./schemas/updateTaskStatusSchema.js";

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
