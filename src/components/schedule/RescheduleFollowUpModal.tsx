import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { getLocalDateKey, formatLocalDateKey } from '../../utils/dateUtils';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface RescheduleFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  currentDate?: string;
  visitId: string;
  onSave: (visitId: string, newDate: string) => void;
}

export const RescheduleFollowUpModal: React.FC<RescheduleFollowUpModalProps> = ({
  isOpen,
  onClose,
  personName,
  currentDate = '',
  visitId,
  onSave,
}) => {
  const [newDate, setNewDate] = useState(currentDate || getLocalDateKey());

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setNewDate(currentDate || getLocalDateKey());
    }
  }, [isOpen, currentDate]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formattedCurrentDate = currentDate
    ? formatLocalDateKey(currentDate)
    : 'Not set';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;
    onSave(visitId, newDate);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#102C29]/40 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reschedule-modal-title"
    >
      <div
        className="relative w-full max-w-xs sm:max-w-sm bg-[#FCFBF8] border border-[#DCDDD5] rounded-[18px] p-5 shadow-xl space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCDDD5]/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#183A35] flex items-center justify-center text-white shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <h3 id="reschedule-modal-title" className="font-display font-bold text-base text-[#17201E]">
              Reschedule follow-up
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#68716D] hover:text-[#17201E] rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#17201E] uppercase font-display tracking-tight">
              {personName}
            </div>
            <p className="text-xs text-[#68716D]">
              Currently: <span className="font-semibold text-[#183A35]">{formattedCurrentDate}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17201E] mb-1">
              New date:
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full h-11 px-3.5 text-xs font-medium bg-white border border-[#DCDDD5] rounded-[10px] focus:outline-none focus:border-[#183A35]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#DCDDD5]/60">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 text-xs font-semibold text-[#68716D] hover:text-[#17201E] rounded-[10px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 text-xs font-semibold text-white bg-[#183A35] hover:bg-[#102C29] active:scale-95 rounded-[10px] transition-all shadow-xs"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
