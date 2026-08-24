export interface User {
  id: string;
  email: string;
  timezone: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  habitId: string;
  date: string;
  checkedAt: string;
}

export interface DashboardHabit {
  id: string;
  name: string;
  description: string;
  todayCheckedIn: boolean;
  currentStreak: number;
  longestStreak: number;
  checkInCount: number;
  createdAt: string;
}

export interface InsightResult {
  jobId: string;
  status: string;
  question?: string;
  summary?: string;
  createdAt?: string;
}
