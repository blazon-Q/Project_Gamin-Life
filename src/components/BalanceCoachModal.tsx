import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Gift, ArrowRight, Loader2, CheckCircle, X } from 'lucide-react';
import { AIBalanceResult, Task, Habit } from '../types';

interface BalanceCoachModalProps {
  tasks: Task[];
  habits: Habit[];
  onClose: () => void;
}

export const BalanceCoachModal: React.FC<BalanceCoachModalProps> = ({
  tasks,
  habits,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AIBalanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  let neededMinutes = 0;
  let rewardingMinutes = 0;
  let maintenanceMinutes = 0;

  tasks.forEach((t) => {
    const mins = t.estimatedMinutes || 30;
    if (t.category === 'needed') neededMinutes += mins;
    else if (t.category === 'rewarding') rewardingMinutes += mins;
    else if (t.category === 'maintenance') maintenanceMinutes += mins;
  });

  useEffect(() => {
    let isMounted = true;
    const fetchCoach = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/ai/balance-coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            neededMinutes,
            rewardingMinutes,
            maintenanceMinutes,
            habitsCount: habits.length,
            sectionsCount: 1,
            userContext: 'Student / High ambition learner aiming for sustainable execution without burnout',
          }),
        });

        if (!res.ok) throw new Error('Failed to get coach response');
        const data: AIBalanceResult = await res.json();
        if (isMounted) setResult(data);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Unable to analyze schedule at this time.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCoach();
    return () => {
      isMounted = false;
    };
  }, [neededMinutes, rewardingMinutes, maintenanceMinutes, habits.length]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Daily Schedule Feedback</h3>
              <p className="text-xs text-slate-500">
                Prevent burnout and rigid schedule drop-off through balanced reward pairing
              </p>
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
            <p className="text-sm font-semibold text-slate-700">Evaluating daily schedule balance...</p>
            <p className="text-xs text-slate-400">Checking Needed vs Rewarding ratio to prevent fatigue</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
            <p className="font-semibold">Notice:</p>
            <p>{error}</p>
          </div>
        ) : result ? (
          <div className="space-y-4">
            {/* Score & Status Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Sustainability Score
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {result.sustainabilityScore}/100
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {result.status}
                </span>
              </div>
            </div>

            {/* Critique */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">Coach Assessment:</span>
              {result.critique}
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                Recommended Routine Tweaks:
              </span>
              <div className="space-y-1.5">
                {result.recommendations?.map((rec, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Temptation Bundle Idea */}
            {result.temptationBundleIdea && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Gift className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Reward Pairing Idea:</span>
                </div>
                <p>{result.temptationBundleIdea}</p>
              </div>
            )}

            {/* Strategy Rule */}
            {(result?.strategyRule || (result as any)?.atomicRule) && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs text-indigo-800 italic">
                "{result.strategyRule || (result as any)?.atomicRule}"
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
