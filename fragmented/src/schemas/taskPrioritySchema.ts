import { z } from "zod";
import { TASK_PRIORITIES } from "../domain.js";

export const taskPrioritySchema = z.enum(TASK_PRIORITIES);
