import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  Gift,
  Clock,
  Trash2,
  Bell,
  ChevronDown,
  ChevronUp,
  Filter,
  Check
} from 'lucide-react';
import { Task, TaskCategory } from '../types';

interface DailyTaskListProps {
  tasks: Task[];
  currentDate: string;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenTaskSplitter: (taskData: { title: string; duration: number; category: TaskCategory }) => void;
}

export const DailyTaskList: React.FC<DailyTaskListProps> = ({
  tasks,
  currentDate,
  onToggleTask,
  onToggleSubtask,
  onDeleteTask,
  onOpenTaskSplitter,
}) => {
  const [filter, setFilter] = useState<'all' | 'needed' | 'rewarding' | 'maintenance' | 'completed'>('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const dayTasks = tasks.filter((t) => t.date === currentDate);

  const toggleExpand = (id: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTasks = dayTasks.filter((t) => {
    if (filter === 'needed') return t.category === 'needed';
    if (filter === 'rewarding') return t.category === 'rewarding';
    if (filter === 'maintenance') return t.category === 'maintenance';
    if (filter === 'completed') return t.isCompleted;
    return true;
  });

  const completedCount = dayTasks.filter((t) => t.isCompleted).length;

  return (
    <div className="space-y-4">
      {/* List Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Today's Things to Be Done</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {completedCount}/{dayTasks.length} Done
            </span>
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs text-xs overflow-x-auto">
          <button
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

      {/* Task Cards List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-500 shadow-2xs space-y-1.5">
            <p className="text-sm font-semibold text-slate-700">No tasks in this view</p>
            <p className="text-xs text-slate-400">
              Type in the box above to add things to do today.
            </p>
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
