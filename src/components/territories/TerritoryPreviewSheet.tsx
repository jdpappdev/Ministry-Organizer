import React from 'react';
import { ArrowRight, Map } from 'lucide-react';
import { Territory } from '../../types';
import { FloatingCard } from '../common/FloatingCard';

interface TerritoryPreviewSheetProps {
  territory: Territory | null;
  peopleCount: number;
  mappedCount?: number;
  isOpen: boolean;
  onClose: () => void;
  onOpenTerritory: (territoryId: string) => void;
}

export const TerritoryPreviewSheet: React.FC<TerritoryPreviewSheetProps> = ({
  territory,
  peopleCount,
  mappedCount = 0,
  isOpen,
  onClose,
  onOpenTerritory,
}) => {
  if (!territory) return null;

  const descriptionExcerpt = territory.boundaryNotes || territory.description || 'Sector territory';

  return (
    <FloatingCard
      isOpen={isOpen}
      onClose={onClose}
      title="Territory Preview"
      subtitle="Geographic field sector"
      icon={<Map className="w-4 h-4 text-[#C9A978]" />}
      maxWidthClass="max-w-sm"
    >
      <div className="space-y-4">
        {/* Header: San Isidro / 12 people · 8 mapped */}
        <div className="flex items-center gap-3.5 p-3 rounded-[14px] bg-[#FCFBF8] border border-[#D6CBB8] shadow-2xs">
          <div className="w-10 h-10 rounded-[10px] bg-[#1F3D36]/10 flex items-center justify-center text-[#1F3D36] shrink-0 border border-[#1F3D36]/15">
            <Map className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-lg text-[#1B2421] truncate">
              {territory.name} {territory.code ? `(T${territory.code})` : ''}
            </h3>
            <p className="text-xs text-[#5F6B66] truncate font-medium">
              {peopleCount} {peopleCount === 1 ? 'person' : 'people'} · {mappedCount} mapped
            </p>
          </div>
        </div>

        {/* Peek Description */}
        {descriptionExcerpt && (
          <div className="p-3.5 rounded-[12px] bg-[#E9E2D3]/50 border border-[#D6CBB8]">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5F6B66] mb-1">
              Boundary notes
            </div>
            <p className="text-xs text-[#1B2421]/90 line-clamp-3 leading-relaxed">
              {descriptionExcerpt}
            </p>
          </div>
        )}

        {/* Primary Action: Open territory → */}
        <div className="pt-1">
          <button
            onClick={() => {
              onClose();
              onOpenTerritory(territory.id);
            }}
            className="w-full h-11 flex items-center justify-center gap-2 text-xs font-semibold text-[#F6F1E5] bg-[#1F3D36] hover:bg-[#102C29] active:scale-[0.98] rounded-[12px] transition-all shadow-xs paper-button"
          >
            <span>Open Territory Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </FloatingCard>
  );
};

