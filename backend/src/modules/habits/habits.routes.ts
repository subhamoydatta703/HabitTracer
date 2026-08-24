import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { authRequired, getAuthedUserId, getRouteParam } from "../../middleware/auth";
import { AppError } from "../../middleware/error";
import { validate } from "../../middleware/validate";
import { createHabitSchema, updateHabitSchema } from "./habits.validation";

const router = Router();
router.use(authRequired);

async function findOwnedHabit(userId: string, habitId: string) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw new AppError("Habit not found", 404);
  return habit;
}

router.post("/", validate(createHabitSchema), async (req, res) => {
  const userId = getAuthedUserId(req);
  const { name, description } = req.body as { name: string; description?: string };

  const habit = await prisma.habit.create({
    data: { userId, name, description: description ?? "" },
  });
  res.status(201).json({ habit });
});

router.get("/", async (req, res) => {
  const userId = getAuthedUserId(req);
  const habits = await prisma.habit.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  res.json({ habits });
});

router.get("/:id", async (req, res) => {
  const userId = getAuthedUserId(req);
  const id = getRouteParam(req, "id");
  const habit = await findOwnedHabit(userId, id);
  res.json({ habit });
});

router.patch("/:id", validate(updateHabitSchema), async (req, res) => {
  const userId = getAuthedUserId(req);
  const id = getRouteParam(req, "id");
  const { name, description } = req.body as { name?: string; description?: string };
  await findOwnedHabit(userId, id);

  const habit = await prisma.habit.update({
    where: { id },
    data: { name: name ?? undefined, description: description ?? undefined },
  });
  res.json({ habit });
});

router.delete("/:id", async (req, res) => {
  const userId = getAuthedUserId(req);
  const id = getRouteParam(req, "id");
  await findOwnedHabit(userId, id);
  await prisma.habit.delete({ where: { id } });
  res.status(204).end();
});

export default router;
