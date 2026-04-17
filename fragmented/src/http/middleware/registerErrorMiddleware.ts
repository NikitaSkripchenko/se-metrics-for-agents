import type { Express } from "express";
import { createErrorHandler } from "./errorHandler.js";

export function registerErrorMiddleware(app: Express): void {
  app.use(createErrorHandler());
}
