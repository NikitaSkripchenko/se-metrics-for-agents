import { z } from "zod";
import { firstQueryValue } from "./firstQueryValue.js";

export const optionalSearchQuerySchema = z.preprocess(
  firstQueryValue,
  z.string().trim().min(1).optional()
);
