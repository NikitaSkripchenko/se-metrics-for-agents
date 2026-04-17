export function isJsonSyntaxError(error: unknown): boolean {
  return error instanceof SyntaxError && "body" in error;
}
