import { z } from "zod";
import { firstQueryValue } from "./firstQueryValue.js";

export const optionalBooleanQuerySchema = z.preprocess((value) => {
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
