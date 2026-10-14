import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, Plus, Trash2, Gift, Zap, ArrowRight, Loader2, X, RotateCw, Wand2 } from 'lucide-react';
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

const CREATIVE_STYLES = [
  { id: 'gamified', label: '🎮 RPG Quest', desc: 'Epic boss fights & tactical skills' },
  { id: 'speedrun', label: '⚡ Speedrun Blitz', desc: 'Ruthless anti-perfectionist speed' },
  { id: 'deep_flow', label: '🧠 Deep Flow', desc: 'Zero-distraction immersion' },
  { id: 'creative', label: '🎨 Wild & Witty', desc: 'Playful metaphors & out-of-the-box' },
  { id: 'gentle', label: '🛋️ Low Drag', desc: 'ADHD-friendly micro on-ramps' },
];

export const TaskSplitterModal: React.FC<TaskSplitterModalProps> = ({
  taskData,
  onClose,
  onApplySubtasks,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AISplitResult | null>(null);
  const [creativeStyle, setCreativeStyle] = useState('gamified');

  const [editableSubtasks, setEditableSubtasks] = useState<
    { title: string; estimatedMinutes: number; tip?: string }[]
  >([]);
  const [temptationBundle, setTemptationBundle] = useState('');
  const [taskTitle, setTaskTitle] = useState(taskData.title);
  const [taskDuration, setTaskDuration] = useState(taskData.duration);

  const fetchAISplit = useCallback(async (styleToUse = creativeStyle) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/split-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: taskTitle || taskData.title,
          durationMinutes: taskDuration || taskData.duration,
          category: taskData.category,
          creativeStyle: styleToUse,
          seed: Date.now() + Math.random(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to analyze task with AI');
      }

      const data: AISplitResult = await res.json();
      setResult(data);
      setEditableSubtasks(
        (data.subtasks || []).map((s) => ({
          title: s.title,
          estimatedMinutes: s.estimatedMinutes,
          tip: s.frictionReductionTip,
        }))
      );
      setTemptationBundle(data.temptationBundleSuggestion || '');
      if (data.recommendedTotalMinutes) {
        setTaskDuration(data.recommendedTotalMinutes);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong while analyzing.');
    } finally {
      setLoading(false);
    }
  }, [taskTitle, taskDuration, taskData.title, taskData.duration, taskData.category, creativeStyle]);

  useEffect(() => {
    fetchAISplit(creativeStyle);
  }, []); // Run on initial mount

  const handleStyleChange = (newStyle: string) => {
    setCreativeStyle(newStyle);
    fetchAISplit(newStyle);
  };

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
            <div className="w-8 h-8 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-slate-900">Creative AI Quest Splitter</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Smart Breakdown
                </span>
              </div>
              <p className="text-xs text-slate-500">Break any task into creative, low-friction micro-sprints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Creative Style Switcher */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <Wand2 className="w-3 h-3 text-indigo-500" /> AI Creative Vibe / Lens:
            </span>
            <button
              type="button"
              onClick={() => fetchAISplit(creativeStyle)}
              disabled={loading}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              title="Generate a completely new creative interpretation"
            >
              <RotateCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Reroll AI Thinking</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CREATIVE_STYLES.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleStyleChange(st.id)}
                disabled={loading}
                className={`text-xs px-2.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer border ${
                  creativeStyle === st.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-700">Deconstructing quest & crafting creative steps...</p>
            <p className="text-xs text-slate-400">Analyzing psychological friction and engineering dopamine rewards</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            <p className="font-semibold">Notice:</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Themed Quest Title Banner */}
            {result?.creativeTheme && (
              <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-200/80 rounded-2xl p-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs flex-shrink-0 mt-0.5">
                    ✨
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      Thematic Quest Angle
                    </div>
                    <div className="text-sm font-bold text-slate-800 leading-snug">
                      {result.creativeTheme}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Task Verdict Alert */}
            {result && (
              <div
                className={`p-3 rounded-2xl border flex items-start space-x-3 ${
                  result.isTooBig
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                {result.isTooBig ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="text-xs">
                  <span className="font-bold uppercase tracking-wider block">
                    {result.isTooBig ? 'High Initiation Friction' : 'Optimal Quest Scope'}
                  </span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    {result.frictionAnalysis}
                  </p>
                </div>
              </div>
            )}

            {/* Task Details edit */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-600 font-semibold mb-1">Quest Title</label>
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
                  Bespoke Micro-Sprints ({editableSubtasks.length})
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
                      <span className="text-[10px] font-mono font-bold text-indigo-600 w-5">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={sub.title}
                        onChange={(e) => handleSubtaskChange(idx, 'title', e.target.value)}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium"
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
                      <p className="text-[11px] text-indigo-700 italic pl-7 leading-relaxed">
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
                  Reward Buff (Pair with an immediate treat upon finish)
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Dopamine Anchor</span>
              </label>
              <input
                type="text"
                value={temptationBundle}
                onChange={(e) => setTemptationBundle(e.target.value)}
                placeholder="e.g. 15m favorite game, specialty cold brew, high-vibe music walk"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {result?.proTip && (
              <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 leading-relaxed">
                <span className="font-bold text-indigo-700 mr-1">Pro Tip:</span>
                "{result.proTip}"
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => fetchAISplit(creativeStyle)}
                disabled={loading}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try Another Angle</span>
              </button>

              <div className="flex items-center space-x-2">
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
          </div>
        )}
      </div>
    </div>
  );
};
