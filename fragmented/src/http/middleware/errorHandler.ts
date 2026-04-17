import type { ErrorRequestHandler } from "express";
import { ApiError, errorResponse } from "../../errors.js";
import { isJsonSyntaxError } from "../validation/isJsonSyntaxError.js";

export function createErrorHandler(): ErrorRequestHandler {
  return (error, _request, response, _next) => {
    if (isJsonSyntaxError(error)) {
      response
        .status(400)
        .json(errorResponse("INVALID_JSON", "Request body is not valid JSON."));
      return;
    }

    if (error instanceof ApiError) {
      response
        .status(error.statusCode)
        .json(errorResponse(error.code, error.message));
      return;
    }

    response
      .status(500)
      .json(errorResponse("INTERNAL_ERROR", "Unexpected server error."));
  };
}
