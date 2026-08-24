import { createApp } from "./app";
import { config, assertConfig } from "./config";
import { disconnectPrisma } from "./lib/prisma";

assertConfig("server");

const app = createApp();
const server = app.listen(config.port, () => {
  console.log(`[api] HabitTracker backend listening on http://localhost:${config.port}`);
});

async function shutdown(signal: string) {
  console.log(`[api] ${signal} received, shutting down...`);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
