import type { NextFunction, Request, Response } from "express";

type Entry = { count: number; resetAt: number };

export function createRateLimiter(limit: number, windowMs: number) {
  const entries = new Map<string, Entry>();
  let lastCleanup = 0;

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    if (now - lastCleanup > windowMs) {
      for (const [key, entry] of entries) {
        if (entry.resetAt <= now) entries.delete(key);
      }
      lastCleanup = now;
    }

    const key = req.ip || req.socket.remoteAddress || "unknown";
    const current = entries.get(key);
    if (!current || current.resetAt <= now) {
      entries.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    current.count += 1;
    if (current.count > limit) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      res.status(429).json({ error: "Too many requests, please try again later" });
      return;
    }
    next();
  };
}
