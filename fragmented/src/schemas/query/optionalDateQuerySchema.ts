import { z } from "zod";
import { dateOnlySchema } from "../dateOnly/dateOnlySchema.js";
import { firstQueryValue } from "./firstQueryValue.js";

export const optionalDateQuerySchema = z.preprocess(
  firstQueryValue,
  dateOnlySchema.optional()
);
