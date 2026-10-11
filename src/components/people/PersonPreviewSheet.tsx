import React from 'react';
import { ArrowRight, User } from 'lucide-react';
import { Person, Territory, Visit } from '../../types';
import { FloatingCard } from '../common/FloatingCard';
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

  const territoryInfo = territory?.name ? `${territory.name}${territory.code ? ` (T${territory.code})` : ''}` : 'Unassigned';

  return (
    <FloatingCard
      isOpen={isOpen}
      onClose={onClose}
      title="Person Preview"
      subtitle="Field journal record"
      icon={<User className="w-4 h-4 text-[#C9A978]" />}
      maxWidthClass="max-w-sm"
    >
      <div className="space-y-4">
        {/* Person identification card */}
        <div className="flex items-center gap-3.5 p-3 rounded-[14px] bg-[#FCFBF8] border border-[#D6CBB8] shadow-2xs">
          <InitialsAvatar name={person.name} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-bold text-lg text-[#1B2421] truncate">
              {person.name}
            </h3>
            <p className="text-xs text-[#5F6B66] truncate font-medium">
              {territoryInfo} · {visitDateStr}
            </p>
          </div>
        </div>

        {/* Peek Body: Details on paper card strip */}
        {latestVisit && (
          <div className="space-y-2.5 p-3.5 rounded-[12px] bg-[#E9E2D3]/50 border border-[#D6CBB8]">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5F6B66]">
                Last topic
              </div>
              <div className="text-xs font-semibold text-[#1F3D36] line-clamp-2 mt-0.5">
                "{latestVisit.topic}"
              </div>
            </div>

            {latestVisit.nextTopic && (
              <div className="pt-2 border-t border-[#D6CBB8]/80">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C2571A]">
                  Next topic
                </div>
                <div className="text-xs font-semibold text-[#C2571A] line-clamp-2 mt-0.5">
                  {latestVisit.nextTopic}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Primary Action: View person → */}
        <div className="pt-1">
          <button
            onClick={() => {
              onClose();
              onViewProfile(person.id);
            }}
            className="w-full h-11 flex items-center justify-center gap-2 text-xs font-semibold text-[#F6F1E5] bg-[#1F3D36] hover:bg-[#102C29] active:scale-[0.98] rounded-[12px] transition-all shadow-xs paper-button"
          >
            <span>View person</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </FloatingCard>
  );
};

