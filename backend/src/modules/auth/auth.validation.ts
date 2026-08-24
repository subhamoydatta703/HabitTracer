import { z } from "zod";
import { isValidTimezone } from "../../services/timezone.service";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  timezone: z.string().refine(isValidTimezone, {
    message: "Invalid IANA timezone (e.g. Asia/Kolkata)",
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});