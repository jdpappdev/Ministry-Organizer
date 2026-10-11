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
        className="relative w-full max-w-xs sm:max-w-sm bg-[#FCFBF8] border border-[#D6CBB8] rounded-[20px] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 floating-paper-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D6CBB8]/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#1F3D36] text-[#F6F1E5] flex items-center justify-center shrink-0 shadow-2xs border border-[#1F3D36]/15">
              <Calendar className="w-4 h-4 text-[#C9A978]" />
            </div>
            <h3 id="reschedule-modal-title" className="font-display font-bold text-base text-[#1B2421]">
              Reschedule follow-up
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#5F6B66] hover:text-[#1B2421] hover:bg-[#E9E2D3] rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 p-3 rounded-[12px] bg-[#E9E2D3]/50 border border-[#D6CBB8]">
            <div className="text-xs font-semibold text-[#1B2421] uppercase font-display tracking-tight">
              {personName}
            </div>
            <p className="text-xs text-[#5F6B66]">
              Currently scheduled: <span className="font-semibold text-[#1F3D36]">{formattedCurrentDate}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1B2421] mb-1">
              Select new follow-up date:
            </label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full h-11 px-3.5 text-xs font-medium bg-white border border-[#D6CBB8] rounded-[10px] focus:outline-none focus:border-[#1F3D36] text-[#1B2421]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D6CBB8]/80">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 text-xs font-semibold text-[#5F6B66] hover:text-[#1B2421] rounded-[10px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 text-xs font-semibold text-[#F6F1E5] bg-[#1F3D36] hover:bg-[#102C29] active:scale-95 rounded-[10px] transition-all shadow-xs paper-button"
            >
              Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
