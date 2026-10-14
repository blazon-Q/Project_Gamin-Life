import React, { useState } from 'react';
import { Plus, Sparkles, Clock, Gift, Bell, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Task, TaskCategory } from '../types';

interface QuickTaskEntryProps {
  currentDate: string;
  onAddTask: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
  onOpenTaskSplitter: (taskData: { title: string; duration: number; category: TaskCategory }) => void;
}

export const QuickTaskEntry: React.FC<QuickTaskEntryProps> = ({
  currentDate,
  onAddTask,
  onOpenTaskSplitter,
}) => {
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(45);
  const [category, setCategory] = useState<TaskCategory>('needed');
  const [scheduledTime, setScheduledTime] = useState('');
  const [rewardBuff, setRewardBuff] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const durationOptions = [15, 25, 45, 60, 90];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // If duration is 45m or longer, suggest AI check or add directly
    if (duration >= 60) {
      onOpenTaskSplitter({
        title: title.trim(),
        duration,
        category,
      });
      setTitle('');
      setRewardBuff('');
      return;
    }

    onAddTask({
      title: title.trim(),
      category,
      estimatedMinutes: duration,
      date: currentDate,
      scheduledTime: scheduledTime.trim() || undefined,
      temptationBundle: rewardBuff.trim() || undefined,
      subtasks: [],
    });

    setTitle('');
    setRewardBuff('');
  };

  const handleAiCheck = () => {
    if (!title.trim()) return;
    onOpenTaskSplitter({
      title: title.trim(),
      duration,
      category,
    });
    setTitle('');
    setRewardBuff('');
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
      <form onSubmit={handleQuickSubmit} className="space-y-3">
        {/* Main Input Row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            placeholder="What do you need to do today? (e.g. Physics Chapter 3 practice set, Read 20 pages...)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleAiCheck}
              disabled={!title.trim()}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl border border-purple-200/80 transition-all disabled:opacity-40 cursor-pointer"
              title="Let AI evaluate if this task is too big and suggest micro-subtasks"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Check & Split</span>
            </button>

            <button
              type="submit"
              disabled={!title.trim()}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Quick Duration Chips & Category Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
          {/* Duration Chips */}
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-medium text-[11px] mr-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Duration:
            </span>
            {durationOptions.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDuration(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  duration === m
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>

          {/* Category Selector */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setCategory('needed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                category === 'needed'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🔵 Needed Priority
            </button>

            <button
              type="button"
              onClick={() => setCategory('rewarding')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                category === 'rewarding'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🟢 Reward / Rest
            </button>

            <button
              type="button"
              onClick={() => setCategory('maintenance')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                category === 'maintenance'
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🟡 Chores / Errands
            </button>

            <button
              type="button"
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              title="More options (Reward buffer, target time)"
            >
              {showMoreOptions ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Details (Reward Pairing & Scheduled Time) */}
        {showMoreOptions && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Gift className="w-3 h-3 text-emerald-600" />
                Reward After Completing (Temptation Pairing)
              </label>
              <input
                type="text"
                placeholder="e.g. 20m gaming, favorite snack, 15m walk"
                value={rewardBuff}
                onChange={(e) => setRewardBuff(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Bell className="w-3 h-3 text-indigo-600" />
                Target Time / Reminder (Optional)
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
