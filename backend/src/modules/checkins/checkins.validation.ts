import { z } from "zod";
import { isValidDateString } from "../../services/timezone.service";

export const createCheckInSchema = z.object({
  date: z.string().refine(isValidDateString, {
    message: "Invalid date, expected YYYY-MM-DD",
  }),
});