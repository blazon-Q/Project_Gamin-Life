import React, { useState } from 'react';
import {
  Target,
  Flame,
  Plus,
  CheckCircle2,
  Circle,
  TrendingUp,
  Award,
  Zap,
  Sparkles,
  ArrowRight,
  Trash2,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { Habit, HabitCategory, HabitType } from '../types';

interface HabitsTopBoxProps {
  habits: Habit[];
  currentDate: string;
  onToggleHabit: (habitId: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'currentStreak' | 'bestStreak' | 'completions'>) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitsTopBox: React.FC<HabitsTopBoxProps> = ({
  habits,
  currentDate,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'weekly'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Habit form state
  const [title, setTitle] = useState('');
  const [habitType, setHabitType] = useState<HabitType>('build');
  const [category, setCategory] = useState<HabitCategory>('must_do_daily');
  const [targetPerWeek, setTargetPerWeek] = useState(7);
  const [identityStatement, setIdentityStatement] = useState('');
  const [habitStack, setHabitStack] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  // Generate current week dates (Monday to Sunday)
  const getWeekDates = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDay();
    const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diffToMonday));

    const week = [];
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      const iso = nextDate.toISOString().split('T')[0];
      week.push({
        iso,
        label: dayLabels[i],
        dayNum: nextDate.getDate(),
        isCurrent: iso === currentDate,
      });
    }
    return week;
  };

  const weekDays = getWeekDates(currentDate);

  // Calculations for progress beside the list
  const dailyHabits = habits.filter((h) => h.category === 'must_do_daily');
  const weeklyHabits = habits.filter((h) => h.category === 'weekly_goal');

  const dailyDoneCount = dailyHabits.filter((h) => Boolean(h.completions[currentDate])).length;
  const dailyRate = dailyHabits.length > 0 ? Math.round((dailyDoneCount / dailyHabits.length) * 100) : 0;

  // Weekly rate: count total completions this week across weekly habits
  const currentWeekDaysIso = weekDays.map((w) => w.iso);
  let totalWeeklyTarget = 0;
  let totalWeeklyDone = 0;
  weeklyHabits.forEach((h) => {
    totalWeeklyTarget += h.targetPerWeek;
    const doneThisWeek = currentWeekDaysIso.filter((iso) => Boolean(h.completions[iso])).length;
    totalWeeklyDone += Math.min(doneThisWeek, h.targetPerWeek);
  });
  const weeklyRate = totalWeeklyTarget > 0 ? Math.round((totalWeeklyDone / totalWeeklyTarget) * 100) : 0;

  const filteredHabits = habits.filter((h) => {
    if (activeTab === 'daily') return h.category === 'must_do_daily';
    if (activeTab === 'weekly') return h.category === 'weekly_goal';
    return true;
  });

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddHabit({
      title: title.trim(),
      type: habitType,
      category,
      targetPerWeek: category === 'must_do_daily' ? 7 : targetPerWeek,
      identityStatement: identityStatement.trim() || undefined,
      habitStack: habitStack.trim() || undefined,
      reminderTime: reminderTime.trim() || undefined,
    });

    setTitle('');
    setIdentityStatement('');
    setHabitStack('');
    setReminderTime('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* Box Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 px-5 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Target className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Habits & Daily Commitments
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                {habits.length} Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Must-Do Daily Non-Negotiables & Weekly Targets
            </p>
          </div>
        </div>

        {/* Tab switcher & Add Button */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({habits.length})
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                activeTab === 'daily'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Must-Do Daily ({dailyHabits.length})
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                activeTab === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly Goals ({weeklyHabits.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Habit</span>
          </button>
        </div>
      </div>

      {/* Main Box Content: Habits List on Left, Progress Dashboard on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Column: Habits List (8 cols) */}
        <div className="lg:col-span-8 p-4 sm:p-5 space-y-3">
          {filteredHabits.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              No habits in this category yet. Click "+ Add Habit" to create your first commitment.
            </div>
          ) : (
            filteredHabits.map((habit) => {
              const isDoneToday = Boolean(habit.completions[currentDate]);
              const completedDaysThisWeek = currentWeekDaysIso.filter((iso) => Boolean(habit.completions[iso])).length;

              return (
                <div
                  key={habit.id}
                  className={`group relative p-3 sm:p-3.5 rounded-xl border transition-all ${
                    isDoneToday
                      ? 'bg-slate-900/40 border-emerald-500/25'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Checkbox & Info */}
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <button
                        onClick={() => onToggleHabit(habit.id)}
                        className={`mt-0.5 flex-shrink-0 transition-transform active:scale-90 ${
                          isDoneToday
                            ? 'text-emerald-400 hover:text-emerald-300'
                            : 'text-slate-500 hover:text-indigo-400'
                        }`}
                        title={isDoneToday ? 'Mark incomplete for today' : 'Mark completed today (+25 XP)'}
                      >
                        {isDoneToday ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {/* Build vs Break Tag */}
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              habit.type === 'build'
                                ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                            }`}
                          >
                            {habit.type === 'build' ? '+ Build' : '- Break'}
                          </span>

                          {/* Category Tag */}
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {habit.category === 'must_do_daily' ? 'Daily Must-Do' : `Weekly Goal: ${habit.targetPerWeek}x/wk`}
                          </span>

                          {/* Streak Badge */}
                          {habit.currentStreak > 0 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                              {habit.currentStreak}d streak
                            </span>
                          )}

                          {habit.reminderTime && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ⏰ {habit.reminderTime}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4
                          className={`text-sm font-semibold transition-all ${
                            isDoneToday ? 'text-slate-300 line-through decoration-slate-600' : 'text-white'
                          }`}
                        >
                          {habit.title}
                        </h4>

                        {/* Identity or Habit Stack Formula */}
                        {habit.habitStack && (
                          <p className="text-xs text-indigo-300/80 mt-1 italic flex items-center gap-1 font-mono">
                            <span className="text-indigo-400 font-sans font-medium">Stack:</span> {habit.habitStack}
                          </p>
                        )}
                        {habit.identityStatement && !habit.habitStack && (
                          <p className="text-xs text-slate-400 mt-1 italic">
                            "{habit.identityStatement}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Week Matrix & Delete */}
                    <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
                      {/* 7-Day Weekly Matrix (Mon - Sun) */}
                      <div className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800/80">
                        {weekDays.map((day) => {
                          const isDone = Boolean(habit.completions[day.iso]);
                          const isTodayDate = day.iso === currentDate;
                          return (
                            <div
                              key={day.iso}
                              className="flex flex-col items-center"
                              title={`${day.label} (${day.iso}): ${isDone ? 'Done' : 'Not yet'}`}
                            >
                              <span className="text-[9px] text-slate-500 font-mono mb-0.5">
                                {day.label}
                              </span>
                              <div
                                className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center transition-all ${
                                  isDone
                                    ? 'bg-emerald-500 text-slate-950 font-bold text-[8px]'
                                    : isTodayDate
                                    ? 'border border-indigo-400 bg-indigo-500/10'
                                    : 'bg-slate-800/80'
                                }`}
                              >
                                {isDone && '✓'}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Week progress counter */}
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                        <span>
                          {completedDaysThisWeek}/{habit.targetPerWeek} this week
                        </span>
                        <button
                          onClick={() => onDeleteHabit(habit.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                          title="Delete habit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Progress Beside the List of Things (4 cols) */}
        <div className="lg:col-span-4 p-4 sm:p-5 bg-slate-950/40 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                Commitment Progress
              </h3>
              <span className="text-xs font-semibold text-emerald-400">
                {dailyDoneCount}/{dailyHabits.length} Today
              </span>
            </div>

            {/* Daily Habits Completion Gauge */}
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 mb-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Daily Must-Dos</span>
                <span className="font-bold text-white font-mono">{dailyRate}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${dailyRate}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {dailyRate === 100
                  ? '🎉 All non-negotiables completed today! Peak identity vote.'
                  : dailyRate > 0
                  ? 'Strong momentum. Finish remaining daily must-dos to keep streaks.'
                  : 'Start with the smallest micro-habit to eliminate startup resistance.'}
              </p>
            </div>

            {/* Weekly Goals Adherence */}
            <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 mb-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Weekly Goal Targets</span>
                <span className="font-bold text-white font-mono">{weeklyRate}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${weeklyRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{totalWeeklyDone} completed</span>
                <span>Goal: {totalWeeklyTarget} total/wk</span>
              </div>
            </div>

            {/* Streak & Focus Card */}
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl space-y-1.5">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-300">
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Daily Momentum Buff</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Consistency compounds. Showing up every day builds unbreakable focus and accelerates level progression.
              </p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-slate-500">
              Rule: Never miss twice. Protect your active streaks.
            </span>
          </div>
        </div>
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Create New Habit Commitment</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateHabit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Habit Name / Commitment *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve 10 calculus problems, Read 20 pages, 30m Run"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Type and Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Behavior Goal
                  </label>
                  <select
                    value={habitType}
                    onChange={(e) => setHabitType(e.target.value as HabitType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="build">[+] Build Good Habit</option>
                    <option value="break">[-] Break / Reduce Bad Habit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HabitCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="must_do_daily">Must-Do Daily (7 days/wk)</option>
                    <option value="weekly_goal">Weekly Goal (Target days/wk)</option>
                  </select>
                </div>
              </div>

              {category === 'weekly_goal' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Days Per Week: {targetPerWeek} days
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={targetPerWeek}
                    onChange={(e) => setTargetPerWeek(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              )}

              {/* Habit Stacking Anchor */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Habit Cue / Trigger Anchor</span>
                  <span className="text-[10px] text-indigo-400">"After [Current], I will [New]"</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. After I finish evening tea, I will open my homework notebook"
                  value={habitStack}
                  onChange={(e) => setHabitStack(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Identity Statement */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Identity Statement
                </label>
                <input
                  type="text"
                  placeholder="e.g. I am someone who masters difficult concepts through steady daily reps"
                  value={identityStatement}
                  onChange={(e) => setIdentityStatement(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Reminder Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Daily Reminder Notification Time (Optional)
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
                >
                  Save Habit Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
