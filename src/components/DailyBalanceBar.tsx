import React from 'react';
import { Sparkles, Brain, Gift, AlertTriangle, ShieldCheck, CheckCircle2, Award } from 'lucide-react';
import { Task } from '../types';

interface DailyBalanceBarProps {
  tasks: Task[];
  onOpenCoachModal: () => void;
  isCoachLoading?: boolean;
}

export const DailyBalanceBar: React.FC<DailyBalanceBarProps> = ({
  tasks,
  onOpenCoachModal,
  isCoachLoading,
}) => {
  let neededMinutes = 0;
  let rewardingMinutes = 0;
  let maintenanceMinutes = 0;
  let neededCount = 0;
  let rewardingCount = 0;
  let maintenanceCount = 0;

  tasks.forEach((task) => {
    const mins = task.estimatedMinutes || 30;
    if (task.category === 'needed') {
      neededMinutes += mins;
      neededCount += 1;
    } else if (task.category === 'rewarding') {
      rewardingMinutes += mins;
      rewardingCount += 1;
    } else if (task.category === 'maintenance') {
      maintenanceMinutes += mins;
      maintenanceCount += 1;
    }
  });

  const totalMinutes = neededMinutes + rewardingMinutes + maintenanceMinutes;

  const neededPct = totalMinutes > 0 ? Math.round((neededMinutes / totalMinutes) * 100) : 0;
  const rewardingPct = totalMinutes > 0 ? Math.round((rewardingMinutes / totalMinutes) * 100) : 0;
  const maintenancePct = totalMinutes > 0 ? Math.max(0, 100 - neededPct - rewardingPct) : 0;

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) return `${h}h ${m > 0 ? `${m}m` : ''}`;
    return `${m}m`;
  };

  // Compute AI Rating based on human answers (tasks entered)
  let ratingScore = '9.0';
  let ratingVerdict = 'Balanced Schedule';
  let ratingColor = 'emerald';
  let ratingExplanation =
    'Great rhythm: Your high-priority needed focus is protected by planned rewards and chores.';

  if (totalMinutes === 0) {
    ratingScore = '--';
    ratingVerdict = 'Ready for Planning';
    ratingColor = 'slate';
    ratingExplanation =
      'Enter your things to be done above to generate your daily AI ratio rating.';
  } else if (rewardingMinutes === 0 && neededMinutes >= 60) {
    ratingScore = '4.5';
    ratingVerdict = 'Burnout Risk (No Rewards)';
    ratingColor = 'rose';
    ratingExplanation =
      'All work and no planned rewards leads to rigid burnout. Add at least one replenishing reward or break.';
  } else if (rewardingPct < 15 && neededPct > 70) {
    ratingScore = '6.8';
    ratingVerdict = 'High Pressure';
    ratingColor = 'amber';
    ratingExplanation =
      'Heavy focus ratio. Consider adding a small reward buffer to sustain long-term consistency.';
  } else if (rewardingPct > 55) {
    ratingScore = '6.5';
    ratingVerdict = 'High Leisure';
    ratingColor = 'sky';
    ratingExplanation =
      'Relaxed day. If you have impending deadlines, ensure non-negotiable needed items are scheduled.';
  } else if (neededPct >= 45 && neededPct <= 75 && rewardingPct >= 15) {
    ratingScore = '9.5';
    ratingVerdict = 'Optimal Harmony';
    ratingColor = 'emerald';
    ratingExplanation =
      'Golden ratio: Solid dedicated focus paired with guilt-free replenishment and routine maintenance.';
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
      {/* Heading & AI Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>AI Schedule Rating</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    ratingColor === 'emerald'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : ratingColor === 'rose'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : ratingColor === 'amber'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : ratingColor === 'sky'
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {ratingVerdict}
                </span>
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ratio of <span className="font-semibold text-indigo-700">Needed</span> :{' '}
            <span className="font-semibold text-emerald-700">Rewarding</span> :{' '}
            <span className="font-semibold text-amber-700">Chores</span> as per your entered tasks
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Rating Badge */}
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Award className="w-4 h-4 text-amber-500" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                AI Rating
              </span>
              <span className="text-sm font-extrabold text-slate-800 font-mono">
                {ratingScore} <span className="text-[10px] text-slate-400 font-normal">/ 10</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCoachModal}
            disabled={isCoachLoading}
            className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200/80 transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isCoachLoading ? 'Analyzing...' : 'AI Feedback Coach'}</span>
          </button>
        </div>
      </div>

      {/* Prominent Ratio Summary */}
      <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-semibold">Active Ratio:</span>
          <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-xs">
            {totalMinutes > 0
              ? `${neededPct}% Needed : ${rewardingPct}% Rewarding : ${maintenancePct}% Chores`
              : '0% Needed : 0% Rewarding : 0% Chores'}
          </span>
        </div>
        <div className="text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span>{ratingExplanation}</span>
        </div>
      </div>

      {/* Visual Multi-Segment Ratio Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex gap-0.5 p-0.5">
          {neededPct > 0 && (
            <div
              className="bg-indigo-600 h-full rounded-xs transition-all duration-500"
              style={{ width: `${neededPct}%` }}
              title={`Needed: ${formatMins(neededMinutes)} (${neededPct}%)`}
            />
          )}
          {rewardingPct > 0 && (
            <div
              className="bg-emerald-500 h-full rounded-xs transition-all duration-500"
              style={{ width: `${rewardingPct}%` }}
              title={`Rewarding: ${formatMins(rewardingMinutes)} (${rewardingPct}%)`}
            />
          )}
          {maintenancePct > 0 && (
            <div
              className="bg-amber-500 h-full rounded-xs transition-all duration-500"
              style={{ width: `${maintenancePct}%` }}
              title={`Chores / Maintenance: ${formatMins(maintenanceMinutes)} (${maintenancePct}%)`}
            />
          )}
        </div>
      </div>

      {/* Detailed 3-Box Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        {/* Needed */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-indigo-600 flex-shrink-0 ring-2 ring-indigo-200" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">🔵 Needed Priority</span>
              <span className="font-mono text-indigo-700 font-bold">{neededPct}%</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center justify-between">
              <span>{formatMins(neededMinutes)}</span>
              <span>{neededCount} tasks</span>
            </div>
          </div>
        </div>

        {/* Rewarding */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0 ring-2 ring-emerald-200" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">🟢 Rewarding Breaks</span>
              <span className="font-mono text-emerald-700 font-bold">{rewardingPct}%</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center justify-between">
              <span>{formatMins(rewardingMinutes)}</span>
              <span>{rewardingCount} tasks</span>
            </div>
          </div>
        </div>

        {/* Chores / Maintenance */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-amber-500 flex-shrink-0 ring-2 ring-amber-200" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">🟡 Chores & Errands</span>
              <span className="font-mono text-amber-700 font-bold">{maintenancePct}%</span>
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center justify-between">
              <span>{formatMins(maintenanceMinutes)}</span>
              <span>{maintenanceCount} tasks</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
