import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error";
import { calculateStreaks } from "./streak.service";
import { todayLocal, dateToDateString } from "./timezone.service";

export interface DashboardHabit {
  id: string;
  name: string;
  description: string;
  todayCheckedIn: boolean;
  currentStreak: number;
  longestStreak: number;
  checkInCount: number;
  createdAt: Date;
}

export async function buildDashboard(userId: string): Promise<DashboardHabit[]> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError("User not found", 404);

  const habits = await prisma.habit.findMany({
    where: { userId },
    include: { checkIns: { orderBy: { localDate: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  const today = todayLocal(user.timezone);

  return habits.map((h) => {
    const dates = h.checkIns.map((c) => dateToDateString(c.localDate));
    const { currentStreak, longestStreak } = calculateStreaks(dates, today);
    return {
      id: h.id,
      name: h.name,
      description: h.description,
      todayCheckedIn: dates.includes(today),
      currentStreak,
      longestStreak,
      checkInCount: dates.length,
      createdAt: h.createdAt,
    };
  });
}
