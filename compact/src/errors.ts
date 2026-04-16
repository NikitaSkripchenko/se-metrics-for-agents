export type ErrorResponse = {
  error: string;
  message: string;
};

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorResponse(error: string, message: string): ErrorResponse {
  return { error, message };
}
