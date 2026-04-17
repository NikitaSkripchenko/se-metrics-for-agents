import { z } from "zod";
import { isValidDateOnly } from "./isValidDateOnly.js";

export const dateOnlySchema = z
  .string()
  .refine(isValidDateOnly, "Expected a valid date in YYYY-MM-DD format");
