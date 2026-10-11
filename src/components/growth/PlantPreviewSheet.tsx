import React from 'react';
import { User, MapPin, Calendar, Clock, BookOpen, ChevronRight, Sprout } from 'lucide-react';
import { PersonPlantData } from '../../utils/growthUtils';
import { Territory } from '../../types';
import { BotanicalPlantGlyph } from './BotanicalPlantGlyph';
import { EditorialDate } from '../common/EditorialDate';
import { FloatingCard } from '../common/FloatingCard';

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
  if (!plantData) return null;

  const { person, stage, stageLabel, health, healthLabel, healthReason, visitsCount, latestVisit } = plantData;

  const healthBgMap = {
    healthy: 'bg-[#1F3D36]/10 text-[#1F3D36] border-[#1F3D36]/20',
    needs_care: 'bg-[#C2571A]/15 text-[#C2571A] border-[#C2571A]/30',
    wilting: 'bg-[#C9A978]/20 text-[#6B5528] border-[#C9A978]/40',
    fading: 'bg-[#5F6B66]/15 text-[#4D5552] border-[#5F6B66]/30',
  };

  return (
    <FloatingCard
      isOpen={isOpen}
      onClose={onClose}
      title="Botanical Specimen"
      subtitle={`${stageLabel} stage · ${visitsCount} ${visitsCount === 1 ? 'visit' : 'visits'}`}
      icon={<Sprout className="w-4 h-4 text-[#C9A978]" />}
      maxWidthClass="max-w-md"
    >
      <div className="space-y-4">
        {/* Hero Card with Botanical Glyph */}
        <div className="flex items-center gap-4 bg-[#E9E2D3]/50 border border-[#D6CBB8] rounded-[14px] p-4">
          <div className="w-16 h-16 bg-[#FCFBF8] border border-[#D6CBB8] rounded-[12px] flex items-center justify-center shrink-0 shadow-2xs">
            <BotanicalPlantGlyph stage={stage} health={health} size="lg" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-lg text-[#1B2421] truncate">
              {person.name}
            </h2>

            <div className="text-xs text-[#5F6B66] flex items-center gap-2 mt-0.5">
              <span className="font-semibold text-[#1F3D36]">{stageLabel} Stage</span>
              <span>·</span>
              <span>{visitsCount} {visitsCount === 1 ? 'visit' : 'visits'} recorded</span>
            </div>

            {/* Health Pill */}
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${healthBgMap[health]}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{healthLabel}</span>
              </span>
              <span className="text-[11px] text-[#5F6B66] truncate">
                {healthReason}
              </span>
            </div>
          </div>
        </div>

        {/* Meta Context */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white border border-[#D6CBB8] rounded-[12px] space-y-1">
            <div className="text-[10px] font-mono text-[#5F6B66] uppercase font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#C2571A]" />
              <span>Last Contact</span>
            </div>
            <div>
              {latestVisit ? (
                <EditorialDate dateString={latestVisit.visitDate || latestVisit.date} format="horizontal" showYear={false} />
              ) : (
                <span className="text-[#5F6B66] italic">No visits yet</span>
              )}
            </div>
          </div>

          <div className="p-3 bg-white border border-[#D6CBB8] rounded-[12px] space-y-1">
            <div className="text-[10px] font-mono text-[#5F6B66] uppercase font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#1F3D36]" />
              <span>Next Follow-Up</span>
            </div>
            <div>
              {latestVisit?.nextFollowUpDate ? (
                <EditorialDate dateString={latestVisit.nextFollowUpDate} format="horizontal" showYear={false} />
              ) : (
                <span className="text-[#5F6B66] italic">None scheduled</span>
              )}
            </div>
          </div>
        </div>

        {/* Territory & Address */}
        {(territory || person.address) && (
          <div className="p-3 bg-white border border-[#D6CBB8] rounded-[12px] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#C2571A] shrink-0" />
              <span className="truncate text-[#1B2421]">
                {territory ? `${territory.name}${person.address ? ` · ${person.address}` : ''}` : person.address}
              </span>
            </div>
            {territory?.code && (
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E9E2D3] text-[#1F3D36] shrink-0">
                T{territory.code}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-1 flex items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onViewProfile(person.id);
            }}
            className="flex-1 h-11 flex items-center justify-center gap-2 text-xs font-semibold text-[#F6F1E5] bg-[#1F3D36] hover:bg-[#102C29] active:scale-[0.98] rounded-[12px] transition-all shadow-xs paper-button"
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
              className="px-4 h-11 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1F3D36] bg-white border border-[#D6CBB8] hover:border-[#1F3D36] active:scale-[0.98] rounded-[12px] transition-all shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C2571A]" />
              <span>Record Visit</span>
            </button>
          )}
        </div>
      </div>
    </FloatingCard>
  );
};
