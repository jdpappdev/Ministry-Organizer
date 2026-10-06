import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../common/BottomSheet';
import { User, Compass, ChevronRight, X } from 'lucide-react';

interface SettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onSaveName: (name: string) => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  onClose,
  userName,
  onSaveName,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [inputName, setInputName] = useState(userName);

  useEffect(() => {
    if (isOpen) {
      setInputName(userName);
      setIsEditingName(false);
    }
  }, [isOpen, userName]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveName(inputName.trim());
    setIsEditingName(false);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Field Journal Settings"
      subtitle="Personalization and journal preferences"
    >
      <div className="space-y-4 pt-1">
        {/* Your Name row */}
        {!isEditingName ? (
          <button
            onClick={() => {
              setInputName(userName);
              setIsEditingName(true);
            }}
            className="w-full p-4 rounded-xl bg-[#FCFBF8] border border-[#DCDDD5] flex items-center justify-between hover:border-[#183A35] transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-[#183A35]/10 text-[#183A35] flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B87545]">
                  YOUR NAME
                </div>
                <div className="font-display font-bold text-sm text-[#17201E] truncate mt-0.5">
                  {userName ? userName : <span className="text-[#68716D] font-normal italic">Add your name</span>}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#68716D] group-hover:text-[#183A35] group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        ) : (
          /* Name Editing Form */
          <form onSubmit={handleSave} className="p-4 rounded-xl bg-[#FCFBF8] border border-[#183A35] space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#DCDDD5]/60 pb-2">
              <div>
                <h3 className="font-display font-bold text-sm text-[#17201E]">
                  Your name
                </h3>
                <p className="text-[11px] text-[#68716D]">
                  This name will appear in your Home greeting.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="p-1 text-[#68716D] hover:text-[#17201E]"
                aria-label="Cancel editing"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17201E] mb-1">
                Your name
              </label>
              <input
                type="text"
                autoFocus
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-11 px-3.5 text-xs font-medium bg-white border border-[#DCDDD5] rounded-[10px] focus:outline-none focus:border-[#183A35] text-[#17201E]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCDDD5]/60">
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="h-9 px-3.5 text-xs font-semibold text-[#68716D] hover:text-[#17201E] rounded-[8px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-4 text-xs font-semibold text-white bg-[#183A35] hover:bg-[#102C29] active:scale-95 rounded-[8px] transition-all shadow-2xs"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* About Info */}
        <div className="pt-3 border-t border-[#DCDDD5]/60 text-xs text-[#68716D] space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#183A35]">
            <Compass className="w-3.5 h-3.5 text-[#B87545]" />
            <span>Ministry Organizer · Geographic Editorial v1.0</span>
          </div>
          <p>
            Designed mobile-first as a digital field journal for personal ministry records.
          </p>
        </div>
      </div>
    </BottomSheet>
  );
};
