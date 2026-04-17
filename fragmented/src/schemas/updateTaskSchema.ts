import { z } from "zod";
import { dateOnlySchema } from "./dateOnly/dateOnlySchema.js";
import { taskPrioritySchema } from "./taskPrioritySchema.js";

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").optional(),
    description: z.string().nullable().optional(),
    priority: taskPrioritySchema.optional(),
    dueDate: dateOnlySchema.nullable().optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided"
  });
