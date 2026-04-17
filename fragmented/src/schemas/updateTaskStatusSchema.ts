import { z } from "zod";
import { taskStatusSchema } from "./taskStatusSchema.js";

export const updateTaskStatusSchema = z
  .object({
    status: taskStatusSchema
  })
  .strict();
