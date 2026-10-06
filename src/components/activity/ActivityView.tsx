import React from 'react';
import {
  Clock,
  BookOpen,
  UserPlus,
  Calendar,
  Map,
  ArrowRight,
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
        return { label: 'VISIT RECORDED', color: 'text-[#183A35] bg-[#183A35]/10' };
      case 'person_added':
        return { label: 'PERSON ADDED', color: 'text-[#B87545] bg-[#B87545]/12' };
      case 'schedule_created':
        return { label: 'FOLLOW-UP PLANNED', color: 'text-[#6B5528] bg-[#B99A62]/18' };
      case 'territory_created':
        return { label: 'TERRITORY CREATED', color: 'text-[#183A35] bg-[#DDE7E1]/70' };
      default:
        return { label: 'LOG ENTRY', color: 'text-[#68716D] bg-[#F5F3ED]' };
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      {/* Editorial Header */}
      <div className="border-b border-[#DCDDD5] pb-4 pt-1">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#17201E]">
          Activity Chronicle
        </h1>
        <p className="text-xs font-medium text-[#68716D] mt-0.5">
          Chronological audit trail of conversations, records, and plans
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="bg-[#FCFBF8] border border-dashed border-[#DCDDD5] rounded-[16px] p-10 text-center text-xs text-[#68716D]">
          No recorded activity in the field journal yet.
        </div>
      ) : (
        <div className="divide-y divide-[#DCDDD5]/70 border-y border-[#DCDDD5]">
          {activities.map((act) => {
            const badge = getBadge(act.type);
            const timeFormatted = new Date(act.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={act.id}
                className="py-4 px-2 flex items-start gap-4 hover:bg-[#FCFBF8] transition-colors group"
              >
                {/* Narrow Visual Column Date Marker */}
                <EditorialDate dateString={act.timestamp} format="column" />

                {/* Content */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-mono text-[#68716D]">
                      {timeFormatted}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-bold text-sm uppercase tracking-tight text-[#17201E]">
                      {act.personName || act.territoryName || act.title}
                    </span>
                    {act.territoryName && act.personName && (
                      <span className="text-xs text-[#68716D]">
                        · {act.territoryName}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#17201E]/80 leading-relaxed line-clamp-2">
                    {act.description}
                  </p>

                  <div className="flex items-center gap-3 pt-0.5 text-xs">
                    {act.personId && (
                      <button
                        onClick={() => onSelectPerson(act.personId!)}
                        className="font-semibold text-[#183A35] hover:underline flex items-center gap-1"
                      >
                        <span>View Individual</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {act.territoryId && !act.personId && (
                      <button
                        onClick={() => onSelectTerritory(act.territoryId!)}
                        className="font-semibold text-[#B87545] hover:underline flex items-center gap-1"
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
