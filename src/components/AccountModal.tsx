import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Mail,
  Download,
  Upload,
  UserCheck,
  AlertCircle,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserProfile, Task, Habit, DailyDiaryEntry, NotificationItem } from '../types';
import { syncService, SyncStatus } from '../utils/syncService';
import { exportAllData, importAllData, getActiveAccount, setActiveAccount } from '../utils/storage';

interface AccountModalProps {
  userProfile: UserProfile;
  tasks: Task[];
  habits: Habit[];
  diaryEntries: Record<string, DailyDiaryEntry>;
  notifications: NotificationItem[];
  xpPoints: number;
  onClose: () => void;
  onAccountLoaded: (data: {
    profile: UserProfile;
    tasks: Task[];
    habits: Habit[];
    diaryEntries: Record<string, DailyDiaryEntry>;
    notifications: NotificationItem[];
    xpPoints: number;
    accountKey?: string;
  }) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  userProfile,
  tasks,
  habits,
  diaryEntries,
  notifications,
  xpPoints,
  onClose,
  onAccountLoaded,
}) => {
  const [activeAcc, setActiveAcc] = useState(getActiveAccount());
  const [emailInput, setEmailInput] = useState('');
  const [knownAccounts, setKnownAccounts] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const unsub = syncService.subscribeStatus((status, time) => {
      setSyncStatus(status);
      if (time) setLastSaved(time);
    });

    syncService.listAccounts().then((accounts) => {
      setKnownAccounts(accounts);
    });

    return unsub;
  }, []);

  const handleManualSync = async () => {
    setLoading(true);
    setMessage(null);
    const success = await syncService.saveImmediately({
      account: activeAcc,
      profile: userProfile,
      tasks,
      habits,
      diaryEntries,
      notifications,
      xpPoints,
    });
    setLoading(false);
    if (success) {
      setMessage({ type: 'success', text: 'All data successfully saved to cloud!' });
    } else {
      setMessage({ type: 'error', text: 'Could not sync to cloud. Local changes are safe.' });
    }
  };

  const handleConnectAccount = async (targetAccount: string) => {
    const cleaned = targetAccount.trim().toLowerCase();
    if (!cleaned) return;

    setLoading(true);
    setMessage(null);

    // Call server auth/login
    const result = await syncService.loginWithAccount({
      email: cleaned,
      name: userProfile.name !== 'Player One' ? userProfile.name : cleaned.split('@')[0],
      picture: userProfile.avatarUrl,
    });

    setLoading(false);

    if (result) {
      setActiveAcc(cleaned);
      setActiveAccount(cleaned);

      // If server returned existing tasks or habits, load them!
      const loadedProfile = result.profile || {
        ...userProfile,
        email: cleaned,
        hasOnboarded: true,
      };

      onAccountLoaded({
        profile: loadedProfile,
        tasks: Array.isArray(result.tasks) && result.tasks.length > 0 ? result.tasks : tasks,
        habits: Array.isArray(result.habits) && result.habits.length > 0 ? result.habits : habits,
        diaryEntries: result.diaryEntries || diaryEntries,
        notifications: result.notifications || notifications,
        xpPoints: result.xpPoints || xpPoints,
        accountKey: cleaned,
      });

      setMessage({
        type: 'success',
        text: `Connected as ${cleaned}! All progress is linked and remembered.`,
      });

      // Refresh accounts list
      syncService.listAccounts().then(setKnownAccounts);
    } else {
      setMessage({ type: 'error', text: 'Failed to link account. Please try again.' });
    }
  };

  const handleExportBackup = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gamin-life-backup-${activeAcc || 'user'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = importAllData(text);
        if (ok) {
          setMessage({ type: 'success', text: 'Backup restored successfully! Reloading...' });
          setTimeout(() => window.location.reload(), 1200);
        } else {
          setMessage({ type: 'error', text: 'Invalid backup file.' });
        }
      } catch {
        setMessage({ type: 'error', text: 'Could not read backup file.' });
      }
    };
    reader.readAsText(file);
  };

  const level = Math.floor(xpPoints / 250) + 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Account & Cloud Memory</h3>
              <p className="text-xs text-slate-500">Your username, level, and tasks are permanently stored</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Current Active Profile Box */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-slate-900">{userProfile.name}</span>
                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold">
                  Level {level}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-mono text-slate-700">{activeAcc === 'default' ? 'Device Profile' : activeAcc}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleManualSync}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Force immediate save to cloud"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Now</span>
          </button>
        </div>

        {/* Cloud Sync State Details */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1">
            <span className="text-slate-500 block">Cloud Memory</span>
            <div className="flex items-center space-x-1.5 font-bold text-indigo-900">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {syncStatus === 'syncing'
                  ? 'Saving changes...'
                  : syncStatus === 'saved'
                  ? 'Active & Saved'
                  : 'Ready'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <span className="text-slate-500 block">Saved Quests & Habits</span>
            <span className="font-bold text-slate-800">
              {tasks.length} tasks • {habits.length} habits
            </span>
          </div>
        </div>

        {/* Connect Profile or Cloud Sync Key */}
        <div className="space-y-3 pt-1">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Profile Sync & Cloud Memory
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter a username or sync key to save and sync your progress across devices without requiring an email.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="e.g. Blazon, Warrior, Hero"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={() => handleConnectAccount(emailInput)}
              disabled={loading || !emailInput.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 flex items-center space-x-1"
            >
              <span>Switch / Save</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Remembered Accounts List */}
        {knownAccounts.length > 0 && (
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Saved Profiles On This App
            </h4>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {knownAccounts.map((acc) => (
                <div
                  key={acc.account}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-xs transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={acc.avatarUrl || userProfile.avatarUrl}
                      alt={acc.name}
                      className="w-6 h-6 rounded-lg object-cover"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block">{acc.name}</span>
                      <span className="font-mono text-[10px] text-slate-500">{acc.account}</span>
                    </div>
                  </div>

                  {acc.account === activeAcc ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                      Current
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnectAccount(acc.account)}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 hover:text-indigo-600 rounded-lg text-[11px] font-semibold cursor-pointer"
                    >
                      Switch
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backup & Export Options */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center space-x-1 text-slate-600 hover:text-indigo-600 cursor-pointer font-medium"
              title="Download your full progress backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup</span>
            </button>

            <span>•</span>

            <label className="flex items-center space-x-1 text-slate-600 hover:text-indigo-600 cursor-pointer font-medium">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
