import React, { useState } from 'react';
import {
  Settings2,
  Plus,
  Trash2,
  Clock,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Check,
  Sunrise,
  School,
  BookOpen,
  Moon,
  Dumbbell,
  Briefcase
} from 'lucide-react';
import { DaySection } from '../types';
import { PRESET_SECTION_TEMPLATES } from '../utils/storage';

interface SectionCustomizerModalProps {
  sections: DaySection[];
  onClose: () => void;
  onSaveSections: (sections: DaySection[]) => void;
}

export const SectionCustomizerModal: React.FC<SectionCustomizerModalProps> = ({
  sections,
  onClose,
  onSaveSections,
}) => {
  const [localSections, setLocalSections] = useState<DaySection[]>([...sections]);
  const [showAddForm, setShowAddForm] = useState(false);

  // New section form
  const [newTitle, setNewTitle] = useState('');
  const [newStartTime, setNewStartTime] = useState('06:00');
  const [newEndTime, setNewEndTime] = useState('08:00');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('sunrise');

  const handleApplyPreset = (key: string) => {
    const preset = PRESET_SECTION_TEMPLATES[key];
    if (preset) {
      setLocalSections([...preset.sections]);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= localSections.length) return;

    const copy = [...localSections];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    // update orders
    copy.forEach((s, i) => {
      s.order = i + 1;
    });
    setLocalSections(copy);
  };

  const handleDelete = (id: string) => {
    if (localSections.length <= 1) {
      alert('You must have at least one day section.');
      return;
    }
    setLocalSections((prev) => prev.filter((s) => s.id !== id));
  };

  const handleUpdateField = (id: string, field: keyof DaySection, value: any) => {
    setLocalSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSec: DaySection = {
      id: `sec_${Date.now()}`,
      title: newTitle.trim(),
      startTime: newStartTime,
      endTime: newEndTime,
      color: 'indigo',
      description: newDesc.trim(),
      order: localSections.length + 1,
      icon: newIcon,
    };

    setLocalSections((prev) => [...prev, newSec]);
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const handleSave = () => {
    onSaveSections(localSections);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Customize Day Sections</h3>
              <p className="text-xs text-slate-400">
                Divide your day to match your unique rhythm (e.g. Student home mornings/evenings + campus)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Preset Templates */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Apply Schedule Preset (1-Click)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.entries(PRESET_SECTION_TEMPLATES).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleApplyPreset(key)}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800/80 text-left transition-all hover:border-slate-700 cursor-pointer"
              >
                <div className="text-xs font-bold text-indigo-300 mb-0.5">{item.label}</div>
                <div className="text-[10px] text-slate-400 line-clamp-2">{item.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Existing Sections List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Your Active Sections ({localSections.length})</span>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Section</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {localSections.map((sec, idx) => (
              <div
                key={sec.id}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => handleUpdateField(sec.id, 'title', e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex items-center space-x-1 text-slate-400">
                      <input
                        type="time"
                        value={sec.startTime}
                        onChange={(e) => handleUpdateField(sec.id, 'startTime', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                      <span className="text-[10px]">-</span>
                      <input
                        type="time"
                        value={sec.endTime}
                        onChange={(e) => handleUpdateField(sec.id, 'endTime', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Section focus / purpose"
                    value={sec.description}
                    onChange={(e) => handleUpdateField(sec.id, 'description', e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800/80 rounded-lg px-2.5 py-1 text-[11px] text-slate-300"
                  />
                </div>

                {/* Move & Delete buttons */}
                <div className="flex items-center space-x-1 self-end sm:self-center">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === localSections.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(sec.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                    title="Delete section"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Section Modal form */}
        {showAddForm && (
          <form
            onSubmit={handleAddSection}
            className="p-4 bg-slate-950 border border-indigo-500/30 rounded-xl space-y-3"
          >
            <h4 className="text-xs font-bold text-white">Create Custom Schedule Section</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                required
                placeholder="Section Name (e.g. Early Morning Study)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <div className="flex items-center space-x-1">
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                />
                <span className="text-slate-500 text-xs">-</span>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <input
              type="text"
              placeholder="Short description (e.g. High intensity focus at home)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
            />

            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
              >
                Add Section
              </button>
            </div>
          </form>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Save Schedule Layout
          </button>
        </div>
      </div>
    </div>
  );
};
