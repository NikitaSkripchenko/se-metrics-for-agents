import type { RequestHandler } from "express";

export type TaskController = {
  create: RequestHandler;
  summary: RequestHandler;
  list: RequestHandler;
  get: RequestHandler;
  update: RequestHandler;
  updateStatus: RequestHandler;
  delete: RequestHandler;
};
