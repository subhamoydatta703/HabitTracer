import { Router } from "express";
import { authRequired, getAuthedUserId } from "../../middleware/auth";
import { buildDashboard } from "../../services/dashboard.service";
import type { DashboardHabit } from "../../services/dashboard.service";

const router = Router();
router.use(authRequired);

router.get("/", async (req, res) => {
  const userId = getAuthedUserId(req);
  const habits = await buildDashboard(userId);
  res.json({ habits } satisfies { habits: DashboardHabit[] });
});

export default router;
