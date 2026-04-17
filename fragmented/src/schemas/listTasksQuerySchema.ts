import { z } from "zod";
import { optionalBooleanQuerySchema } from "./query/optionalBooleanQuerySchema.js";
import { optionalDateQuerySchema } from "./query/optionalDateQuerySchema.js";
import { optionalEnumQuerySchema } from "./query/optionalEnumQuerySchema.js";
import { optionalSearchQuerySchema } from "./query/optionalSearchQuerySchema.js";
import { taskPrioritySchema } from "./taskPrioritySchema.js";
import { taskStatusSchema } from "./taskStatusSchema.js";

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
