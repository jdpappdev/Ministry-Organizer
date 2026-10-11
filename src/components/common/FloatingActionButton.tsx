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
          className="fixed inset-0 z-40 bg-[#1B2421]/45 transition-opacity duration-150"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2.5">
        {/* Expanded Quick Options */}
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-1 animate-floating-card">
            <button
              onClick={() => {
                setIsOpen(false);
                onAddPerson();
              }}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E6E0D2] text-[#1B2421] hover:text-[#1F3D36] rounded-[16px] shadow-[0_1px_2px_rgba(27,36,33,0.06),0_6px_16px_rgba(27,36,33,0.08)] text-xs font-semibold active:scale-[0.985] transition-all cursor-pointer"
            >
              <span>Add Person</span>
              <div className="w-8 h-8 rounded-xl bg-[#1F3D36]/10 text-[#1F3D36] flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onRecordVisit();
              }}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E6E0D2] text-[#1B2421] hover:text-[#1F3D36] rounded-[16px] shadow-[0_1px_2px_rgba(27,36,33,0.06),0_6px_16px_rgba(27,36,33,0.08)] text-xs font-semibold active:scale-[0.985] transition-all cursor-pointer"
            >
              <span>Record Visit</span>
              <div className="w-8 h-8 rounded-xl bg-[#1F3D36]/10 text-[#1F3D36] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onScheduleVisit();
              }}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E6E0D2] text-[#1B2421] hover:text-[#1F3D36] rounded-[16px] shadow-[0_1px_2px_rgba(27,36,33,0.06),0_6px_16px_rgba(27,36,33,0.08)] text-xs font-semibold active:scale-[0.985] transition-all cursor-pointer"
            >
              <span>Schedule Visit</span>
              <div className="w-8 h-8 rounded-xl bg-[#1F3D36]/10 text-[#1F3D36] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {/* Primary FAB Button (56px diameter, 16px radius, Tactile shadow) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-[16px] flex items-center justify-center text-white cursor-pointer select-none transition-all duration-150 ${
            isOpen
              ? 'bg-[#142823] rotate-45 shadow-[0_1px_0_#0D1B17]'
              : 'bg-[#1F3D36] shadow-[0_3px_0_#142823,0_8px_24px_rgba(27,36,33,0.18)] active:translate-y-[2px] active:shadow-[0_1px_0_#142823]'
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
