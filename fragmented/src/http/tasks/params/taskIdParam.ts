import type { Request } from "express";

export function taskIdParam(request: Request): string {
  const { id } = request.params;
  return Array.isArray(id) ? id[0] ?? "" : id;
}
