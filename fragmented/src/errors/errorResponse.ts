export type ErrorResponse = {
  error: string;
  message: string;
};

export function errorResponse(error: string, message: string): ErrorResponse {
  return { error, message };
}
