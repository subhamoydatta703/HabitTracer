import "dotenv/config";

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiresIn: "7d",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
} as const;

export function assertConfig(scope = "app") {
  if (!config.databaseUrl) {
    throw new Error(`[${scope}] DATABASE_URL is required. Copy .env.example to .env and set it.`);
  }
  if (!config.jwtSecret) {
    throw new Error(`[${scope}] JWT_SECRET is required. Set it in .env.`);
  }
}
