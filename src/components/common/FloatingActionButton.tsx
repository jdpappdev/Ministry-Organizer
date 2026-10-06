import React, { useState } from 'react';
import { Plus, UserPlus, BookOpen, Calendar } from 'lucide-react';

interface FABProps {
  onAddPerson: () => void;
  onRecordVisit: () => void;
  onScheduleVisit: () => void;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  onAddPerson,
  onRecordVisit,
  onScheduleVisit,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Backdrop when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#102C29]/30 backdrop-blur-2xs transition-opacity duration-150"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2.5">
        {/* Expanded Quick Options */}
        {isOpen && (
          <div className="flex flex-col items-end gap-2 mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button
              onClick={() => {
                setIsOpen(false);
                onAddPerson();
              }}
              className="flex items-center gap-3 px-4 py-3 bg-[#FCFBF8] border border-[#DCDDD5] text-[#17201E] hover:text-[#183A35] rounded-[14px] shadow-md text-xs font-semibold active:scale-95 transition-all"
            >
              <span>Add Person</span>
              <div className="w-7 h-7 rounded-[8px] bg-[#183A35]/10 text-[#183A35] flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onRecordVisit();
              }}
              className="flex items-center gap-3 px-4 py-3 bg-[#FCFBF8] border border-[#DCDDD5] text-[#17201E] hover:text-[#183A35] rounded-[14px] shadow-md text-xs font-semibold active:scale-95 transition-all"
            >
              <span>Record Visit</span>
              <div className="w-7 h-7 rounded-[8px] bg-[#B87545]/15 text-[#B87545] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onScheduleVisit();
              }}
              className="flex items-center gap-3 px-4 py-3 bg-[#FCFBF8] border border-[#DCDDD5] text-[#17201E] hover:text-[#183A35] rounded-[14px] shadow-md text-xs font-semibold active:scale-95 transition-all"
            >
              <span>Schedule Visit</span>
              <div className="w-7 h-7 rounded-[8px] bg-[#B99A62]/20 text-[#6B5528] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {/* Primary FAB Button (54px diameter, 18px soft radius, Deep Forest) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-[54px] h-[54px] rounded-[16px] flex items-center justify-center text-white shadow-md active:scale-95 transition-all duration-200 ${
            isOpen ? 'bg-[#102C29] rotate-45' : 'bg-[#183A35] hover:bg-[#102C29]'
          }`}
          aria-label={isOpen ? 'Close actions menu' : 'Quick mobile actions'}
          aria-expanded={isOpen}
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </>
  );
};
