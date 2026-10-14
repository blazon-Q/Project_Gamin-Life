import React, { useState } from 'react';
import { Camera, ShieldCheck, Trophy, X, Check, Flame } from 'lucide-react';
import { UserProfile } from '../types';
import { PRESET_AVATARS } from '../utils/storage';

interface ProfileModalProps {
  profile: UserProfile;
  xpPoints: number;
  habitsStreak: number;
  completedQuestsCount: number;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  xpPoints,
  habitsStreak,
  completedQuestsCount,
  onClose,
  onSaveProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);

  const level = Math.floor(xpPoints / 250) + 1;
  const currentProgress = xpPoints % 250;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveProfile({
      ...profile,
      name: name.trim() || profile.name,
      avatarUrl,
      level,
      xp: xpPoints,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Player Profile & Picture</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar & Photo Upload */}
        <div className="flex flex-col items-center space-y-3">
          <div className="relative group">
            <img
              src={avatarUrl}
              alt={name}
              className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-indigo-500 shadow-md object-cover"
            />
            <label className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl cursor-pointer shadow-sm transition-all">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Quick presets */}
          <div className="flex items-center space-x-2">
            {PRESET_AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setAvatarUrl(av.url)}
                className={`p-1 rounded-xl border transition-all cursor-pointer ${
                  avatarUrl === av.url
                    ? 'border-indigo-500 bg-indigo-50 scale-105'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <img
                  src={av.url}
                  alt={av.label}
                  className="w-7 h-7 rounded-lg bg-slate-100"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Player Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Player Name / Nickname
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Level & XP Stats */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-indigo-700 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Level {level}
            </span>
            <span className="text-slate-500 font-mono">
              {currentProgress} / 250 XP
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(currentProgress / 250) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Tasks Finished</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {completedQuestsCount}
              </span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Habit Streak</span>
              <span className="font-bold text-amber-600 font-mono text-sm flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                {habitsStreak}d
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
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
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
