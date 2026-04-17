import { z } from "zod";
import { dateOnlySchema } from "./dateOnly/dateOnlySchema.js";
import { taskPrioritySchema } from "./taskPrioritySchema.js";

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().nullable().optional().default(null),
    priority: taskPrioritySchema.optional().default("medium"),
    dueDate: dateOnlySchema.nullable().optional().default(null)
  })
  .strict();
