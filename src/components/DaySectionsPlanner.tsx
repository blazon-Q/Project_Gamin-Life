import React, { useState } from 'react';
import {
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Sparkles,
  Gift,
  ChevronDown,
  ChevronUp,
  Trash2,
  Bell,
  AlertCircle,
  HelpCircle,
  Sunrise,
  School,
  BookOpen,
  Moon,
  Dumbbell,
  Briefcase,
  Flame,
  Zap,
  Cpu,
  Smile,
  Settings2
} from 'lucide-react';
import { DaySection, Task, TaskCategory, SubTask } from '../types';

interface DaySectionsPlannerProps {
  sections: DaySection[];
  tasks: Task[];
  currentDate: string;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'isCompleted'>) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenTaskSplitter: (taskData: { title: string; duration: number; sectionId: string; category: TaskCategory }) => void;
  onOpenSectionsConfig: () => void;
}

// Icon helper for section icons
const getSectionIcon = (iconName?: string) => {
  switch (iconName) {
    case 'sunrise':
      return <Sunrise className="w-4 h-4 text-amber-400" />;
    case 'school':
      return <School className="w-4 h-4 text-indigo-400" />;
    case 'book-open':
      return <BookOpen className="w-4 h-4 text-sky-400" />;
    case 'moon':
      return <Moon className="w-4 h-4 text-emerald-400" />;
    case 'dumbbell':
      return <Dumbbell className="w-4 h-4 text-rose-400" />;
    case 'briefcase':
      return <Briefcase className="w-4 h-4 text-blue-400" />;
    case 'flame':
      return <Flame className="w-4 h-4 text-orange-400" />;
    case 'zap':
      return <Zap className="w-4 h-4 text-yellow-400" />;
    case 'cpu':
      return <Cpu className="w-4 h-4 text-cyan-400" />;
    default:
      return <Clock className="w-4 h-4 text-indigo-400" />;
  }
};

export const DaySectionsPlanner: React.FC<DaySectionsPlannerProps> = ({
  sections,
  tasks,
  currentDate,
  onToggleTask,
  onToggleSubtask,
  onAddTask,
  onDeleteTask,
  onOpenTaskSplitter,
  onOpenSectionsConfig,
}) => {
  // Active add task section accordion
  const [activeAddingSectionId, setActiveAddingSectionId] = useState<string | null>(null);

  // New task form fields
  const [taskTitle, setTaskTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [category, setCategory] = useState<TaskCategory>('needed');
  const [scheduledTime, setScheduledTime] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(5);
  const [temptationBundle, setTemptationBundle] = useState('');

  // Expanded subtask state for task cards
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (taskId: string) => {
    setExpandedTaskIds((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleOpenAddForm = (sectionId: string, defaultTime?: string) => {
    setActiveAddingSectionId(sectionId);
    setTaskTitle('');
    setDurationMinutes(45);
    setCategory('needed');
    setScheduledTime(defaultTime || '');
    setTemptationBundle('');
  };

  const handleQuickAdd = (sectionId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    // Check if task is big (>45m) and suggest splitting automatically
    if (durationMinutes >= 45) {
      // Trigger AI task splitter modal for user approval
      onOpenTaskSplitter({
        title: taskTitle.trim(),
        duration: durationMinutes,
        sectionId,
        category,
      });
      setActiveAddingSectionId(null);
      return;
    }

    onAddTask({
      sectionId,
      title: taskTitle.trim(),
      category,
      estimatedMinutes: durationMinutes,
      date: currentDate,
      scheduledTime: scheduledTime.trim() || undefined,
      reminderMinutesBefore: reminderMinutes,
      temptationBundle: temptationBundle.trim() || undefined,
      subtasks: [],
    });

    setActiveAddingSectionId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>Customized Day Sections & Action List</span>
            <span className="text-xs font-normal text-slate-400">
              ({sections.length} sections configured)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Tailored to your lifestyle (e.g. Home mornings & evenings, daytime college/work). AI checks task sizes.
          </p>
        </div>

        <button
          onClick={onOpenSectionsConfig}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
        >
          <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Customize Schedule Blocks</span>
        </button>
      </div>

      {/* Sections List */}
      <div className="space-y-5">
        {sections.map((section) => {
          const sectionTasks = tasks.filter(
            (t) => t.sectionId === section.id && t.date === currentDate
          );
          const completedCount = sectionTasks.filter((t) => t.isCompleted).length;
          const totalMinutes = sectionTasks.reduce(
            (acc, t) => acc + (t.estimatedMinutes || 0),
            0
          );

          const isAdding = activeAddingSectionId === section.id;

          return (
            <div
              key={section.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all"
            >
              {/* Section Header */}
              <div className="bg-slate-950/70 px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center">
                    {getSectionIcon(section.icon)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {section.title}
                      </h3>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        {section.startTime} - {section.endTime}
                      </span>
                    </div>
                    {section.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {section.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Section Stats & Add Task Button */}
                <div className="flex items-center space-x-3">
                  <div className="text-right text-xs">
                    <span className="font-semibold text-slate-300">
                      {completedCount}/{sectionTasks.length} Done
                    </span>
                    <span className="text-slate-500 font-mono ml-2">
                      ({totalMinutes} mins)
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      isAdding
                        ? setActiveAddingSectionId(null)
                        : handleOpenAddForm(section.id, section.startTime)
                    }
                    className="flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAdding ? 'Cancel' : 'Add Task'}</span>
                  </button>
                </div>
              </div>

              {/* Add Task Form (Inline) */}
              {isAdding && (
                <div className="p-4 bg-slate-950/90 border-b border-slate-800">
                  <form onSubmit={(e) => handleQuickAdd(section.id, e)} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        required
                        placeholder="What do you plan to do in this block? (e.g. Physics Problem Set 1-20)"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        autoFocus
                      />

                      <button
                        type="button"
                        onClick={() => {
                          if (!taskTitle.trim()) return;
                          onOpenTaskSplitter({
                            title: taskTitle.trim(),
                            duration: durationMinutes,
                            sectionId: section.id,
                            category,
                          });
                          setActiveAddingSectionId(null);
                        }}
                        disabled={!taskTitle.trim()}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
                        title="Let AI evaluate if this task is too big and suggest micro-subtasks"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>AI Check & Split</span>
                      </button>
                    </div>

                    {/* Metadata Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {/* Duration */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Duration (Mins)
                        </label>
                        <select
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value={15}>15 mins (Micro Sprint)</option>
                          <option value={25}>25 mins (Pomodoro)</option>
                          <option value={45}>45 mins (Deep Block)</option>
                          <option value={60}>60 mins (1 Hour)</option>
                          <option value={90}>90 mins (Ultra Sprint)</option>
                          <option value={120}>120 mins (2 Hours)</option>
                        </select>
                      </div>

                      {/* Category Triad */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Category Triad
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as TaskCategory)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="needed">🔵 Needed Stuff (Deep Priority)</option>
                          <option value="rewarding">🟢 Rewarding Stuff (Dopamine/Rest)</option>
                          <option value="maintenance">🟡 Maintenance (Chores/Admin)</option>
                        </select>
                      </div>

                      {/* Scheduled Time */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Target Time (Optional)
                        </label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Temptation Bundle / Reward Pairing */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Gift className="w-3 h-3 text-emerald-400" />
                          Reward Buff (Temptation Pairing)
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Reward yourself immediately after finishing
                        </span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 20m guilt-free YouTube/gaming, favorite smoothie, 15m walk with music"
                        value={temptationBundle}
                        onChange={(e) => setTemptationBundle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        Tasks over 45m will trigger intelligent AI micro-step breakdowns.
                      </span>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setActiveAddingSectionId(null)}
                          className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          Save Task
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Tasks List */}
              <div className="p-4 space-y-2.5">
                {sectionTasks.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No commitments in {section.title} yet. Click "+ Add Task" to schedule this block.
                  </div>
                ) : (
                  sectionTasks.map((task) => {
                    const isExpanded = Boolean(expandedTaskIds[task.id]);
                    const subtaskDoneCount = task.subtasks.filter((s) => s.isCompleted).length;
                    const hasSubtasks = task.subtasks.length > 0;

                    return (
                      <div
                        key={task.id}
                        className={`group relative rounded-xl border transition-all ${
                          task.isCompleted
                            ? 'bg-slate-950/40 border-slate-800 opacity-70'
                            : task.category === 'needed'
                            ? 'bg-slate-950/80 border-indigo-900/40 hover:border-indigo-800/60'
                            : task.category === 'rewarding'
                            ? 'bg-slate-950/80 border-emerald-900/40 hover:border-emerald-800/60'
                            : 'bg-slate-950/80 border-amber-900/40 hover:border-amber-800/60'
                        }`}
                      >
                        <div className="p-3.5 flex items-start justify-between gap-3">
                          {/* Left: Checkbox & Info */}
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <button
                              onClick={() => onToggleTask(task.id)}
                              className={`mt-0.5 flex-shrink-0 transition-transform active:scale-90 cursor-pointer ${
                                task.isCompleted
                                  ? 'text-emerald-400 hover:text-emerald-300'
                                  : 'text-slate-500 hover:text-indigo-400'
                              }`}
                              title={
                                task.isCompleted
                                  ? 'Mark as incomplete'
                                  : 'Mark task complete (+15 XP)'
                              }
                            >
                              {task.isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                {/* Category Badge */}
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    task.category === 'needed'
                                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                                      : task.category === 'rewarding'
                                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                  }`}
                                >
                                  {task.category === 'needed'
                                    ? '🔵 Needed'
                                    : task.category === 'rewarding'
                                    ? '🟢 Rewarding'
                                    : '🟡 Maintenance'}
                                </span>

                                {/* Duration Badge */}
                                <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                                  ⏱ {task.estimatedMinutes}m
                                </span>

                                {/* Scheduled Time */}
                                {task.scheduledTime && (
                                  <span className="text-[10px] font-mono text-slate-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 flex items-center gap-1">
                                    <Bell className="w-2.5 h-2.5 text-indigo-400" />
                                    {task.scheduledTime}
                                  </span>
                                )}

                                {/* Subtasks Count */}
                                {hasSubtasks && (
                                  <button
                                    onClick={() => toggleExpand(task.id)}
                                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>
                                      {subtaskDoneCount}/{task.subtasks.length} subtasks
                                    </span>
                                    {isExpanded ? (
                                      <ChevronUp className="w-3 h-3" />
                                    ) : (
                                      <ChevronDown className="w-3 h-3" />
                                    )}
                                  </button>
                                )}
                              </div>

                              <h4
                                className={`text-sm font-semibold transition-all ${
                                  task.isCompleted
                                    ? 'text-slate-400 line-through decoration-slate-600'
                                    : 'text-white'
                                }`}
                              >
                                {task.title}
                              </h4>

                              {/* Temptation Bundle Pill */}
                              {task.temptationBundle && (
                                <div className="mt-1.5 inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                                  <Gift className="w-3 h-3 text-emerald-400" />
                                  <span>Reward: {task.temptationBundle}</span>
                                </div>
                              )}

                              {task.notes && (
                                <p className="text-xs text-slate-400 mt-1">{task.notes}</p>
                              )}
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            {/* AI Split button if no subtasks or want refinement */}
                            <button
                              onClick={() =>
                                onOpenTaskSplitter({
                                  title: task.title,
                                  duration: task.estimatedMinutes,
                                  sectionId: section.id,
                                  category: task.category,
                                })
                              }
                              className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Ask AI to split into smaller manageable micro-tasks"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            </button>

                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Subtasks Accordion */}
                        {hasSubtasks && (isExpanded || !task.isCompleted) && (
                          <div className="px-4 pb-3 pt-1 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span className="font-semibold text-slate-300">
                                Quest Micro-Steps:
                              </span>
                              <span className="font-mono">
                                {Math.round((subtaskDoneCount / task.subtasks.length) * 100)}%
                              </span>
                            </div>

                            {/* Subtasks items */}
                            <div className="space-y-1.5 pl-2">
                              {task.subtasks.map((sub) => (
                                <div
                                  key={sub.id}
                                  className="flex items-start space-x-2.5 text-xs text-slate-300 group/sub"
                                >
                                  <button
                                    onClick={() => onToggleSubtask(task.id, sub.id)}
                                    className={`mt-0.5 flex-shrink-0 cursor-pointer ${
                                      sub.isCompleted
                                        ? 'text-emerald-400'
                                        : 'text-slate-500 hover:text-indigo-400'
                                    }`}
                                  >
                                    {sub.isCompleted ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-500/20" />
                                    ) : (
                                      <Circle className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  <div className="flex-1 min-w-0">
                                    <span
                                      className={`${
                                        sub.isCompleted
                                          ? 'line-through text-slate-500'
                                          : 'text-slate-200'
                                      }`}
                                    >
                                      {sub.title}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono ml-2">
                                      ~{sub.estimatedMinutes}m
                                    </span>

                                    {sub.frictionReductionTip && !sub.isCompleted && (
                                      <p className="text-[10px] text-indigo-400/80 italic mt-0.5">
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
        })}
      </div>
    </div>
  );
};
