import { DaySection, Task, Habit, DailyDiaryEntry, NotificationItem, UserProfile } from '../types';

export const STORAGE_KEYS = {
  USER_PROFILE: 'gamin_life_profile',
  SECTIONS: 'gamin_life_sections',
  TASKS: 'gamin_life_tasks',
  HABITS: 'gamin_life_habits',
  DIARY: 'gamin_life_diary',
  NOTIFICATIONS: 'gamin_life_notifications',
  ACTIVE_DATE: 'gamin_life_active_date',
  ACTIVE_ACCOUNT: 'gamin_life_active_account',
  XP: 'gamin_life_xp',
};

// Preset gamer avatars
export const PRESET_AVATARS = [
  {
    id: 'avatar_1',
    label: 'Cyber Ronin',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ShadowNinja&backgroundColor=020617',
  },
  {
    id: 'avatar_2',
    label: 'Scholar Knight',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aspirant&backgroundColor=0f172a',
  },
  {
    id: 'avatar_3',
    label: 'Focus Mage',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=FocusMaster&backgroundColor=1e1b4b',
  },
  {
    id: 'avatar_4',
    label: 'Tech Architect',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Architect&backgroundColor=042f2e',
  },
  {
    id: 'avatar_5',
    label: 'Apex Runner',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ApexRunner&backgroundColor=311042',
  },
];

// Preset day sections
export const PRESET_SECTION_TEMPLATES: Record<string, { label: string; description: string; sections: DaySection[] }> = {
  student: {
    label: 'Student Rhythm (Home Morning & Evening + College)',
    description: 'Home in mornings and evenings, campus / lectures during midday.',
    sections: [
      {
        id: 'sec_morning_home',
        title: 'Morning Focus Block (Home)',
        startTime: '06:00',
        endTime: '08:30',
        color: 'sky',
        description: 'Revision, problem sets, and calm breakfast before leaving.',
        order: 1,
        icon: 'sunrise',
      },
      {
        id: 'sec_campus_day',
        title: 'College & Classes (Campus Block)',
        startTime: '09:00',
        endTime: '16:00',
        color: 'indigo',
        description: 'Lectures, labs, practicals, peer discussions, and lunch.',
        order: 2,
        icon: 'school',
      },
      {
        id: 'sec_evening_home',
        title: 'Evening Deep Study (Home)',
        startTime: '16:30',
        endTime: '20:00',
        color: 'amber',
        description: 'Homework, numericals, practice sets at home.',
        order: 3,
        icon: 'book-open',
      },
      {
        id: 'sec_night_reward',
        title: 'Night Recharge & Reward Vault',
        startTime: '20:30',
        endTime: '22:30',
        color: 'emerald',
        description: 'Dinner, gaming/hobbies, reading, daily log & sleep.',
        order: 4,
        icon: 'moon',
      },
    ],
  },
  professional: {
    label: 'Work & Side-Quest Rhythm',
    description: 'Core 9-5 work with morning fitness and evening skill building.',
    sections: [
      {
        id: 'sec_am_deep',
        title: 'Morning Focus & Health',
        startTime: '06:30',
        endTime: '08:30',
        color: 'sky',
        description: 'Workout, reading, high priority item before work.',
        order: 1,
        icon: 'dumbbell',
      },
      {
        id: 'sec_day_core',
        title: 'Work / Professional Sprints',
        startTime: '09:00',
        endTime: '17:30',
        color: 'indigo',
        description: 'Primary job tasks, meetings, sprint work.',
        order: 2,
        icon: 'briefcase',
      },
      {
        id: 'sec_pm_side',
        title: 'Evening Side Quests & Projects',
        startTime: '18:30',
        endTime: '20:30',
        color: 'purple',
        description: 'Learning, coding, creative hobby or side business.',
        order: 3,
        icon: 'flame',
      },
      {
        id: 'sec_pm_wind',
        title: 'Night Chill & Wind-down',
        startTime: '21:00',
        endTime: '23:00',
        color: 'emerald',
        description: 'Social time, relaxation, daily log.',
        order: 4,
        icon: 'moon',
      },
    ],
  },
  flexible: {
    label: 'Triple-Block Sprint (3 Blocks)',
    description: 'Streamlined triad: morning sprint, midday execution, evening recovery.',
    sections: [
      {
        id: 'sec_flex_1',
        title: 'Morning Deep Sprint',
        startTime: '07:30',
        endTime: '12:00',
        color: 'blue',
        description: 'Heaviest cognitive lift and top priority project.',
        order: 1,
        icon: 'zap',
      },
      {
        id: 'sec_flex_2',
        title: 'Afternoon Ops & Collab',
        startTime: '13:00',
        endTime: '17:30',
        color: 'amber',
        description: 'Communications, chores, meetings, maintenance items.',
        order: 2,
        icon: 'cpu',
      },
      {
        id: 'sec_flex_3',
        title: 'Evening Rewards & Rest',
        startTime: '18:30',
        endTime: '22:30',
        color: 'emerald',
        description: 'Physical activity, social time, guilt-free play.',
        order: 3,
        icon: 'smile',
      },
    ],
  },
};

// Initial default habits
export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit_1',
    title: 'Review Today’s 3 Needed Priorities',
    type: 'build',
    category: 'must_do_daily',
    targetPerWeek: 7,
    completions: {},
    currentStreak: 4,
    bestStreak: 12,
    identityStatement: 'I plan each day intentionally rather than reacting to chaos.',
    habitStack: 'After morning tea, spend 2 minutes checking today’s sections.',
    reminderTime: '06:45',
    color: 'indigo',
  },
  {
    id: 'habit_2',
    title: 'No Phone Scrolling in Bed',
    type: 'break',
    category: 'must_do_daily',
    targetPerWeek: 7,
    completions: {},
    currentStreak: 6,
    bestStreak: 14,
    identityStatement: 'I protect my sleep and morning attention.',
    habitStack: 'When getting into bed, plug phone across the room.',
    reminderTime: '22:15',
    color: 'rose',
  },
  {
    id: 'habit_3',
    title: 'Complete 4 Deep Focus Blocks (45m+)',
    type: 'build',
    category: 'weekly_goal',
    targetPerWeek: 5,
    completions: {},
    currentStreak: 3,
    bestStreak: 8,
    identityStatement: 'I value deep immersion over superficial busywork.',
    habitStack: 'After clearing desk, put headphones on and start a 45m timer.',
    reminderTime: '17:00',
    color: 'sky',
  },
  {
    id: 'habit_4',
    title: 'Physical Exercise / Run or Gym',
    type: 'build',
    category: 'weekly_goal',
    targetPerWeek: 4,
    completions: {},
    currentStreak: 2,
    bestStreak: 5,
    identityStatement: 'I maintain high physical energy and stamina.',
    habitStack: 'After finishing classes/work, change into workout gear.',
    reminderTime: '16:30',
    color: 'emerald',
  },
];

// Initial seed tasks for today demonstrating Needed, Rewarding, and Maintenance
export function getInitialSeedTasks(todayStr: string): Task[] {
  return [
    {
      id: 'task_seed_1',
      sectionId: 'sec_morning_home',
      title: 'Review Chemistry Reaction Mechanisms',
      category: 'needed',
      estimatedMinutes: 60,
      isCompleted: false,
      date: todayStr,
      scheduledTime: '06:45',
      reminderMinutesBefore: 5,
      temptationBundle: '20 min fresh coffee + favorite playlist break',
      subtasks: [
        {
          id: 'sub_1_1',
          title: '2-Minute Starter: Open notebook to chapter summary notes',
          estimatedMinutes: 2,
          isCompleted: true,
          frictionReductionTip: 'Make it easy to start.',
        },
        {
          id: 'sub_1_2',
          title: 'Solve 10 practice electrophilic addition problems',
          estimatedMinutes: 35,
          isCompleted: false,
        },
        {
          id: 'sub_1_3',
          title: 'Flag 2 tricky reactions for discussion',
          estimatedMinutes: 10,
          isCompleted: false,
        },
      ],
      notes: 'Focus on electrophilic additions and mark doubts.',
    },
    {
      id: 'task_seed_2',
      sectionId: 'sec_morning_home',
      title: 'Quick Desk & Bag Organization',
      category: 'maintenance',
      estimatedMinutes: 15,
      isCompleted: true,
      completedAt: '08:00',
      date: todayStr,
      scheduledTime: '08:00',
      subtasks: [],
      notes: 'Prepare notes and calculator for classes.',
    },
    {
      id: 'task_seed_3',
      sectionId: 'sec_evening_home',
      title: 'Maths Problem Set: Integration & Calculus',
      category: 'needed',
      estimatedMinutes: 75,
      isCompleted: false,
      date: todayStr,
      scheduledTime: '17:00',
      reminderMinutesBefore: 10,
      temptationBundle: '30 mins guilt-free gaming session right after!',
      subtasks: [
        {
          id: 'sub_3_1',
          title: 'Write out formula reference index on clean page',
          estimatedMinutes: 5,
          isCompleted: false,
        },
        {
          id: 'sub_3_2',
          title: 'Solve Question 1 to 15 without checking answers',
          estimatedMinutes: 45,
          isCompleted: false,
        },
        {
          id: 'sub_3_3',
          title: 'Self-grade with solutions and log mistakes in error notebook',
          estimatedMinutes: 20,
          isCompleted: false,
        },
      ],
    },
    {
      id: 'task_seed_4',
      sectionId: 'sec_night_reward',
      title: 'Gaming Session / Guild Play (Reward Vault)',
      category: 'rewarding',
      estimatedMinutes: 45,
      isCompleted: false,
      date: todayStr,
      scheduledTime: '20:45',
      temptationBundle: 'Unlocked after finishing Maths problem set!',
      subtasks: [],
      notes: 'Guilt-free relaxation to keep daily momentum strong.',
    },
    {
      id: 'task_seed_5',
      sectionId: 'sec_night_reward',
      title: 'Daily Victory Log & Evening Debrief',
      category: 'maintenance',
      estimatedMinutes: 10,
      isCompleted: false,
      date: todayStr,
      scheduledTime: '22:15',
      subtasks: [],
      notes: 'Log wins and micro-upgrades for tomorrow.',
    },
  ];
}

// User Profile helpers
export function loadUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.error('Error loading profile:', e);
  }
  return null;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

export function getActiveAccount(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ACCOUNT) || 'default';
  } catch {
    return 'default';
  }
}

export function setActiveAccount(account: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT, account.toLowerCase().trim());
  } catch (e) {
    console.error('Error saving active account:', e);
  }
}

// Storage helpers
export function loadSections(): DaySection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SECTIONS) || localStorage.getItem('atomic_flow_sections');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading sections:', e);
  }
  return PRESET_SECTION_TEMPLATES.student.sections;
}

export function saveSections(sections: DaySection[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SECTIONS, JSON.stringify(sections));
  } catch (e) {
    console.error('Error saving sections:', e);
  }
}

export function loadTasks(todayStr: string): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS) || localStorage.getItem('atomic_flow_tasks');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading tasks:', e);
  }
  const initial = getInitialSeedTasks(todayStr);
  saveTasks(initial);
  return initial;
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
}

export function loadHabits(todayStr: string): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS) || localStorage.getItem('atomic_flow_habits');
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Error loading habits:', e);
  }
  const habits = DEFAULT_HABITS.map((h, i) => {
    const completions: Record<string, boolean> = {};
    if (i === 0) completions[todayStr] = true;
    return { ...h, completions };
  });
  saveHabits(habits);
  return habits;
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Error saving habits:', e);
  }
}

export function loadDiaryEntries(): Record<string, DailyDiaryEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIARY) || localStorage.getItem('atomic_flow_diary');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const normalized: Record<string, DailyDiaryEntry> = {};
        for (const key of Object.keys(parsed)) {
          const item = parsed[key];
          if (item && typeof item === 'object') {
            const entryId = item.id || `log_${item.date || key}_${Date.parse(item.updatedAt || '0') || key}`;
            normalized[entryId] = {
              ...item,
              id: entryId,
              date: item.date || key,
            };
          }
        }
        return normalized;
      }
    }
  } catch (e) {
    console.error('Error loading diary:', e);
  }
  return {};
}

export function saveDiaryEntry(entry: DailyDiaryEntry): void {
  try {
    const existing = loadDiaryEntries();
    const entryId = entry.id || `log_${entry.date}_${Date.now()}`;
    const finalizedEntry: DailyDiaryEntry = {
      ...entry,
      id: entryId,
    };
    existing[entryId] = finalizedEntry;
    localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(existing));
  } catch (e) {
    console.error('Error saving diary:', e);
  }
}

export function deleteDiaryEntry(entryId: string): void {
  try {
    const existing = loadDiaryEntries();
    delete existing[entryId];
    localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(existing));
  } catch (e) {
    console.error('Error deleting diary entry:', e);
  }
}

export function loadNotifications(): NotificationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || localStorage.getItem('atomic_flow_notifications');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading notifications:', e);
  }
  return [];
}

export function saveNotifications(items: NotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(items.slice(0, 50)));
  } catch (e) {
    console.error('Error saving notifications:', e);
  }
}

export function exportAllData(): string {
  const data = {
    profile: loadUserProfile(),
    tasks: loadTasks(new Date().toISOString().split('T')[0]),
    habits: loadHabits(new Date().toISOString().split('T')[0]),
    diary: loadDiaryEntries(),
    notifications: loadNotifications(),
    xp: Number(localStorage.getItem(STORAGE_KEYS.XP) || '320'),
    activeAccount: getActiveAccount(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.profile) saveUserProfile(parsed.profile);
    if (Array.isArray(parsed.tasks)) saveTasks(parsed.tasks);
    if (Array.isArray(parsed.habits)) saveHabits(parsed.habits);
    if (parsed.diary) localStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(parsed.diary));
    if (Array.isArray(parsed.notifications)) saveNotifications(parsed.notifications);
    if (parsed.xp !== undefined) localStorage.setItem(STORAGE_KEYS.XP, parsed.xp.toString());
    if (parsed.activeAccount) setActiveAccount(parsed.activeAccount);
    return true;
  } catch (e) {
    console.error('Failed to import data:', e);
    return false;
  }
}
