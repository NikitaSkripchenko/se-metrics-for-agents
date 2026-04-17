import type { Express } from "express";
import { createNotFoundHandler } from "./notFoundHandler.js";

export function registerNotFoundMiddleware(app: Express): void {
  app.use(createNotFoundHandler());
}
