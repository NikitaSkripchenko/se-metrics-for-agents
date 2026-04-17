import express, { type Express } from "express";

export function registerJsonBodyMiddleware(app: Express): void {
  app.use(express.json());
}
