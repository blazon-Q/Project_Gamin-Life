import React, { useState } from 'react';
import {
  Plus,
  Sparkles,
  Clock,
  Gift,
  Bell,
  CheckCircle2,
  Circle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { Task, TaskCategory, SubTask } from '../types';

interface ThingsToBeDoneProps {
  tasks: Task[];
  currentDate: string;
  onAddTask: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenTaskSplitter: (taskData: { title: string; duration: number; category: TaskCategory }) => void;
}

export const ThingsToBeDone: React.FC<ThingsToBeDoneProps> = ({
  tasks,
  currentDate,
  onAddTask,
  onToggleTask,
  onToggleSubtask,
  onDeleteTask,
  onOpenTaskSplitter,
}) => {
  // Input fields
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(45);
  const [category, setCategory] = useState<TaskCategory>('needed');
  const [scheduledTime, setScheduledTime] = useState('');
  const [rewardBuff, setRewardBuff] = useState('');
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);

  // Filter & subtask collapse
  const [filter, setFilter] = useState<'all' | 'needed' | 'rewarding' | 'maintenance' | 'completed'>('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const durationOptions = [15, 25, 45, 60, 90];

  const dayTasks = tasks.filter((t) => t.date === currentDate);
  const completedCount = dayTasks.filter((t) => t.isCompleted).length;

  const toggleExpand = (id: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // If task duration is 60m+, automatically open AI task splitter
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

  const handleAiCheckClick = () => {
    if (!title.trim()) return;
    onOpenTaskSplitter({
      title: title.trim(),
      duration,
      category,
    });
    setTitle('');
    setRewardBuff('');
  };

  const filteredTasks = dayTasks.filter((t) => {
    if (filter === 'needed') return t.category === 'needed';
    if (filter === 'rewarding') return t.category === 'rewarding';
    if (filter === 'maintenance') return t.category === 'maintenance';
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-5">
      {/* 1. SINGLE UNIFIED HEADING */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Things to Be Done</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {completedCount}/{dayTasks.length} Done
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Enter your tasks and track execution for today
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({dayTasks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('needed')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              filter === 'needed'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            🔵 Needed ({dayTasks.filter((t) => t.category === 'needed').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('rewarding')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              filter === 'rewarding'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            🟢 Rewards ({dayTasks.filter((t) => t.category === 'rewarding').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('maintenance')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              filter === 'maintenance'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-600'
            }`}
          >
            🟡 Chores ({dayTasks.filter((t) => t.category === 'maintenance').length})
          </button>
        </div>
      </div>

      {/* 2. SIMPLE INTEGRATED ENTRY FIELD */}
      <form onSubmit={handleAddSubmit} className="space-y-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            required
            placeholder="Type a task to do... (e.g. Physics Chapter 3 practice set, Read 20 pages...)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs transition-all"
          />

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleAiCheckClick}
              disabled={!title.trim()}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl border border-purple-200/80 transition-all disabled:opacity-40 cursor-pointer"
              title="Let AI evaluate if this task is too big and suggest micro-subtasks"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Split</span>
            </button>

            <button
              type="submit"
              disabled={!title.trim()}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Quick Options (Duration & Category) */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
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
                className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  duration === m
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setCategory('needed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                category === 'needed'
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🔵 Needed
            </button>

            <button
              type="button"
              onClick={() => setCategory('rewarding')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                category === 'rewarding'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🟢 Reward
            </button>

            <button
              type="button"
              onClick={() => setCategory('maintenance')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                category === 'maintenance'
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              🟡 Chores
            </button>

            <button
              type="button"
              onClick={() => setShowOptionalDetails(!showOptionalDetails)}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="More details"
            >
              {showOptionalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Optional details (reward treat & scheduled time) */}
        {showOptionalDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/60 animate-in fade-in duration-150">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Gift className="w-3 h-3 text-emerald-600" />
                Reward After Completing (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 20m gaming, favorite snack, music break"
                value={rewardBuff}
                onChange={(e) => setRewardBuff(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
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
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </form>

      {/* 3. DISPLAY FIELD (THE LIST OF THINGS TO BE DONE) */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-xs space-y-1">
            <p className="font-semibold text-slate-600 text-sm">No tasks added yet</p>
            <p>Use the simple entry field above to add what needs to be done today.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isExpanded = Boolean(expandedTaskIds[task.id]);
            const subtaskDoneCount = task.subtasks.filter((s) => s.isCompleted).length;
            const hasSubtasks = task.subtasks.length > 0;

            return (
              <div
                key={task.id}
                className={`bg-white border rounded-2xl transition-all shadow-2xs hover:shadow-xs ${
                  task.isCompleted
                    ? 'border-slate-200 bg-slate-50/50 opacity-70'
                    : task.category === 'needed'
                    ? 'border-slate-200/90 hover:border-indigo-300'
                    : task.category === 'rewarding'
                    ? 'border-slate-200/90 hover:border-emerald-300'
                    : 'border-slate-200/90 hover:border-amber-300'
                }`}
              >
                <div className="p-3.5 sm:p-4 flex items-start justify-between gap-3">
                  {/* Left: Checkbox & Task details */}
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => onToggleTask(task.id)}
                      className={`mt-0.5 flex-shrink-0 transition-transform active:scale-90 cursor-pointer ${
                        task.isCompleted
                          ? 'text-emerald-600'
                          : 'text-slate-300 hover:text-indigo-600'
                      }`}
                      title={task.isCompleted ? 'Mark incomplete' : 'Mark complete (+20 XP)'}
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      {/* Meta badges row */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            task.category === 'needed'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70'
                              : task.category === 'rewarding'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/70'
                          }`}
                        >
                          {task.category === 'needed'
                            ? '🔵 Needed'
                            : task.category === 'rewarding'
                            ? '🟢 Reward'
                            : '🟡 Chore'}
                        </span>

                        <span className="text-[10px] font-medium text-slate-500 px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 font-mono">
                          {task.estimatedMinutes}m
                        </span>

                        {task.scheduledTime && (
                          <span className="text-[10px] font-medium text-slate-600 px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 flex items-center gap-1 font-mono">
                            <Bell className="w-2.5 h-2.5 text-indigo-500" />
                            {task.scheduledTime}
                          </span>
                        )}

                        {hasSubtasks && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(task.id)}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>
                              {subtaskDoneCount}/{task.subtasks.length} steps
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className={`text-sm font-semibold transition-all ${
                          task.isCompleted
                            ? 'text-slate-400 line-through decoration-slate-300'
                            : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {/* Reward Buff Pill */}
                      {task.temptationBundle && (
                        <div className="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px]">
                          <Gift className="w-3 h-3 text-emerald-600" />
                          <span>Reward: {task.temptationBundle}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenTaskSplitter({
                          title: task.title,
                          duration: task.estimatedMinutes,
                          category: task.category,
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                      title="AI check or split into micro-steps"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expandable Subtasks Checklist */}
                {hasSubtasks && (isExpanded || !task.isCompleted) && (
                  <div className="px-4 pb-3.5 pt-1 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Sub-steps & Objectives:</span>
                      <span className="font-mono">
                        {Math.round((subtaskDoneCount / task.subtasks.length) * 100)}%
                      </span>
                    </div>

                    <div className="space-y-1.5 pl-1">
                      {task.subtasks.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-start space-x-2.5 text-xs text-slate-700"
                        >
                          <button
                            type="button"
                            onClick={() => onToggleSubtask(task.id, sub.id)}
                            className={`mt-0.5 flex-shrink-0 cursor-pointer ${
                              sub.isCompleted ? 'text-emerald-600' : 'text-slate-400 hover:text-indigo-600'
                            }`}
                          >
                            {sub.isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-100" />
                            ) : (
                              <Circle className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <span className={sub.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}>
                              {sub.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono ml-2">
                              ~{sub.estimatedMinutes}m
                            </span>
                            {sub.frictionReductionTip && !sub.isCompleted && (
                              <p className="text-[11px] text-indigo-600 italic mt-0.5">
                                💡 {sub.frictionReductionTip}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
