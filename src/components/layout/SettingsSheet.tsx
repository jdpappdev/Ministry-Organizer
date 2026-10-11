import React, { useState, useEffect } from 'react';
import { FloatingCard } from '../common/FloatingCard';
import { User, Compass, ChevronRight, X, Settings } from 'lucide-react';

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
    <FloatingCard
      isOpen={isOpen}
      onClose={onClose}
      title="Field Journal Settings"
      subtitle="Personalization & preferences"
      icon={<Settings className="w-4 h-4 text-[#C9A978]" />}
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4">
        {/* Your Name row as floating paper strip */}
        {!isEditingName ? (
          <button
            onClick={() => {
              setInputName(userName);
              setIsEditingName(true);
            }}
            className="w-full p-4 rounded-[14px] bg-[#FCFBF8] border border-[#D6CBB8] border-b-[2px] border-r-[2px] border-b-[#C2B5A0] border-r-[#C2B5A0] flex items-center justify-between hover:border-[#1F3D36] transition-all text-left group cursor-pointer shadow-2xs active:translate-y-0.5"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-[10px] bg-[#1F3D36]/10 text-[#1F3D36] flex items-center justify-center shrink-0 border border-[#1F3D36]/15">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C2571A]">
                  YOUR NAME
                </div>
                <div className="font-display font-bold text-base text-[#1B2421] truncate mt-0.5">
                  {userName ? userName : <span className="text-[#5F6B66] font-normal italic">Add your name</span>}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5F6B66] group-hover:text-[#1F3D36] group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        ) : (
          /* Name Editing Form */
          <form onSubmit={handleSave} className="p-4 rounded-[14px] bg-[#FCFBF8] border border-[#1F3D36] border-b-[3px] border-r-[3px] border-b-[#0F231F] border-r-[#0F231F] space-y-3 animate-in fade-in duration-150 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D6CBB8]/80 pb-2">
              <div>
                <h3 className="font-display font-bold text-sm text-[#1B2421]">
                  Your name
                </h3>
                <p className="text-[11px] text-[#5F6B66]">
                  This name will appear in your Home greeting.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="p-1 text-[#5F6B66] hover:text-[#1B2421]"
                aria-label="Cancel editing"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B2421] mb-1">
                Your name
              </label>
              <input
                type="text"
                autoFocus
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-11 px-3.5 text-sm font-medium bg-white border border-[#D6CBB8] rounded-[10px] focus:outline-none focus:border-[#1F3D36] text-[#1B2421]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D6CBB8]/80">
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="h-10 px-3.5 text-xs font-semibold text-[#5F6B66] hover:text-[#1B2421] rounded-[8px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-10 px-4.5 text-xs font-semibold text-[#F6F1E5] bg-[#1F3D36] hover:bg-[#102C29] active:scale-95 rounded-[8px] transition-all shadow-2xs paper-button"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* About Info card */}
        <div className="p-3.5 rounded-[12px] bg-[#E9E2D3]/60 border border-[#D6CBB8] text-xs text-[#5F6B66] space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-[#1F3D36]">
            <Compass className="w-4 h-4 text-[#C2571A]" />
            <span>Ministry Organizer · Field Journal</span>
          </div>
          <p className="leading-relaxed">
            Designed as a handcrafted digital field journal for personal ministry records.
          </p>
        </div>
      </div>
    </FloatingCard>
  );
};

