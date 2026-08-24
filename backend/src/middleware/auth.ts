import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { AppError } from "./error";

export interface AuthPayload {
  userId: string;
}

export function getAuthedUserId(req: Request): string {
  const userId = (req as Request & { userId?: string }).userId;
  if (!userId) throw new AppError("Authentication required", 401);
  return userId;
}
export function getRouteParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new AppError(`Invalid or missing route parameter: ${name}`, 400);
  }
  return value;
}

export function authRequired(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    next(new AppError("Authentication required", 401));
    return;
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    if (!payload.userId) throw new Error("Missing userId in token");
    (req as Request & { userId: string }).userId = payload.userId;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}
