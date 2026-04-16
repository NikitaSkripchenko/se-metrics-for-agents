import { z } from "zod";
import { TASK_PRIORITIES, TASK_STATUSES } from "./domain.js";

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

function firstQueryValue(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

export function isValidDateOnly(value: string): boolean {
  if (!dateOnlyPattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const dateOnlySchema = z
  .string()
  .refine(isValidDateOnly, "Expected a valid date in YYYY-MM-DD format");

const optionalDateQuerySchema = z.preprocess(
  firstQueryValue,
  dateOnlySchema.optional()
);

const optionalEnumQuerySchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(firstQueryValue, schema.optional());

const optionalBooleanQuerySchema = z.preprocess((value) => {
  const normalized = firstQueryValue(value);

  if (normalized === undefined) {
    return undefined;
  }

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return normalized;
}, z.boolean().optional());

const optionalSearchQuerySchema = z.preprocess(
  firstQueryValue,
  z.string().trim().min(1).optional()
);

export const taskStatusSchema = z.enum(TASK_STATUSES);
export const taskPrioritySchema = z.enum(TASK_PRIORITIES);

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().nullable().optional().default(null),
    priority: taskPrioritySchema.optional().default("medium"),
    dueDate: dateOnlySchema.nullable().optional().default(null)
  })
  .strict();

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

export const updateTaskStatusSchema = z
  .object({
    status: taskStatusSchema
  })
  .strict();

export const listTasksQuerySchema = z
  .object({
    status: optionalEnumQuerySchema(taskStatusSchema),
    priority: optionalEnumQuerySchema(taskPrioritySchema),
    overdue: optionalBooleanQuerySchema,
    dueBefore: optionalDateQuerySchema,
    dueAfter: optionalDateQuerySchema,
    search: optionalSearchQuerySchema
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
