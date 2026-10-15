import React, { useState } from 'react';
import { Camera, Check, ArrowRight, ShieldCheck, Target, ListTodo } from 'lucide-react';
import { UserProfile, Habit, Task, TaskCategory } from '../types';
import { PRESET_AVATARS } from '../utils/storage';

interface OnboardingModalProps {
  onComplete: (
    profile: UserProfile,
    habits: Habit[],
    initialTasks: Task[]
  ) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Profile
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);

  // Step 2: Habits
  const [habit1, setHabit1] = useState('Solve 15 practice questions');
  const [habit2, setHabit2] = useState('No phone before breakfast');
  const [habit3, setHabit3] = useState('30m workout / physical activity');

  // Step 3: Tasks for today
  const [task1Title, setTask1Title] = useState('Study core priority subject / practice set');
  const [task1Duration, setTask1Duration] = useState(60);
  const [task1Category, setTask1Category] = useState<TaskCategory>('needed');

  const [task2Title, setTask2Title] = useState('30m gaming / favorite music break');
  const [task2Duration, setTask2Duration] = useState(30);
  const [task2Category, setTask2Category] = useState<TaskCategory>('rewarding');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinish = () => {
    const playerName = name.trim() || 'Player One';
    const profile: UserProfile = {
      name: playerName,
      avatarUrl: selectedAvatar,
      archetype: 'student',
      level: 1,
      xp: 150,
      streakShields: 2,
      joinedAt: new Date().toISOString(),
      hasOnboarded: true,
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const customHabits: Habit[] = [
      {
        id: `h_${Date.now()}_1`,
        title: habit1.trim() || 'Review Today’s Top Priorities',
        type: 'build',
        category: 'must_do_daily',
        targetPerWeek: 7,
        completions: {},
        currentStreak: 1,
        bestStreak: 1,
        reminderTime: '07:00',
        color: 'indigo',
      },
      {
        id: `h_${Date.now()}_2`,
        title: habit2.trim() || 'No Phone Scrolling in Bed',
        type: 'break',
        category: 'must_do_daily',
        targetPerWeek: 7,
        completions: {},
        currentStreak: 1,
        bestStreak: 1,
        reminderTime: '22:00',
        color: 'rose',
      },
      {
        id: `h_${Date.now()}_3`,
        title: habit3.trim() || 'Deep Focus Block (45m+)',
        type: 'build',
        category: 'weekly_goal',
        targetPerWeek: 5,
        completions: {},
        currentStreak: 1,
        bestStreak: 1,
        reminderTime: '17:00',
        color: 'sky',
      },
    ];

    const customTasks: Task[] = [
      {
        id: `task_${Date.now()}_1`,
        title: task1Title.trim() || 'Key Morning Priority Sprint',
        category: task1Category,
        estimatedMinutes: task1Duration,
        isCompleted: false,
        date: todayStr,
        scheduledTime: '08:00',
        temptationBundle: '20m guilt-free reward after finishing',
        subtasks: [
          {
            id: `sub_init_1`,
            title: '2-Minute Starter: Set up workspace and open first page',
            estimatedMinutes: 2,
            isCompleted: false,
          },
          {
            id: `sub_init_2`,
            title: 'Core focused execution block',
            estimatedMinutes: Math.max(15, task1Duration - 10),
            isCompleted: false,
          },
        ],
      },
      {
        id: `task_${Date.now()}_2`,
        title: task2Title.trim() || 'Guilt-Free Reward Block',
        category: task2Category,
        estimatedMinutes: task2Duration,
        isCompleted: false,
        date: todayStr,
        scheduledTime: '20:30',
        subtasks: [],
        notes: 'Dopamine reward for locking in today.',
      },
    ];

    onComplete(profile, customHabits, customTasks);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Welcome! Set Up Your Routine</h2>
            <p className="text-xs text-slate-500">Step {step} of 3 • Customise or Quick Start</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleFinish}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
              title="Skip setup and use defaults"
            >
              Quick Start ⚡
            </button>
            <div className="flex space-x-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-7 h-1.5 rounded-full transition-all ${
                    s === step
                      ? 'bg-indigo-600'
                      : s < step
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* STEP 1: PLAYER PROFILE & AVATAR */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">1. Your Profile & Avatar</h3>
              <p className="text-xs text-slate-500">
                Choose an avatar or upload your own picture to personalize your dashboard.
              </p>
            </div>

            <div className="flex flex-col items-center space-y-2.5 py-1">
              <div className="relative group">
                <img
                  src={selectedAvatar}
                  alt="Player Avatar"
                  className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-indigo-500 shadow-md object-cover"
                />
                <label className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer shadow-xs transition-all">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Preset Avatars */}
              <div className="flex items-center space-x-2 pt-1">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.url)}
                    className={`p-1 rounded-xl border transition-all cursor-pointer ${
                      selectedAvatar === av.url
                        ? 'border-indigo-500 bg-indigo-50 scale-105'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={av.url}
                      alt={av.label}
                      className="w-7 h-7 rounded-lg bg-slate-100"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Name / Tag *
              </label>
              <input
                type="text"
                placeholder="e.g. Alex, Sam, Cipher"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* STEP 2: CORE NON-NEGOTIABLES & HABITS */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">2. Core Non-Negotiables & Habits</h3>
              <p className="text-xs text-slate-500">
                These will show in your top-right habits box for quick daily execution.
              </p>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Non-Negotiable #1
                </label>
                <input
                  type="text"
                  value={habit1}
                  onChange={(e) => setHabit1(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Habit to Break / Limit #2
                </label>
                <input
                  type="text"
                  value={habit2}
                  onChange={(e) => setHabit2(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weekly Goal #3 (e.g. 4-5x per week)
                </label>
                <input
                  type="text"
                  value={habit3}
                  onChange={(e) => setHabit3(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: TODAY'S KEY THINGS TO DO */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">3. Things to Do Today</h3>
              <p className="text-xs text-slate-500">
                Pair your high-priority study/work task with an intentional reward treat.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-indigo-700 block">
                  🔵 Core Needed Task
                </span>
                <input
                  type="text"
                  value={task1Title}
                  onChange={(e) => setTask1Title(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                />
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <span>Duration:</span>
                  <select
                    value={task1Duration}
                    onChange={(e) => setTask1Duration(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                  >
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                    <option value={90}>90 mins</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 block">
                  🟢 Planned Reward Activity
                </span>
                <input
                  type="text"
                  value={task2Title}
                  onChange={(e) => setTask2Title(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                />
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <span>Duration:</span>
                  <select
                    value={task2Duration}
                    onChange={(e) => setTask2Duration(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                  >
                    <option value={20}>20 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Enter Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
