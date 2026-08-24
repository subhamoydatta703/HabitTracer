import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { config } from "../../config";
import { AppError } from "../../middleware/error";
import { authRequired, getAuthedUserId } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { registerSchema, loginSchema } from "./auth.validation";

const router = Router();

function signToken(userId: string): string {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

function publicUser(u: { id: string; email: string; timezone: string; createdAt: Date }) {
  return { id: u.id, email: u.email, timezone: u.timezone, createdAt: u.createdAt };
}

router.post("/register", validate(registerSchema), async (req, res) => {
  const { email, password, timezone } = req.body as {
    email: string;
    password: string;
    timezone: string;
  };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("Email is already registered", 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, timezone } });

  res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
});

router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid email or password", 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError("Invalid email or password", 401);

  res.json({ token: signToken(user.id), user: publicUser(user) });
});

router.get("/me", authRequired, async (req, res) => {
  const userId = getAuthedUserId(req);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);
  res.json({ user: publicUser(user) });
});

export default router;
