import type { ZodType } from "zod";
import { ApiError } from "../../errors.js";
import { formatZodError } from "./formatZodError.js";

export function parseWithSchema<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApiError(400, "VALIDATION_ERROR", formatZodError(result.error));
  }

  return result.data;
}
