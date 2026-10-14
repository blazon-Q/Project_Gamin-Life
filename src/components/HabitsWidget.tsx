import React, { useState } from 'react';
import {
  Target,
  Maximize2,
  CheckCircle2,
  Circle,
  Flame,
  Plus,
  Trash2,
  Sparkles,
  X,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';
import { Habit, HabitCategory, HabitType } from '../types';

interface HabitsWidgetProps {
  habits: Habit[];
  currentDate: string;
  onToggleHabit: (habitId: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id' | 'currentStreak' | 'bestStreak' | 'completions'>) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitsWidget: React.FC<HabitsWidgetProps> = ({
  habits,
  currentDate,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New habit form state
  const [title, setTitle] = useState('');
  const [habitType, setHabitType] = useState<HabitType>('build');
  const [category, setCategory] = useState<HabitCategory>('must_do_daily');
  const [targetPerWeek, setTargetPerWeek] = useState(7);
  const [cueAnchor, setCueAnchor] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  // Weekly dates helper (Monday to Sunday)
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
        isCurrent: iso === currentDate,
      });
    }
    return week;
  };

  const weekDays = getWeekDates(currentDate);
  const currentWeekDaysIso = weekDays.map((w) => w.iso);

  // Daily non-negotiables stats
  const dailyHabits = habits.filter((h) => h.category === 'must_do_daily');
  const dailyDoneCount = dailyHabits.filter((h) => Boolean(h.completions[currentDate])).length;
  const dailyRate = dailyHabits.length > 0 ? Math.round((dailyDoneCount / dailyHabits.length) * 100) : 0;

  // Max streak
  const topStreak = Math.max(0, ...habits.map((h) => h.currentStreak));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddHabit({
      title: title.trim(),
      type: habitType,
      category,
      targetPerWeek: category === 'must_do_daily' ? 7 : targetPerWeek,
      habitStack: cueAnchor.trim() || undefined,
      reminderTime: reminderTime.trim() || undefined,
    });

    setTitle('');
    setCueAnchor('');
    setReminderTime('');
    setShowAddForm(false);
  };

  return (
    <>
      {/* 1. COMPACT BOX (TOP RIGHT) */}
      <div
        onClick={() => setIsExpanded(true)}
        className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-indigo-300 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <span>Non-Negotiables & Habits</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {topStreak > 0 && (
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                {topStreak}d
              </span>
            )}
            <span className="p-1 text-slate-400 group-hover:text-indigo-600 transition-colors">
              <Maximize2 className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Progress bar & count */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Today's Execution</span>
            <span className="font-bold text-slate-700 font-mono">
              {dailyDoneCount}/{dailyHabits.length} done ({dailyRate}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${dailyRate}%` }}
            />
          </div>
        </div>

        {/* Quick Preview List (top 3 habits) */}
        <div className="space-y-1.5">
          {dailyHabits.slice(0, 3).map((h) => {
            const isDone = Boolean(h.completions[currentDate]);
            return (
              <div
                key={h.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHabit(h.id);
                }}
                className={`flex items-center space-x-2 text-xs py-1 px-2 rounded-lg transition-colors ${
                  isDone ? 'bg-emerald-50/60 text-emerald-800' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <button
                  type="button"
                  className={`flex-shrink-0 transition-transform active:scale-90 ${
                    isDone ? 'text-emerald-600' : 'text-slate-400 hover:text-indigo-600'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 fill-emerald-100" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>
                <span className={`truncate flex-1 font-medium ${isDone ? 'line-through text-slate-400' : ''}`}>
                  {h.title}
                </span>
                {h.currentStreak > 0 && (
                  <span className="text-[10px] font-mono text-amber-600 font-semibold">
                    {h.currentStreak}d
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Expand prompt footer */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors">
          <span>{habits.length > 3 ? `+${habits.length - 3} more commitments` : 'Click to maximize'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 2. MAXIMIZED MODAL VIEW (FULL HABITS DASHBOARD) */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Non-Negotiables & Habits Manager
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track your daily commitments, weekly goals, and consistency streaks
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Habit</span>
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-slate-400 hover:text-slate-700 text-lg p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Daily Execution Snapshot */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                <span className="text-[11px] font-semibold text-slate-500 block">Today's Must-Dos</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {dailyDoneCount} / {dailyHabits.length}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                <span className="text-[11px] font-semibold text-slate-500 block">Completion Rate</span>
                <span className="text-lg font-bold text-indigo-600 font-mono">
                  {dailyRate}%
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                <span className="text-[11px] font-semibold text-slate-500 block">Top Streak</span>
                <span className="text-lg font-bold text-amber-600 font-mono flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {topStreak} Days
                </span>
              </div>
            </div>

            {/* Add Habit Form */}
            {showAddForm && (
              <form
                onSubmit={handleCreate}
                className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">Create New Habit Commitment</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-slate-400 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>

                <input
                  type="text"
                  required
                  placeholder="Habit title (e.g. 20m Morning Revision, 2L Water, 30m Workout)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Type
                    </label>
                    <select
                      value={habitType}
                      onChange={(e) => setHabitType(e.target.value as HabitType)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="build">[+] Build Good Habit</option>
                      <option value="break">[-] Limit / Break Habit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Frequency
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as HabitCategory)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="must_do_daily">Must-Do Daily (7/7)</option>
                      <option value="weekly_goal">Weekly Target (X days/wk)</option>
                    </select>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Trigger anchor: 'After [Current Action], I will [New Habit]'"
                  value={cueAnchor}
                  onChange={(e) => setCueAnchor(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400"
                />

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Save Commitment
                  </button>
                </div>
              </form>
            )}

            {/* Habits List in Maximized View */}
            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {habits.map((h) => {
                const isDone = Boolean(h.completions[currentDate]);
                const completedThisWeek = currentWeekDaysIso.filter((iso) => Boolean(h.completions[iso])).length;

                return (
                  <div
                    key={h.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => onToggleHabit(h.id)}
                          className={`mt-0.5 flex-shrink-0 cursor-pointer ${
                            isDone ? 'text-emerald-600' : 'text-slate-400 hover:text-indigo-600'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                h.type === 'build'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {h.type === 'build' ? '+ Build' : '- Limit'}
                            </span>

                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {h.category === 'must_do_daily' ? 'Daily' : `${h.targetPerWeek}x/wk`}
                            </span>

                            {h.currentStreak > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                                {h.currentStreak}d streak
                              </span>
                            )}
                          </div>

                          <h4 className={`text-sm font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {h.title}
                          </h4>

                          {h.habitStack && (
                            <p className="text-xs text-slate-500 italic mt-0.5">
                              Anchor: {h.habitStack}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Week Matrix & Delete */}
                      <div className="flex flex-col items-end space-y-1.5 flex-shrink-0">
                        <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                          {weekDays.map((day) => {
                            const isDayDone = Boolean(h.completions[day.iso]);
                            return (
                              <div key={day.iso} className="flex flex-col items-center">
                                <span className="text-[9px] text-slate-400 font-mono mb-0.5">
                                  {day.label}
                                </span>
                                <div
                                  className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[8px] font-bold ${
                                    isDayDone
                                      ? 'bg-emerald-500 text-white'
                                      : day.isCurrent
                                      ? 'border border-indigo-400 bg-indigo-50'
                                      : 'bg-slate-200'
                                  }`}
                                >
                                  {isDayDone && '✓'}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                          <span>
                            {completedThisWeek}/{h.targetPerWeek} this week
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeleteHabit(h.id)}
                            className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                            title="Delete habit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
