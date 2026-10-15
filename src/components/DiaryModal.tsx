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
  onDeleteEntry?: (entryId: string) => void;
}

export const DiaryModal: React.FC<DiaryModalProps> = ({
  currentDate,
  tasks,
  habits,
  diaryEntries,
  onClose,
  onSaveEntry,
  onDeleteEntry,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

  // Logs for currentDate (can be multiple on the same day!)
  const allEntriesList = Object.values(diaryEntries);
  const todayLogs = allEntriesList
    .filter((e) => e.date === currentDate)
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

  // Track which log is currently active or 'new'
  const [selectedLogId, setSelectedLogId] = useState<string>('new');

  const [wins, setWins] = useState('');
  const [onePercentBetter, setOnePercentBetter] = useState('');
  const [frictionEncountered, setFrictionEncountered] = useState('');
  const [rewardEnjoyed, setRewardEnjoyed] = useState('');
  const [amides, setAmides] = useState('');
  const [energyRating, setEnergyRating] = useState(4);
  const [aiCoachInsight, setAiCoachInsight] = useState('');
  const [identityAffirmation, setIdentityAffirmation] = useState('');

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Switch between existing log or brand new log
  const handleSelectLog = (logId: string) => {
    setSelectedLogId(logId);
    if (logId === 'new') {
      setWins('');
      setOnePercentBetter('');
      setFrictionEncountered('');
      setRewardEnjoyed('');
      setAmides('');
      setEnergyRating(4);
      setAiCoachInsight('');
      setIdentityAffirmation('');
    } else {
      const found = diaryEntries[logId];
      if (found) {
        setWins(found.wins || '');
        setOnePercentBetter(found.onePercentBetter || '');
        setFrictionEncountered(found.frictionEncountered || '');
        setRewardEnjoyed(found.rewardEnjoyed || '');
        setAmides(found.amides || '');
        setEnergyRating(found.energyRating || 4);
        setAiCoachInsight(found.aiCoachInsight || '');
        setIdentityAffirmation(found.identityAffirmation || '');
      }
    }
  };

  const dayTasks = tasks.filter((t) => t.date === currentDate);
  const completedTasks = dayTasks.filter((t) => t.isCompleted);
  const completedTaskTitles = completedTasks.map((t) => t.title);

  const completedHabits = habits.filter((h) => Boolean(h.completions[currentDate]));
  const completedHabitTitles = completedHabits.map((h) => h.title);

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
          completedCount: completedTasks.length,
          totalCount: dayTasks.length,
          habitsCompleted: completedHabits.length,
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
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entryId =
      selectedLogId !== 'new'
        ? selectedLogId
        : `log_${currentDate}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const entry: DailyDiaryEntry = {
      id: entryId,
      date: currentDate,
      logTime: timeFormatted,
      wins: wins.trim(),
      onePercentBetter: onePercentBetter.trim(),
      frictionEncountered: frictionEncountered.trim(),
      rewardEnjoyed: rewardEnjoyed.trim(),
      amides: amides.trim(),
      energyRating,
      aiCoachInsight: aiCoachInsight || undefined,
      identityAffirmation: identityAffirmation || undefined,
      tasksCompletedCount: completedTasks.length,
      tasksTotalCount: dayTasks.length,
      habitsCompletedCount: completedHabits.length,
      habitsTotalCount: habits.length,
      completedTaskTitles,
      completedHabitTitles,
      updatedAt: now.toISOString(),
    };

    onSaveEntry(entry);
    setSaveSuccess(true);

    // Clear all inputs immediately so space is completely fresh and ready for another entry
    setSelectedLogId('new');
    setWins('');
    setOnePercentBetter('');
    setFrictionEncountered('');
    setRewardEnjoyed('');
    setAmides('');
    setEnergyRating(4);
    setAiCoachInsight('');
    setIdentityAffirmation('');

    setTimeout(() => {
      setSaveSuccess(false);
    }, 1800);
  };

  // Sort past entries newest first (by date then by updatedAt)
  const pastEntriesList = [...allEntriesList].sort((a, b) => {
    const comp = b.date.localeCompare(a.date);
    if (comp !== 0) return comp;
    return (b.updatedAt || '').localeCompare(a.updatedAt || '');
  });

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
              <h3 className="text-base font-bold text-slate-900">Daily Victory Log & Reflection</h3>
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
                Log Entry
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
            {/* Saved Notification Banner */}
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Log saved to Archive! The fields are cleared for your next entry.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                >
                  View in Archive →
                </button>
              </div>
            )}

            {/* Daily Execution Snapshot */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-semibold">Tasks Done</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {completedTasks.length}/{dayTasks.length}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] font-semibold">Habits Completed</span>
                <span className="text-sm font-bold text-emerald-600 font-mono">
                  {completedHabits.length}/{habits.length}
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-purple-700">
                  5. Amides, Reflections & Daily Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Lessons learned, amides/adjustments, notes on mindset, or things to follow up on."
                  value={amides}
                  onChange={(e) => setAmides(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500"
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
                  key={entry.id || entry.date}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-sm font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        {entry.date}
                      </span>
                      {entry.logTime && (
                        <span className="text-[11px] text-slate-500 font-mono">
                          • {entry.logTime}
                        </span>
                      )}
                    </div>

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

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('today');
                          handleSelectLog(entry.id);
                        }}
                        className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-200 text-indigo-600 rounded-md font-semibold cursor-pointer shadow-2xs"
                        title="Edit / view this session"
                      >
                        Edit
                      </button>

                      {onDeleteEntry && (
                        <button
                          type="button"
                          onClick={() => onDeleteEntry(entry.id)}
                          className="px-1.5 py-0.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete entry"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 1. Wins */}
                  {entry.wins && (
                    <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-100/80">
                      <span className="font-bold text-amber-800 block text-[11px] mb-0.5">🏆 Wins & Accomplishments:</span>
                      <p className="text-slate-700 whitespace-pre-wrap">{entry.wins}</p>
                    </div>
                  )}

                  {/* 2. Micro-Upgrade */}
                  {entry.onePercentBetter && (
                    <div className="bg-indigo-50/60 p-2 rounded-xl border border-indigo-100/80">
                      <span className="font-bold text-indigo-800 block text-[11px] mb-0.5">⚡ Micro-Upgrade for Tomorrow:</span>
                      <p className="text-slate-700 whitespace-pre-wrap">{entry.onePercentBetter}</p>
                    </div>
                  )}

                  {/* 3. Friction & Distraction Triggers */}
                  {entry.frictionEncountered && (
                    <div className="bg-rose-50/50 p-2 rounded-xl border border-rose-100/70">
                      <span className="font-bold text-rose-800 block text-[11px] mb-0.5">⚠️ Friction & Challenges Faced:</span>
                      <p className="text-slate-700 whitespace-pre-wrap">{entry.frictionEncountered}</p>
                    </div>
                  )}

                  {/* 4. Guilt-Free Rewards */}
                  {entry.rewardEnjoyed && (
                    <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/70">
                      <span className="font-bold text-emerald-800 block text-[11px] mb-0.5">🎉 Rewards & Rest Enjoyed:</span>
                      <p className="text-slate-700">{entry.rewardEnjoyed}</p>
                    </div>
                  )}

                  {/* 5. Amides / Reflection Notes */}
                  {entry.amides && (
                    <div className="bg-purple-50/50 p-2 rounded-xl border border-purple-100/70">
                      <span className="font-bold text-purple-800 block text-[11px] mb-0.5">📝 Amides, Reflections & Notes:</span>
                      <p className="text-slate-700 whitespace-pre-wrap">{entry.amides}</p>
                    </div>
                  )}

                  {/* 6. Completed Tasks Done */}
                  {entry.completedTaskTitles && entry.completedTaskTitles.length > 0 && (
                    <div className="bg-slate-100/80 p-2 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 block text-[11px] mb-1">
                        ✅ Completed Tasks Done ({entry.completedTaskTitles.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {entry.completedTaskTitles.map((taskTitle, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-medium text-slate-700 shadow-2xs"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {taskTitle}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 7. Completed Habits */}
                  {entry.completedHabitTitles && entry.completedHabitTitles.length > 0 && (
                    <div className="bg-slate-100/80 p-2 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-800 block text-[11px] mb-1">
                        🔥 Habits Maintained ({entry.completedHabitTitles.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {entry.completedHabitTitles.map((habitTitle, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-medium text-slate-700 shadow-2xs"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            {habitTitle}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 8. AI Coach Insight */}
                  {entry.aiCoachInsight && (
                    <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 italic text-[11px] flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold not-italic text-indigo-950 block mb-0.5">Coach Insight:</span>
                        <span>"{entry.aiCoachInsight}"</span>
                      </div>
                    </div>
                  )}

                  {/* 9. Mindset / Identity Affirmation */}
                  {entry.identityAffirmation && (
                    <div className="text-[11px] text-slate-600 font-medium px-1">
                      Mindset: <span className="italic">"{entry.identityAffirmation}"</span>
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
