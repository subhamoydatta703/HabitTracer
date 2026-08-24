
export interface CheckInDecision {
  allowed: boolean;
  status?: number;
  error?: string;
}

export function evaluateCheckIn(
  date: string,
  localToday: string,
  existingDates: string[],
  earliestDate?: string,
): CheckInDecision {
  if (earliestDate && date < earliestDate) {
    return { allowed: false, status: 400, error: "Cannot check in before the habit was created" };
  }
  if (date > localToday) {
    return { allowed: false, status: 400, error: "Cannot check in for a future date" };
  }
  if (existingDates.includes(date)) {
    return { allowed: false, status: 409, error: "Habit already has a check-in for this date" };
  }
  return { allowed: true };
}
