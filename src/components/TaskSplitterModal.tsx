import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, Plus, Trash2, Gift, Zap, ArrowRight, Loader2, X } from 'lucide-react';
import { AISplitResult, TaskCategory, SubTask } from '../types';

interface TaskSplitterModalProps {
  taskData: {
    title: string;
    duration: number;
    category: TaskCategory;
  };
  onClose: () => void;
  onApplySubtasks: (
    title: string,
    duration: number,
    category: TaskCategory,
    subtasks: SubTask[],
    temptationBundle?: string
  ) => void;
}

export const TaskSplitterModal: React.FC<TaskSplitterModalProps> = ({
  taskData,
  onClose,
  onApplySubtasks,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AISplitResult | null>(null);

  const [editableSubtasks, setEditableSubtasks] = useState<
    { title: string; estimatedMinutes: number; tip?: string }[]
  >([]);
  const [temptationBundle, setTemptationBundle] = useState('');
  const [taskTitle, setTaskTitle] = useState(taskData.title);
  const [taskDuration, setTaskDuration] = useState(taskData.duration);

  useEffect(() => {
    let isMounted = true;
    const fetchAISplit = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/ai/split-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskTitle: taskData.title,
            durationMinutes: taskData.duration,
            category: taskData.category,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to analyze task with AI');
        }

        const data: AISplitResult = await res.json();
        if (isMounted) {
          setResult(data);
          setEditableSubtasks(data.subtasks || []);
          setTemptationBundle(data.temptationBundleSuggestion || '');
          if (data.recommendedTotalMinutes) {
            setTaskDuration(data.recommendedTotalMinutes);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Something went wrong while analyzing.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAISplit();
    return () => {
      isMounted = false;
    };
  }, [taskData.title, taskData.duration, taskData.category]);

  const handleSubtaskChange = (index: number, field: string, val: any) => {
    setEditableSubtasks((prev) =>
      prev.map((sub, i) => (i === index ? { ...sub, [field]: val } : sub))
    );
  };

  const handleAddSubtask = () => {
    setEditableSubtasks((prev) => [
      ...prev,
      { title: 'New micro-step', estimatedMinutes: 15, tip: 'Keep it concrete.' },
    ]);
  };

  const handleDeleteSubtask = (index: number) => {
    setEditableSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApply = () => {
    const formattedSubtasks: SubTask[] = editableSubtasks.map((s, idx) => ({
      id: `sub_${Date.now()}_${idx}`,
      title: s.title,
      estimatedMinutes: s.estimatedMinutes,
      isCompleted: false,
      frictionReductionTip: s.tip,
    }));

    onApplySubtasks(
      taskTitle,
      taskDuration,
      taskData.category,
      formattedSubtasks,
      temptationBundle.trim() || undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Task Breakdown & Sizing</h3>
              <p className="text-xs text-slate-500">Break large tasks into manageable micro sub-tasks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-500">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-700">Analyzing task complexity and micro-steps...</p>
            <p className="text-xs text-slate-400">Finding low-friction steps to make starting effortless</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            <p className="font-semibold">Notice:</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Task Verdict Alert */}
            {result && (
              <div
                className={`p-3.5 rounded-2xl border flex items-start space-x-3 ${
                  result.isTooBig
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                {result.isTooBig ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {result.isTooBig
                      ? '⚠️ High Friction: Task is Too Big for One Sitting'
                      : '✓ Well-Sized Task'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {result.frictionAnalysis}
                  </p>
                </div>
              </div>
            )}

            {/* Task Details edit */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Duration (mins)</label>
                <input
                  type="number"
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Recommended Subtasks (Editable) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  Suggested Micro Sub-tasks ({editableSubtasks.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Step
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {editableSubtasks.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 w-4">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={sub.title}
                        onChange={(e) => handleSubtaskChange(idx, 'title', e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800"
                      />
                      <input
                        type="number"
                        value={sub.estimatedMinutes}
                        onChange={(e) =>
                          handleSubtaskChange(idx, 'estimatedMinutes', Number(e.target.value))
                        }
                        className="w-14 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 text-right"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">m</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {sub.tip && (
                      <p className="text-[11px] text-indigo-700 italic pl-6">
                        💡 {sub.tip}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reward Suggestion */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-emerald-600" />
                  Reward Buff (Pair with a treat upon finish)
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Instant Dopamine</span>
              </label>
              <input
                type="text"
                value={temptationBundle}
                onChange={(e) => setTemptationBundle(e.target.value)}
                placeholder="e.g. 20m gaming, cup of hot coffee, short walk with music"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {result?.proTip && (
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800 italic">
                "{result.proTip}"
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Accept & Insert Sub-Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
