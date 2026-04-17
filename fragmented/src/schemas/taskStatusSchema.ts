import { z } from "zod";
import { TASK_STATUSES } from "../domain.js";

export const taskStatusSchema = z.enum(TASK_STATUSES);
