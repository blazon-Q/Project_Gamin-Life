/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { HabitsWidget } from './components/HabitsWidget';
import { ThingsToBeDone } from './components/ThingsToBeDone';
import { DailyBalanceBar } from './components/DailyBalanceBar';
import { TaskSplitterModal } from './components/TaskSplitterModal';
import { BalanceCoachModal } from './components/BalanceCoachModal';
import { DiaryModal } from './components/DiaryModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import { ProfileModal } from './components/ProfileModal';
import { AccountModal } from './components/AccountModal';
import {
  Task,
  Habit,
  DailyDiaryEntry,
  NotificationItem,
  TaskCategory,
  SubTask,
  UserProfile,
} from './types';
import {
  loadUserProfile,
  saveUserProfile,
  loadTasks,
  saveTasks,
  loadHabits,
  saveHabits,
  loadDiaryEntries,
  saveDiaryEntry,
  loadNotifications,
  saveNotifications,
  PRESET_AVATARS,
  getActiveAccount,
  setActiveAccount,
} from './utils/storage';
import { syncService, SyncStatus } from './utils/syncService';
import { checkUpcomingReminders } from './utils/notifications';
import { playSuccessChime, playLevelUpFanfare } from './utils/audio';
import { Bell, X } from 'lucide-react';

export default function App() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [currentDate, setCurrentDate] = useState<string>(todayStr);

  // User Profile & Onboarding State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const loaded = loadUserProfile();
    if (loaded) return loaded;
    return {
      name: 'Player One',
      avatarUrl: PRESET_AVATARS[0].url,
      archetype: 'student',
      level: 1,
      xp: 320,
      streakShields: 2,
      joinedAt: new Date().toISOString(),
      hasOnboarded: true,
      accountType: 'guest',
    };
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('saved');
  const [activeAccount, setActiveAccountState] = useState<string>(() => getActiveAccount());

  // Persistent States
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks(todayStr));
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits(todayStr));
  const [diaryEntries, setDiaryEntries] = useState<Record<string, DailyDiaryEntry>>(() =>
    loadDiaryEntries()
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadNotifications()
  );

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [xpPoints, setXpPoints] = useState<number>(() => {
    const raw = localStorage.getItem('gamin_life_xp') || localStorage.getItem('atomic_flow_xp');
    return raw ? Number(raw) : 320;
  });

  // Modal controls
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // Task Splitter Modal state
  const [activeSplitterData, setActiveSplitterData] = useState<{
    title: string;
    duration: number;
    category: TaskCategory;
  } | null>(null);

  // Floating in-app toast for timely reminders
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);
  const notifiedKeysRef = useRef<Set<string>>(new Set());

  // Initial server load & status subscription
  useEffect(() => {
    const currentAcc = getActiveAccount();
    syncService.fetchServerData(currentAcc).then((serverData) => {
      if (serverData) {
        if (serverData.profile) setUserProfile(serverData.profile);
        if (Array.isArray(serverData.tasks) && serverData.tasks.length > 0) setTasks(serverData.tasks);
        if (Array.isArray(serverData.habits) && serverData.habits.length > 0) setHabits(serverData.habits);
        if (serverData.diaryEntries) setDiaryEntries(serverData.diaryEntries);
        if (serverData.notifications) setNotifications(serverData.notifications);
        if (serverData.xpPoints !== undefined) setXpPoints(serverData.xpPoints);
      } else {
        // Seed server with initial state so it's permanently stored on disk immediately
        if (userProfile) {
          syncService.saveImmediately({
            account: currentAcc,
            profile: userProfile,
            tasks,
            habits,
            diaryEntries,
            notifications,
            xpPoints,
          });
        }
      }
    });

    const unsub = syncService.subscribeStatus((status) => {
      setSyncStatus(status);
    });

    return unsub;
  }, []);

  // Save changes to localStorage AND queue persistent cloud sync
  useEffect(() => {
    if (userProfile) {
      saveUserProfile(userProfile);
    }
    saveTasks(tasks);
    saveHabits(habits);
    saveNotifications(notifications);
    localStorage.setItem('gamin_life_xp', xpPoints.toString());

    if (userProfile) {
      syncService.queueCloudSync({
        account: activeAccount,
        profile: {
          ...userProfile,
          xp: xpPoints,
          level: Math.floor(xpPoints / 250) + 1,
        },
        tasks,
        habits,
        diaryEntries,
        notifications,
        xpPoints,
      });
    }
  }, [userProfile, tasks, habits, diaryEntries, notifications, xpPoints, activeAccount]);

  // Timely Reminder interval check
  useEffect(() => {
    const interval = setInterval(() => {
      checkUpcomingReminders(
        tasks,
        habits,
        notifiedKeysRef.current,
        (notif, idKey) => {
          notifiedKeysRef.current.add(idKey);
          setNotifications((prev) => [notif, ...prev]);
          setActiveToast(notif);
        }
      );
    }, 15000);

    return () => clearInterval(interval);
  }, [tasks, habits]);

  // Add XP helper with level-up chime
  const addXp = (amount: number) => {
    setXpPoints((prev) => {
      const next = prev + amount;
      const oldLevel = Math.floor(prev / 250) + 1;
      const newLevel = Math.floor(next / 250) + 1;
      if (newLevel > oldLevel && soundEnabled) {
        playLevelUpFanfare();
      }
      return next;
    });
  };

  // Onboarding Complete Handler
  const handleOnboardingComplete = (
    newProfile: UserProfile,
    newHabits: Habit[],
    newTasks: Task[]
  ) => {
    const finalized: UserProfile = {
      ...newProfile,
      hasOnboarded: true,
    };
    setUserProfile(finalized);
    setHabits(newHabits);
    setTasks(newTasks);
    addXp(100);
    localStorage.setItem('gamin_life_onboarded', 'true');
    saveUserProfile(finalized);
    saveTasks(newTasks);
    saveHabits(newHabits);
    syncService.saveImmediately({
      account: activeAccount,
      profile: finalized,
      tasks: newTasks,
      habits: newHabits,
      diaryEntries,
      notifications,
      xpPoints: xpPoints + 100,
    });
  };

  // Account Loaded / Switched Handler
  const handleAccountLoaded = (loaded: {
    profile: UserProfile;
    tasks: Task[];
    habits: Habit[];
    diaryEntries: Record<string, DailyDiaryEntry>;
    notifications: NotificationItem[];
    xpPoints: number;
    accountKey?: string;
  }) => {
    setUserProfile(loaded.profile);
    setTasks(loaded.tasks);
    setHabits(loaded.habits);
    setDiaryEntries(loaded.diaryEntries);
    setNotifications(loaded.notifications);
    setXpPoints(loaded.xpPoints);
    if (loaded.accountKey) {
      setActiveAccountState(loaded.accountKey);
      setActiveAccount(loaded.accountKey);
    }
    saveUserProfile(loaded.profile);
    saveTasks(loaded.tasks);
    saveHabits(loaded.habits);
    localStorage.setItem('gamin_life_onboarded', 'true');
    localStorage.setItem('gamin_life_xp', loaded.xpPoints.toString());
  };

  // Toggle Task Completion
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextState = !t.isCompleted;
          if (nextState) {
            if (soundEnabled) playSuccessChime();
            addXp(20);
          }
          const updatedSubtasks = t.subtasks.map((s) => ({
            ...s,
            isCompleted: nextState,
          }));
          return {
            ...t,
            isCompleted: nextState,
            completedAt: nextState ? new Date().toISOString() : undefined,
            subtasks: updatedSubtasks,
          };
        }
        return t;
      })
    );
  };

  // Toggle Subtask Completion
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((s) => {
            if (s.id === subtaskId) {
              const nextState = !s.isCompleted;
              if (nextState) {
                if (soundEnabled) playSuccessChime();
                addXp(10);
              }
              return { ...s, isCompleted: nextState };
            }
            return s;
          });

          const allDone = updatedSubtasks.every((s) => s.isCompleted);
          return {
            ...t,
            subtasks: updatedSubtasks,
            isCompleted: allDone,
          };
        }
        return t;
      })
    );
  };

  // Add Task
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'isCompleted'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isCompleted: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    addXp(5);
  };

  // Delete Task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Toggle Habit
  const handleToggleHabit = (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const isDone = Boolean(h.completions[currentDate]);
          const newCompletions = { ...h.completions };

          if (isDone) {
            delete newCompletions[currentDate];
            return {
              ...h,
              completions: newCompletions,
              currentStreak: Math.max(0, h.currentStreak - 1),
            };
          } else {
            newCompletions[currentDate] = true;
            if (soundEnabled) playSuccessChime();
            addXp(25);
            const newStreak = h.currentStreak + 1;
            return {
              ...h,
              completions: newCompletions,
              currentStreak: newStreak,
              bestStreak: Math.max(h.bestStreak, newStreak),
            };
          }
        }
        return h;
      })
    );
  };

  // Add Habit
  const handleAddHabit = (
    newHabitData: Omit<Habit, 'id' | 'currentStreak' | 'bestStreak' | 'completions'>
  ) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      currentStreak: 0,
      bestStreak: 0,
      completions: {},
    };
    setHabits((prev) => [...prev, newHabit]);
    addXp(15);
  };

  // Delete Habit
  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  // Save Diary Entry (supports multiple logs per day)
  const handleSaveDiaryEntry = (entry: DailyDiaryEntry) => {
    saveDiaryEntry(entry);
    setDiaryEntries((prev) => ({ ...prev, [entry.id]: entry }));
    addXp(50);
  };

  // Delete Diary Entry
  const handleDeleteDiaryEntry = (entryId: string) => {
    setDiaryEntries((prev) => {
      const next = { ...prev };
      delete next[entryId];
      return next;
    });
  };

  // Apply Subtasks from AI Splitter Modal
  const handleApplySplitSubtasks = (
    title: string,
    duration: number,
    category: TaskCategory,
    subtasks: SubTask[],
    temptationBundle?: string
  ) => {
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      category,
      estimatedMinutes: duration,
      isCompleted: false,
      date: currentDate,
      subtasks,
      temptationBundle,
    };
    setTasks((prev) => [newTask, ...prev]);
    setActiveSplitterData(null);
    addXp(10);
  };

  const currentProfile: UserProfile = userProfile || {
    name: 'Player One',
    avatarUrl: PRESET_AVATARS[0].url,
    archetype: 'student',
    level: Math.floor(xpPoints / 250) + 1,
    xp: xpPoints,
    streakShields: 2,
    joinedAt: new Date().toISOString(),
    hasOnboarded: true,
  };

  const completedQuestsCount = tasks.filter((t) => t.isCompleted).length;
  const maxHabitStreak = Math.max(0, ...habits.map((h) => h.currentStreak));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Onboarding Wizard on fresh visits if not yet completed */}
      {!userProfile?.hasOnboarded && !localStorage.getItem('gamin_life_onboarded') && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Clean Light Header */}
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenDiary={() => setIsDiaryOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        xpPoints={xpPoints}
        userProfile={currentProfile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAccount={() => setIsAccountModalOpen(true)}
        syncStatus={syncStatus}
        activeAccount={activeAccount}
      />

      {/* Floating In-App Reminder Toast */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-40 max-w-sm w-full bg-white border border-indigo-200 rounded-2xl p-4 shadow-xl flex items-start space-x-3 animate-in slide-in-from-bottom duration-300">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <div className="font-bold text-slate-900 mb-0.5">{activeToast.title}</div>
            <p className="text-slate-600 leading-relaxed">{activeToast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* Top Right: Non-Negotiables / Habits small box (maximizes when clicked) */}
        <div className="flex justify-end">
          <div className="w-full sm:w-80">
            <HabitsWidget
              habits={habits}
              currentDate={currentDate}
              onToggleHabit={handleToggleHabit}
              onAddHabit={handleAddHabit}
              onDeleteHabit={handleDeleteHabit}
            />
          </div>
        </div>

        {/* 1. FIRST: THINGS TO BE DONE (Simple Entry Field + Display Field under ONE Heading) */}
        <section aria-label="Things to Be Done">
          <ThingsToBeDone
            tasks={tasks}
            currentDate={currentDate}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onToggleSubtask={handleToggleSubtask}
            onDeleteTask={handleDeleteTask}
            onOpenTaskSplitter={(data) => setActiveSplitterData(data)}
          />
        </section>

        {/* 2. SECOND: ITS AI RATING (Ratio of Needed : Rewarding : Chores as per human answers) */}
        <section aria-label="AI Schedule Rating">
          <DailyBalanceBar
            tasks={tasks.filter((t) => t.date === currentDate)}
            onOpenCoachModal={() => setIsCoachOpen(true)}
          />
        </section>
      </main>

      {/* Modals */}

      {/* Profile & Avatar Customizer Modal */}
      {isProfileModalOpen && (
        <ProfileModal
          profile={currentProfile}
          xpPoints={xpPoints}
          habitsStreak={maxHabitStreak}
          completedQuestsCount={completedQuestsCount}
          onClose={() => setIsProfileModalOpen(false)}
          onSaveProfile={(updated) => setUserProfile(updated)}
        />
      )}

      {/* Account & Cloud Memory Modal */}
      {isAccountModalOpen && (
        <AccountModal
          userProfile={currentProfile}
          tasks={tasks}
          habits={habits}
          diaryEntries={diaryEntries}
          notifications={notifications}
          xpPoints={xpPoints}
          onClose={() => setIsAccountModalOpen(false)}
          onAccountLoaded={handleAccountLoaded}
        />
      )}

      {/* AI Task Sizing & Friction Splitter Modal */}
      {activeSplitterData && (
        <TaskSplitterModal
          taskData={activeSplitterData}
          onClose={() => setActiveSplitterData(null)}
          onApplySubtasks={handleApplySplitSubtasks}
        />
      )}

      {/* AI Schedule Feedback Coach Modal */}
      {isCoachOpen && (
        <BalanceCoachModal
          tasks={tasks.filter((t) => t.date === currentDate)}
          habits={habits}
          onClose={() => setIsCoachOpen(false)}
        />
      )}

      {/* Daily Victory Log Modal */}
      {isDiaryOpen && (
        <DiaryModal
          currentDate={currentDate}
          tasks={tasks}
          habits={habits}
          diaryEntries={diaryEntries}
          onClose={() => setIsDiaryOpen(false)}
          onSaveEntry={handleSaveDiaryEntry}
          onDeleteEntry={handleDeleteDiaryEntry}
        />
      )}

      {/* Notification Reminders Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onClearNotifications={() => setNotifications([])}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        tasks={tasks}
        habits={habits}
        currentDate={currentDate}
      />
    </div>
  );
}
