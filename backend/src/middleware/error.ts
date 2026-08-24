import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
}

interface PrismaKnownError extends Error {
  code?: string;
  meta?: { target?: string[] };
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const message = err.issues
      .map((i) => `${i.path.join(".") || "body"}: ${i.message}`)
      .join(", ");
    res.status(400).json({ error: message });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err && typeof err === "object" && "code" in err) {
    const known = err as PrismaKnownError;
    if (known.code === "P2002") {
      const field = (known.meta?.target ?? ["record"]).join(", ");
      res.status(409).json({
        error: `Conflict: a record with the same value already exists (${field})`,
      });
      return;
    }
    if (known.code === "P2025") {
      res.status(404).json({ error: "Record not found" });
      return;
    }
  }

  console.error("[error] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
}
