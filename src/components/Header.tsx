import React from 'react';
import { Calendar, BookOpen, Bell, Volume2, VolumeX, ShieldCheck, ChevronLeft, ChevronRight, Cloud } from 'lucide-react';
import { NotificationItem, UserProfile } from '../types';

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenDiary: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  xpPoints: number;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onOpenAccount: () => void;
  syncStatus?: 'idle' | 'syncing' | 'saved' | 'error';
  activeAccount?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  notifications,
  onOpenNotifications,
  onOpenDiary,
  soundEnabled,
  onToggleSound,
  xpPoints,
  userProfile,
  onOpenProfile,
  onOpenAccount,
  syncStatus = 'saved',
  activeAccount = 'default',
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const dateObj = new Date(currentDate + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = currentDate === todayStr;

  const handlePrevDay = () => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const level = Math.floor(xpPoints / 250) + 1;
  const currentLevelProgress = xpPoints % 250;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Player Profile Avatar */}
          <div className="flex items-center justify-between w-full sm:w-auto space-x-3">
            <div className="flex items-center space-x-3">
              {/* Clickable Avatar to view/edit profile */}
              <button
                type="button"
                onClick={onOpenProfile}
                className="relative p-0.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-amber-500 hover:scale-105 transition-all cursor-pointer shadow-xs"
                title="Click to edit profile & avatar"
              >
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-9 h-9 rounded-xl bg-slate-100 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 px-1 py-0.2 bg-amber-500 text-white text-[9px] font-black rounded-md leading-none shadow-xs">
                  L{level}
                </span>
              </button>

              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="text-left text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  {userProfile.name}
                </button>
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <span>Level {level}</span>
                  <span>•</span>
                  <span className="font-mono text-indigo-600 font-semibold">{xpPoints} XP</span>
                </span>
              </div>
            </div>

            {/* Level XP Bar (Mobile view) */}
            <div className="sm:hidden flex items-center space-x-1.5">
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                L{level}
              </span>
            </div>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onDateChange(todayStr)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isToday
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Today
            </button>

            <div className="flex items-center space-x-1.5 px-2 py-1 text-xs font-bold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>{formattedDate}</span>
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Actions & Controls */}
          <div className="flex items-center space-x-2">
            {/* Desktop XP Bar */}
            <button
              type="button"
              onClick={onOpenProfile}
              className="hidden lg:flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(currentLevelProgress / 250) * 100}%` }}
                />
              </div>
              <span className="text-slate-600 font-mono text-[11px] font-semibold">{xpPoints} XP</span>
            </button>

            {/* Cloud Memory & Sync Button */}
            <button
              type="button"
              onClick={onOpenAccount}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
              title="Cloud Memory & Backup: Auto-saves your username, level, and quests"
            >
              <Cloud className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline max-w-[120px] truncate text-[11px]">
                {activeAccount !== 'default' ? activeAccount : 'Auto-Saved'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  syncStatus === 'syncing'
                    ? 'bg-amber-400 animate-spin'
                    : syncStatus === 'error'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500 animate-pulse'
                }`}
                title={
                  syncStatus === 'syncing'
                    ? 'Saving to cloud memory...'
                    : syncStatus === 'error'
                    ? 'Saved locally'
                    : 'Permanently saved to cloud'
                }
              />
            </button>

            {/* Daily Victory Log */}
            <button
              type="button"
              onClick={onOpenDiary}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200/80 transition-all cursor-pointer"
              title="Open Daily Victory Log"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Daily Log</span>
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={onToggleSound}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600'
              }`}
              title={soundEnabled ? 'Chime sound on' : 'Chime sound muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Reminders"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
