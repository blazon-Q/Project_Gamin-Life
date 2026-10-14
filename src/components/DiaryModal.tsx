import React, { useState } from 'react';
import { BookOpen, Sparkles, Star, Calendar, CheckCircle2, Trophy, ArrowRight, Loader2, History, X } from 'lucide-react';
import { DailyDiaryEntry, Task, Habit, AIReflectionResult } from '../types';

interface DiaryModalProps {
  currentDate: string;
  tasks: Task[];
  habits: Habit[];
  diaryEntries: Record<string, DailyDiaryEntry>;
  onClose: () => void;
  onSaveEntry: (entry: DailyDiaryEntry) => void;
}

export const DiaryModal: React.FC<DiaryModalProps> = ({
  currentDate,
  tasks,
  habits,
  diaryEntries,
  onClose,
  onSaveEntry,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

  const existingEntry = diaryEntries[currentDate];

  const [wins, setWins] = useState(existingEntry?.wins || '');
  const [onePercentBetter, setOnePercentBetter] = useState(existingEntry?.onePercentBetter || '');
  const [frictionEncountered, setFrictionEncountered] = useState(existingEntry?.frictionEncountered || '');
  const [rewardEnjoyed, setRewardEnjoyed] = useState(existingEntry?.rewardEnjoyed || '');
  const [energyRating, setEnergyRating] = useState(existingEntry?.energyRating || 4);
  const [aiCoachInsight, setAiCoachInsight] = useState(existingEntry?.aiCoachInsight || '');
  const [identityAffirmation, setIdentityAffirmation] = useState(existingEntry?.identityAffirmation || '');

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const dayTasks = tasks.filter((t) => t.date === currentDate);
  const completedTasks = dayTasks.filter((t) => t.isCompleted).length;
  const habitsDone = habits.filter((h) => Boolean(h.completions[currentDate])).length;

  const handleAskAICoach = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wins,
          onePercentBetter,
          frictionEncountered,
          completedCount: completedTasks,
          totalCount: dayTasks.length,
          habitsCompleted: habitsDone,
        }),
      });

      if (!res.ok) throw new Error('Failed to get AI insight');
      const data: AIReflectionResult = await res.json();
      setAiCoachInsight(data.coachDebrief);
      if (data.mindsetNote) setIdentityAffirmation(data.mindsetNote);
      if (!onePercentBetter && data.microUpgrade) {
        setOnePercentBetter(data.microUpgrade);
      }
    } catch (e) {
      console.error(e);
      setAiCoachInsight(
        'Solid daily execution. Showing up consistently builds unbeatable momentum. Focus on lowering startup friction tomorrow.'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSave = () => {
    const entry: DailyDiaryEntry = {
      date: currentDate,
      wins: wins.trim(),
      onePercentBetter: onePercentBetter.trim(),
      frictionEncountered: frictionEncountered.trim(),
      rewardEnjoyed: rewardEnjoyed.trim(),
      energyRating,
      aiCoachInsight: aiCoachInsight || undefined,
      identityAffirmation: identityAffirmation || undefined,
      tasksCompletedCount: completedTasks,
      tasksTotalCount: dayTasks.length,
      habitsCompletedCount: habitsDone,
      habitsTotalCount: habits.length,
      updatedAt: new Date().toISOString(),
    };

    onSaveEntry(entry);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const pastEntriesList = Object.values(diaryEntries).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Victory Log & Evening Reflection</h3>
              <p className="text-xs text-slate-500">Record your wins, micro-upgrades, and reflections</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('today')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Today ({currentDate})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <History className="w-3 h-3" />
                <span>Archive ({pastEntriesList.length})</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-lg p-1 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'today' ? (
          <div className="space-y-4">
            {/* Daily Execution Snapshot */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-semibold">Tasks Done</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {completedTasks}/{dayTasks.length}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-semibold">Habits Completed</span>
                <span className="text-sm font-bold text-emerald-600 font-mono">
                  {habitsDone}/{habits.length}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-semibold">Day Rating</span>
                <div className="flex items-center justify-center space-x-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEnergyRating(star)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          star <= energyRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reflection Prompts */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    1. Wins of the Day (Completed Goals & Victories)
                  </span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Solved 15 math problems; finished history reading; stayed off social media during study."
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-indigo-700">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    2. Micro-Upgrade for Tomorrow
                  </span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Set up my notebook and pen tonight so starting tomorrow morning is friction-free."
                  value={onePercentBetter}
                  onChange={(e) => setOnePercentBetter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  3. Friction & Distraction Triggers Faced
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hesitated to start chemistry problem set because it looked long; solved by doing 2-minute starter."
                  value={frictionEncountered}
                  onChange={(e) => setFrictionEncountered(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-emerald-700">
                  4. Guilt-Free Rewards & Recovery Enjoyed
                </label>
                <input
                  type="text"
                  placeholder="e.g. 30m gaming after homework, evening music session, or sweet snack."
                  value={rewardEnjoyed}
                  onChange={(e) => setRewardEnjoyed(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* AI Debrief */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-800">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>AI Performance Debrief</span>
                </div>
                <button
                  type="button"
                  onClick={handleAskAICoach}
                  disabled={isAiLoading}
                  className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <span>Ask Coach Feedback</span>
                  )}
                </button>
              </div>

              {aiCoachInsight ? (
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{aiCoachInsight}"
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Click "Ask Coach Feedback" to get an instant debrief and adjustments for tomorrow.
                </p>
              )}

              {identityAffirmation && (
                <p className="text-[11px] text-indigo-800 font-semibold">
                  Mindset: "{identityAffirmation}"
                </p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={`px-5 py-2 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  saveSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <span>Save Daily Log</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Archive / History Tab */
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {pastEntriesList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No past logs recorded yet. Complete today's reflection to build your archive.
              </div>
            ) : (
              pastEntriesList.map((entry) => (
                <div
                  key={entry.date}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="font-bold text-slate-800 text-sm font-mono flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {entry.date}
                    </span>
                    <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
                      <span>
                        Tasks: {entry.tasksCompletedCount}/{entry.tasksTotalCount}
                      </span>
                      <span>•</span>
                      <span>
                        Habits: {entry.habitsCompletedCount}/{entry.habitsTotalCount}
                      </span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: entry.energyRating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {entry.wins && (
                    <div>
                      <span className="font-semibold text-amber-700">Wins:</span>{' '}
                      <span className="text-slate-700">{entry.wins}</span>
                    </div>
                  )}

                  {entry.onePercentBetter && (
                    <div>
                      <span className="font-semibold text-indigo-700">Micro-Upgrade:</span>{' '}
                      <span className="text-slate-700">{entry.onePercentBetter}</span>
                    </div>
                  )}

                  {entry.aiCoachInsight && (
                    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-800 italic text-[11px]">
                      Coach: "{entry.aiCoachInsight}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
