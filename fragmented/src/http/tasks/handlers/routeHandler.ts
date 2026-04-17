import type { Request, RequestHandler, Response } from "express";

type RouteAction = (request: Request, response: Response) => void;

export function routeHandler(action: RouteAction): RequestHandler {
  return (request, response, next) => {
    try {
      action(request, response);
    } catch (error) {
      next(error);
    }
  };
}
