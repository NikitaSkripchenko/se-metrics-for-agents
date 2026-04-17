import { z } from "zod";
import { firstQueryValue } from "./firstQueryValue.js";

export const optionalEnumQuerySchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(firstQueryValue, schema.optional());
