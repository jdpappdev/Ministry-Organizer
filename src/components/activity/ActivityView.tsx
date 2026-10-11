import React from 'react';
import {
  ChevronRight,
} from 'lucide-react';
import { ActivityItem } from '../../types';
import { EditorialDate } from '../common/EditorialDate';

interface ActivityViewProps {
  activities: ActivityItem[];
  onSelectPerson: (personId: string) => void;
  onSelectTerritory: (territoryId: string) => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  activities,
  onSelectPerson,
  onSelectTerritory,
}) => {
  const getBadge = (type: ActivityItem['type']) => {
    switch (type) {
      case 'visit_logged':
        return { label: 'VISIT RECORDED', color: 'pill-neutral-forest' };
      case 'person_added':
        return { label: 'PERSON ADDED', color: 'pill-neutral-sage' };
      case 'schedule_created':
        return { label: 'FOLLOW-UP PLANNED', color: 'pill-neutral-sage' };
      case 'territory_created':
        return { label: 'TERRITORY CREATED', color: 'pill-neutral-forest' };
      default:
        return { label: 'LOG ENTRY', color: 'pill-neutral-sage' };
    }
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-20">
      {/* Editorial Header */}
      <div className="border-b border-[#E6E0D2] pb-4 pt-1">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1B2421]">
          Activity Chronicle
        </h1>
        <p className="text-xs font-medium text-[#5F6B66] mt-0.5">
          Chronological audit trail of conversations, records, and plans
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E6E0D2] rounded-[16px] p-10 text-center text-xs text-[#5F6B66]">
          No recorded activity in the field journal yet.
        </div>
      ) : (
        <div className="space-y-3.5">
          {activities.map((act) => {
            const badge = getBadge(act.type);
            const timeFormatted = new Date(act.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={act.id}
                className="list-card p-4 flex items-start gap-4 group select-none"
              >
                {/* Narrow Visual Column Date Marker */}
                <EditorialDate dateString={act.timestamp} format="column" />

                {/* Content */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={badge.color}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-mono text-[#5F6B66]">
                      {timeFormatted}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-bold text-base text-[#1B2421]">
                      {act.personName || act.territoryName || act.title}
                    </span>
                    {act.territoryName && act.personName && (
                      <span className="text-xs text-[#5F6B66]">
                        · {act.territoryName}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#1B2421]/90 leading-relaxed line-clamp-2">
                    {act.description}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs">
                    {act.personId && (
                      <button
                        onClick={() => onSelectPerson(act.personId!)}
                        className="font-semibold text-[#1F3D36] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Individual</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {act.territoryId && !act.personId && (
                      <button
                        onClick={() => onSelectTerritory(act.territoryId!)}
                        className="font-semibold text-[#1F3D36] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Territory</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
