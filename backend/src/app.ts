import express from "express";
import cors from "cors";
import type { Express } from "express";
import { config } from "./config";
import authRoutes from "./modules/auth/auth.routes";
import habitsRoutes from "./modules/habits/habits.routes";
import checkinsRoutes from "./modules/checkins/checkins.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { createRateLimiter } from "./middleware/rate-limit";

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });

  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: false,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use("/api/auth", createRateLimiter(20, 15 * 60 * 1000), authRoutes);
  app.use("/api/habits", habitsRoutes);
  app.use("/api/habits", checkinsRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
