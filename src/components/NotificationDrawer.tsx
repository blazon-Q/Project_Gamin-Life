import React from 'react';
import { Bell, Volume2, ShieldCheck, Clock, X } from 'lucide-react';
import { NotificationItem, Task, Habit } from '../types';
import { requestNotificationPermission, hasNotificationPermission } from '../utils/notifications';
import { playReminderChime } from '../utils/audio';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onClearNotifications: () => void;
  onMarkAllRead: () => void;
  tasks: Task[];
  habits: Habit[];
  currentDate: string;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearNotifications,
  onMarkAllRead,
  tasks,
  habits,
  currentDate,
}) => {
  if (!isOpen) return null;

  const isBrowserPermitted = hasNotificationPermission();

  const handleRequestPerm = async () => {
    const res = await requestNotificationPermission();
    if (res === 'granted') {
      playReminderChime();
    }
  };

  const handleTestSound = () => {
    playReminderChime();
  };

  const dayTasksWithTimes = tasks
    .filter((t) => t.date === currentDate && t.scheduledTime && !t.isCompleted)
    .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="bg-white border-l border-slate-200 w-full max-w-md h-full p-5 flex flex-col justify-between shadow-2xl relative">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reminders & Alerts</h3>
                <p className="text-xs text-slate-500">Timely notifications for tasks & commitments</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-lg p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Browser Permission & Sound Test bar */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Browser Alerts
              </span>
              {isBrowserPermitted ? (
                <span className="text-[11px] text-emerald-700 font-bold">✓ Enabled</span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestPerm}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Enable Permissions
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
              <span className="text-slate-500">Audio Chime Test</span>
              <button
                type="button"
                onClick={handleTestSound}
                className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] rounded-lg border border-slate-200 cursor-pointer shadow-2xs"
              >
                <Volume2 className="w-3 h-3 text-indigo-600" />
                <span>Play Sound</span>
              </button>
            </div>
          </div>

          {/* Upcoming Schedule for Today */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Scheduled Timers Today
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {dayTasksWithTimes.length === 0 ? (
                <div className="p-2 text-xs text-slate-400 italic bg-slate-50 rounded-xl text-center">
                  No tasks with specific times scheduled today.
                </div>
              ) : (
                dayTasksWithTimes.map((t) => (
                  <div
                    key={t.id}
                    className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between text-slate-700"
                  >
                    <span className="truncate max-w-[240px] font-medium">{t.title}</span>
                    <span className="font-mono text-indigo-600 font-bold">{t.scheduledTime}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Triggered Notifications Log */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Recent Alerts ({notifications.length})
              </h4>
              {notifications.length > 0 && (
                <div className="flex items-center space-x-2 text-[11px]">
                  <button
                    onClick={onMarkAllRead}
                    className="text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Mark Read
                  </button>
                  <span>•</span>
                  <button
                    onClick={onClearNotifications}
                    className="text-rose-600 hover:text-rose-700 cursor-pointer font-medium"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No alerts fired yet. Reminders trigger automatically when task times arrive.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border text-xs transition-all ${
                      item.read
                        ? 'bg-slate-50/70 border-slate-200/60 opacity-70 text-slate-500'
                        : 'bg-white border-indigo-200 shadow-2xs text-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="mt-1 leading-relaxed text-slate-600">{item.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 text-center">
            Active rhythm alerts keep you locked in without manual tracking chores.
          </p>
        </div>
      </div>
    </div>
  );
};
