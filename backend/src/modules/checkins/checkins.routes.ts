import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { authRequired, getAuthedUserId, getRouteParam } from "../../middleware/auth";
import { AppError } from "../../middleware/error";
import { validate } from "../../middleware/validate";
import {
  dateStringToDate,
  dateToDateString,
  getLocalDate,
  todayLocal,
  isValidDateString,
} from "../../services/timezone.service";
import { createCheckInSchema } from "./checkins.validation";
import { evaluateCheckIn } from "../../services/checkin-policy.service";

const router = Router();
router.use(authRequired);

async function getOwnedHabit(userId: string, habitId: string) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });
  if (!habit) throw new AppError("Habit not found", 404);
  return habit;
}

async function getUserTimezone(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);
  return user.timezone;
}

router.post("/:habitId/check-ins", validate(createCheckInSchema), async (req, res) => {
  const userId = getAuthedUserId(req);
  const habitId = getRouteParam(req, "habitId");
  const { date } = req.body as { date: string };

  const habit = await getOwnedHabit(userId, habitId);
  const timezone = await getUserTimezone(userId);
  const localToday = todayLocal(timezone);
  const earliestDate = getLocalDate(habit.createdAt, timezone);

  const existing = await prisma.checkIn.findMany({
    where: { habitId },
    select: { localDate: true },
  });
  const existingDates = existing.map((c) => dateToDateString(c.localDate));

  const decision = evaluateCheckIn(date, localToday, existingDates, earliestDate);
  if (!decision.allowed) {
    throw new AppError(decision.error!, decision.status ?? 400);
  }

  const checkIn = await prisma.checkIn.create({
    data: { habitId, localDate: dateStringToDate(date), checkedAt: new Date() },
  });

  res.status(201).json({
    checkIn: { id: checkIn.id, habitId: checkIn.habitId, date, checkedAt: checkIn.checkedAt },
  });
});

router.get("/:habitId/check-ins", async (req, res) => {
  const userId = getAuthedUserId(req);
  const habitId = getRouteParam(req, "habitId");
  await getOwnedHabit(userId, habitId);

  const checkIns = await prisma.checkIn.findMany({
    where: { habitId },
    orderBy: { localDate: "desc" },
  });

  res.json({
    checkIns: checkIns.map((c) => ({
      id: c.id,
      habitId: c.habitId,
      date: dateToDateString(c.localDate),
      checkedAt: c.checkedAt,
    })),
  });
});

router.delete("/:habitId/check-ins/:date", async (req, res) => {
  const userId = getAuthedUserId(req);
  const habitId = getRouteParam(req, "habitId");
  const date = getRouteParam(req, "date");
  if (!isValidDateString(date)) {
    throw new AppError("Invalid date, expected YYYY-MM-DD", 400);
  }

  await getOwnedHabit(userId, habitId);

  const existing = await prisma.checkIn.findUnique({
    where: { habitId_localDate: { habitId, localDate: dateStringToDate(date) } },
  });
  if (!existing) throw new AppError("Check-in not found for that date", 404);

  await prisma.checkIn.delete({ where: { id: existing.id } });
  res.status(204).end();
});

export default router;
