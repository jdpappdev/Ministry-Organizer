import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Person, Territory, Visit } from '../../types';
import { BottomSheet } from '../common/BottomSheet';
import { InitialsAvatar } from '../common/InitialsAvatar';

interface PersonPreviewSheetProps {
  person: Person | null;
  territory?: Territory;
  latestVisit?: Visit;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (personId: string) => void;
  onRecordVisit?: (personId: string) => void;
}

export const PersonPreviewSheet: React.FC<PersonPreviewSheetProps> = ({
  person,
  territory,
  latestVisit,
  isOpen,
  onClose,
  onViewProfile,
}) => {
  if (!person) return null;

  // Format last visit date string (e.g., "visited Oct 5")
  const visitDateStr = latestVisit
    ? `visited ${new Date(latestVisit.visitDate || latestVisit.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })}`
    : 'No visits yet';

  const territoryInfo = territory?.name || 'Unassigned';

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        {/* Header: [small avatar/initial] Maria Santos / San Isidro · visited Oct 5 */}
        <div className="flex items-center gap-3">
          <InitialsAvatar name={person.name} size="sm" />
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-base text-[#17201E] truncate">
              {person.name}
            </h3>
            <p className="text-xs text-[#68716D] truncate">
              {territoryInfo} · {visitDateStr}
            </p>
          </div>
        </div>

        {/* Peek Body: Typography & Whitespace (No nested cards) */}
        {latestVisit && (
          <div className="space-y-2 pt-1 border-t border-[#DCDDD5]/60">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#68716D]">
                Last topic
              </div>
              <div className="text-xs font-semibold text-[#183A35] line-clamp-1 mt-0.5">
                "{latestVisit.topic}"
              </div>
            </div>

            {latestVisit.nextTopic && (
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#68716D]">
                  Next
                </div>
                <div className="text-xs font-semibold text-[#B87545] line-clamp-1 mt-0.5">
                  {latestVisit.nextTopic}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Primary Action: View person → */}
        <div className="pt-2">
          <button
            onClick={() => {
              onClose();
              onViewProfile(person.id);
            }}
            className="w-full h-11 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#183A35] hover:bg-[#102C29] active:scale-[0.98] rounded-xl transition-all shadow-xs"
          >
            <span>View person</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
