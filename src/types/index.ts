export type TaskCategory = 'needed' | 'rewarding' | 'maintenance';

export interface UserProfile {
  name: string;
  avatarUrl: string;
  archetype: string;
  level: number;
  xp: number;
  streakShields: number;
  joinedAt: string;
  hasOnboarded: boolean;
  email?: string;
  accountType?: 'google' | 'browser' | 'guest';
}

export interface UserAccountData {
  account: string;
  profile: UserProfile;
  tasks: Task[];
  habits: Habit[];
  diaryEntries: Record<string, DailyDiaryEntry>;
  notifications: NotificationItem[];
  xpPoints: number;
  updatedAt?: string;
}

export interface SubTask {
  id: string;
  title: string;
  estimatedMinutes: number;
  isCompleted: boolean;
  frictionReductionTip?: string;
}

export interface Task {
  id: string;
  sectionId?: string;
  title: string;
  category: TaskCategory;
  estimatedMinutes: number;
  actualMinutes?: number;
  isCompleted: boolean;
  completedAt?: string;
  subtasks: SubTask[];
  temptationBundle?: string; // Reward buff
  scheduledTime?: string; // e.g. "07:30"
  reminderMinutesBefore?: number;
  notes?: string;
  date: string; // YYYY-MM-DD
}

export interface DaySection {
  id: string;
  title: string;
  startTime: string; // "06:30"
  endTime: string;   // "09:00"
  color: string;     // Tailwind color key or hex
  description: string;
  order: number;
  icon?: string;
}

export type HabitType = 'build' | 'break';
export type HabitCategory = 'must_do_daily' | 'weekly_goal';

export interface Habit {
  id: string;
  title: string;
  type: HabitType; // 'build' [+] or 'break' [-]
  category: HabitCategory; // 'must_do_daily' or 'weekly_goal'
  targetPerWeek: number; // e.g. 7 for daily, 4 or 5 for weekly
  completions: Record<string, boolean>; // date string "YYYY-MM-DD" -> true
  currentStreak: number;
  bestStreak: number;
  identityStatement?: string;
  habitStack?: string;
  reminderTime?: string; // "08:00"
  color?: string;
}

export interface DailyDiaryEntry {
  id: string; // Unique log ID (e.g. log_timestamp_random)
  date: string; // YYYY-MM-DD
  logTime?: string; // e.g. "09:30 AM" or "Evening Check-in"
  logTitle?: string; // e.g. "Morning Check-in", "Afternoon Sprint", "Evening Victory"
  wins: string;
  onePercentBetter: string;
  frictionEncountered: string;
  rewardEnjoyed: string;
  amides?: string; // Daily reflection / notes / amends / amides
  energyRating: number; // 1-5
  aiCoachInsight?: string;
  identityAffirmation?: string;
  tasksCompletedCount: number;
  tasksTotalCount: number;
  habitsCompletedCount: number;
  habitsTotalCount: number;
  completedTaskTitles?: string[]; // List of completed tasks for that day
  completedHabitTitles?: string[]; // List of completed habits for that day
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'section' | 'habit' | 'balance';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AISplitResult {
  creativeTheme?: string;
  isTooBig: boolean;
  frictionAnalysis: string;
  recommendedTotalMinutes: number;
  subtasks: {
    title: string;
    estimatedMinutes: number;
    frictionReductionTip?: string;
  }[];
  temptationBundleSuggestion: string;
  proTip?: string;
}

export interface AIBalanceResult {
  status: string;
  sustainabilityScore: number;
  critique: string;
  recommendations: string[];
  temptationBundleIdea: string;
  strategyRule: string;
}

export interface AIReflectionResult {
  coachDebrief: string;
  microUpgrade: string;
  mindsetNote: string;
}
