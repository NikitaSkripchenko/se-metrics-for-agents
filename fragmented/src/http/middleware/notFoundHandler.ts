import type { RequestHandler } from "express";
import { errorResponse } from "../../errors.js";

export function createNotFoundHandler(): RequestHandler {
  return (_request, response) => {
    response
      .status(404)
      .json(errorResponse("NOT_FOUND", "Requested route was not found."));
  };
}
