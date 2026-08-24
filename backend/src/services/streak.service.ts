
export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function prevDay(date: string): string {
  return addDays(date, -1);
}

export function calculateStreaks(checkinDates: string[], today: string): StreakResult {
  const set = new Set(checkinDates);

  const anchor = set.has(today) ? today : prevDay(today);
  let currentStreak = 0;
  if (set.has(anchor)) {
    let day = anchor;
    while (set.has(day)) {
      currentStreak += 1;
      day = prevDay(day);
    }
  }

  let longestStreak = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of [...set].sort()) {
    if (prev !== null && addDays(prev, 1) === d) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > longestStreak) longestStreak = run;
    prev = d;
  }

  return { currentStreak, longestStreak };
}
