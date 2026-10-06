import React, { useEffect } from 'react';
import { X, User, MapPin, Calendar, Clock, BookOpen, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { PersonPlantData } from '../../utils/growthUtils';
import { Territory } from '../../types';
import { BotanicalPlantGlyph } from './BotanicalPlantGlyph';
import { EditorialDate } from '../common/EditorialDate';
import { InitialsAvatar } from '../common/InitialsAvatar';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface PlantPreviewSheetProps {
  plantData: PersonPlantData | null;
  territory?: Territory;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (personId: string) => void;
  onRecordVisit?: (personId: string) => void;
}

export const PlantPreviewSheet: React.FC<PlantPreviewSheetProps> = ({
  plantData,
  territory,
  isOpen,
  onClose,
  onViewProfile,
  onRecordVisit,
}) => {
  useBodyScrollLock(isOpen);

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

  if (!isOpen || !plantData) return null;

  const { person, stage, stageLabel, stageDescription, health, healthLabel, healthReason, visitsCount, latestVisit } = plantData;

  const healthBgMap = {
    healthy: 'bg-[#183A35]/10 text-[#183A35] border-[#183A35]/20',
    needs_care: 'bg-[#B87545]/15 text-[#B87545] border-[#B87545]/30',
    wilting: 'bg-[#B99A62]/20 text-[#6B5528] border-[#B99A62]/40',
    fading: 'bg-[#68716D]/15 text-[#4D5552] border-[#68716D]/30',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#102C29]/40 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="plant-preview-title"
    >
      <div
        className="relative w-full max-w-lg bg-[#FCFBF8] border border-[#DCDDD5] rounded-t-[24px] sm:rounded-[20px] shadow-2xl p-5 sm:p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle / Close */}
        <div className="flex items-center justify-between border-b border-[#DCDDD5]/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#B87545] uppercase">
              BOTANICAL SPECIMEN · {stageLabel}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#68716D] hover:text-[#17201E] active:bg-[#F5F3ED] rounded-lg transition-colors"
            aria-label="Close plant preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hero Card with Botanical Glyph */}
        <div className="flex items-center gap-4 bg-[#F5F3ED] border border-[#DCDDD5] rounded-[16px] p-4">
          <div className="w-16 h-16 bg-[#FCFBF8] border border-[#DCDDD5] rounded-[14px] flex items-center justify-center shrink-0 shadow-2xs">
            <BotanicalPlantGlyph stage={stage} health={health} size="lg" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 id="plant-preview-title" className="font-display font-bold text-lg text-[#17201E] truncate">
                {person.name}
              </h2>
            </div>

            <div className="text-xs text-[#68716D] flex items-center gap-2 mt-0.5">
              <span className="font-semibold text-[#183A35]">{stageLabel} Stage</span>
              <span>·</span>
              <span>{visitsCount} {visitsCount === 1 ? 'visit' : 'visits'} recorded</span>
            </div>

            {/* Health Pill */}
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${healthBgMap[health]}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{healthLabel}</span>
              </span>
              <span className="text-[11px] text-[#68716D] truncate">
                {healthReason}
              </span>
            </div>
          </div>
        </div>

        {/* Meta Context */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white border border-[#DCDDD5] rounded-[12px] space-y-1">
            <div className="text-[10px] font-mono text-[#68716D] uppercase font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#B87545]" />
              <span>Last Contact</span>
            </div>
            <div>
              {latestVisit ? (
                <EditorialDate dateString={latestVisit.visitDate || latestVisit.date} format="horizontal" showYear={false} />
              ) : (
                <span className="text-[#68716D] italic">No visits yet</span>
              )}
            </div>
          </div>

          <div className="p-3 bg-white border border-[#DCDDD5] rounded-[12px] space-y-1">
            <div className="text-[10px] font-mono text-[#68716D] uppercase font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#183A35]" />
              <span>Next Follow-Up</span>
            </div>
            <div>
              {latestVisit?.nextFollowUpDate ? (
                <EditorialDate dateString={latestVisit.nextFollowUpDate} format="horizontal" showYear={false} />
              ) : (
                <span className="text-[#68716D] italic">None scheduled</span>
              )}
            </div>
          </div>
        </div>

        {/* Territory & Address */}
        {(territory || person.address) && (
          <div className="p-3 bg-white border border-[#DCDDD5] rounded-[12px] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#B87545] shrink-0" />
              <span className="truncate text-[#17201E]">
                {territory ? `${territory.name}${person.address ? ` · ${person.address}` : ''}` : person.address}
              </span>
            </div>
            {territory?.code && (
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F5F3ED] text-[#183A35] shrink-0">
                T{territory.code}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onViewProfile(person.id);
            }}
            className="flex-1 h-11 flex items-center justify-center gap-2 text-xs font-semibold text-white bg-[#183A35] hover:bg-[#102C29] active:scale-[0.98] rounded-[12px] transition-all shadow-xs"
          >
            <User className="w-4 h-4" />
            <span>View Person Profile</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-70" />
          </button>

          {onRecordVisit && (
            <button
              onClick={() => {
                onClose();
                onRecordVisit(person.id);
              }}
              className="px-4 h-11 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#183A35] bg-white border border-[#DCDDD5] hover:border-[#183A35] active:scale-[0.98] rounded-[12px] transition-all shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#B87545]" />
              <span>Record Visit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
