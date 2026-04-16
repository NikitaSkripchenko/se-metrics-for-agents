import {
  type NextFunction,
  type Request,
  type Response
} from "express";
import { ZodError, type ZodType } from "zod";
import { ApiError, errorResponse } from "./errors.js";

export function parseRequest<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApiError(400, "VALIDATION_ERROR", formatZodError(result.error));
  }

  return result.data;
}

export function notFoundHandler(_request: Request, response: Response): void {
  response
    .status(404)
    .json(errorResponse("NOT_FOUND", "Requested route was not found."));
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
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
}

function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      return path.length > 0 ? `${path}: ${issue.message}` : issue.message;
    })
    .join("; ");
}

function isJsonSyntaxError(error: unknown): boolean {
  return error instanceof SyntaxError && "body" in error;
}
