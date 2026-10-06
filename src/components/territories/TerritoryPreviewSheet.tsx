import React from 'react';
import { ArrowRight, Map } from 'lucide-react';
import { Territory } from '../../types';
import { BottomSheet } from '../common/BottomSheet';

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
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        {/* Header: San Isidro / 12 people · 8 mapped */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#183A35]/10 flex items-center justify-center text-[#183A35] shrink-0">
            <Map className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-base text-[#17201E] truncate">
              {territory.name} {territory.code ? `(T${territory.code})` : ''}
            </h3>
            <p className="text-xs text-[#68716D] truncate">
              {peopleCount} {peopleCount === 1 ? 'person' : 'people'} · {mappedCount} mapped
            </p>
          </div>
        </div>

        {/* Peek Description */}
        {descriptionExcerpt && (
          <div className="pt-1 border-t border-[#DCDDD5]/60">
            <p className="text-xs text-[#68716D] line-clamp-2 leading-relaxed">
              {descriptionExcerpt}
            </p>
          </div>
        )}

        {/* Primary Action: Open territory → */}
        <div className="pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenTerritory(territory.id);
            }}
            className="w-full h-11 flex items-center justify-center gap-2 text-xs font-semibold text-white bg-[#183A35] hover:bg-[#102C29] active:scale-[0.98] rounded-[12px] transition-all shadow-xs"
          >
            <span>Open Territory Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
