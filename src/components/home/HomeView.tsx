import React, { useMemo } from 'react';
import {
  ChevronRight,
  AlertCircle,
  Clock,
  Calendar,
} from 'lucide-react';
import { Person, Visit, Territory } from '../../types';
import { EditorialDate } from '../common/EditorialDate';
import { TopographicPattern } from '../common/TopographicBackground';
import { ActiveFollowUp } from '../../data/store';

interface HomeViewProps {
  people: Person[];
  visits: Visit[];
  territories: Territory[];
  onSelectPerson: (personId: string) => void;
  onSelectTerritory?: (territoryId: string) => void;
  onOpenAddPerson: () => void;
  onOpenRecordVisit: () => void;
  onNavigateTab: (tab: 'people' | 'territories' | 'schedule' | 'activity') => void;
  onPreviewPerson?: (person: Person) => void;
  userName?: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  people,
  visits,
  territories,
  onSelectPerson,
  onNavigateTab,
  userName = '',
}) => {
  const today = new Date();
  const dayNum = String(today.getDate()).padStart(2, '0');
  const monthFull = today.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const weekdayFull = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const yearStr = today.getFullYear();
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Derive active follow-ups strictly from the LATEST visit for each person
  const { attentionFollowUps, plannedFollowUps } = useMemo(() => {
    const territoryMap = new Map<string, Territory>();
    territories.forEach((t) => territoryMap.set(t.id, t));

    const followUps: ActiveFollowUp[] = [];

    for (const person of people) {
      const personVisits = visits
        .filter((v) => v.personId === person.id)
        .sort(
          (a, b) =>
            new Date(b.visitDate || b.date).getTime() - new Date(a.visitDate || a.date).getTime()
        );

      const latestVisit = personVisits[0];
      if (latestVisit && latestVisit.nextFollowUpDate && latestVisit.nextFollowUpDate.trim()) {
        const terr = territoryMap.get(person.territoryId);
        followUps.push({
          personId: person.id,
          personName: person.name,
          territoryId: person.territoryId,
          territoryName: terr?.name,
          territoryCode: terr?.code,
          date: latestVisit.nextFollowUpDate.trim(),
          topic: latestVisit.nextTopic?.trim() || latestVisit.topic || 'Follow-up discussion',
          visitId: latestVisit.id,
          visitDate: latestVisit.visitDate || latestVisit.date,
        });
      }
    }

    const attention = followUps
      .filter((f) => f.date <= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    const planned = followUps
      .filter((f) => f.date > todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    return { attentionFollowUps: attention, plannedFollowUps: planned };
  }, [people, visits, territories, todayStr]);

  // Recent visits derived from actual Visit records, sorted by visitDate descending
  const recentVisits = useMemo(() => {
    return [...visits]
      .sort((a, b) => new Date(b.visitDate || b.date).getTime() - new Date(a.visitDate || a.date).getTime())
      .slice(0, 6);
  }, [visits]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16">
      {/* 1. TODAY'S DATE: DISTINCTIVE EDITORIAL HOME DATE HERO */}
      <div className="relative bg-[#FCFBF8] border border-[#DCDDD5] rounded-[18px] p-5 sm:p-6 overflow-hidden shadow-2xs select-none">
        <TopographicPattern opacity={0.07} />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Terracotta Accent Bar */}
            <div className="w-1 h-14 bg-[#B87545] rounded-full shrink-0" aria-hidden="true" />

            {/* Space Grotesk Numeral + Stacked Month & Weekday */}
            <div className="flex items-baseline gap-3.5">
              <span className="font-display text-5xl sm:text-6xl font-bold tracking-tight text-[#183A35] leading-none tabular-nums">
                {dayNum}
              </span>

              <div className="flex flex-col justify-center">
                <span className="font-display text-sm sm:text-base font-bold tracking-wider text-[#B87545] uppercase leading-tight">
                  {monthFull}
                </span>
                <span className="text-xs font-semibold tracking-widest text-[#17201E]/80 uppercase mt-0.5 leading-tight">
                  {weekdayFull}
                </span>
              </div>
            </div>
          </div>

          {/* Greeting Area replacing old Journal Metadata & Coordinates */}
          <div className="text-right flex flex-col justify-center min-w-0 max-w-[150px] sm:max-w-[200px]">
            {userName ? (
              <>
                <span className="text-xs font-medium text-[#68716D] tracking-tight">
                  Hello
                </span>
                <span className="font-display text-base sm:text-lg font-bold text-[#183A35] tracking-tight truncate leading-tight">
                  {userName}
                </span>
              </>
            ) : (
              <span className="font-display text-base sm:text-lg font-bold text-[#183A35] tracking-tight leading-tight">
                Hello there
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. TODAY'S ATTENTION: Two Focused Real Data Surfaces */}
      <div className="grid grid-cols-2 gap-3.5">
        <button
          onClick={() => onNavigateTab('schedule')}
          className="text-left p-4 rounded-[14px] bg-[#FCFBF8] border border-[#DCDDD5] hover:border-[#B87545]/60 active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B87545]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#68716D]">
              ATTENTION
            </span>
          </div>
          <div className="font-display text-3xl font-bold tracking-tight text-[#17201E] tabular-nums group-hover:text-[#B87545] transition-colors">
            {attentionFollowUps.length}
          </div>
          <div className="text-xs font-semibold text-[#183A35] mt-0.5">
            Follow-ups due
          </div>
          <div className="text-[11px] text-[#68716D] mt-0.5">
            Overdue & today
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('schedule')}
          className="text-left p-4 rounded-[14px] bg-[#FCFBF8] border border-[#DCDDD5] hover:border-[#B99A62]/60 active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B99A62]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#68716D]">
              PLANNED
            </span>
          </div>
          <div className="font-display text-3xl font-bold tracking-tight text-[#17201E] tabular-nums group-hover:text-[#B99A62] transition-colors">
            {plannedFollowUps.length}
          </div>
          <div className="text-xs font-semibold text-[#183A35] mt-0.5">
            Upcoming visits
          </div>
          <div className="text-[11px] text-[#68716D] mt-0.5">
            Future agenda
          </div>
        </button>
      </div>

      {/* 3. ATTENTION NEEDED: Real overdue and today follow-ups */}
      {attentionFollowUps.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B87545]" />
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#B87545]">
                ATTENTION: OVERDUE & TODAY ({attentionFollowUps.length})
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('schedule')}
              className="text-xs font-semibold text-[#B87545] hover:underline"
            >
              View Agenda
            </button>
          </div>

          <div className="divide-y divide-[#DCDDD5]/70 border-y border-[#DCDDD5]">
            {attentionFollowUps.map((item) => {
              const isOverdue = item.date < todayStr;
              return (
                <div
                  key={`${item.personId}-${item.visitId}`}
                  onClick={() => onSelectPerson(item.personId)}
                  className="py-3 px-2 flex items-start gap-4 cursor-pointer hover:bg-[#FCFBF8] active:bg-[#F5F3ED] transition-colors group"
                >
                  <EditorialDate dateString={item.date} format="column" />
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-sm uppercase tracking-tight text-[#17201E] group-hover:text-[#183A35] truncate min-w-0">
                        {item.personName}
                      </span>
                    </div>
                    {item.territoryName && (
                      <div className="text-[10px] font-mono uppercase font-semibold text-[#68716D] truncate">
                        {item.territoryName}{item.territoryCode ? ` · T${item.territoryCode}` : ''}
                      </div>
                    )}
                    <p className="font-medium text-xs text-[#183A35] line-clamp-1 pt-0.5">
                      "{item.topic}"
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#B87545] font-semibold pt-0.5">
                      {isOverdue ? (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          <span>Overdue follow-up</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-[#B99A62]" />
                          <span className="text-[#183A35]">Due today</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#68716D] group-hover:text-[#183A35] group-hover:translate-x-0.5 transition-transform self-center shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. RECENT CONVERSATIONS: Primary Recent-Activity Content */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#183A35]">
            RECENT CONVERSATIONS
          </div>
        </div>

        {/* Scannable Editorial List with Column Date Markers */}
        {recentVisits.length === 0 ? (
          <div className="bg-[#FCFBF8] border border-dashed border-[#DCDDD5] rounded-[16px] p-8 text-center text-xs text-[#68716D]">
            No conversations logged yet. Use the action button below to record your first field visit.
          </div>
        ) : (
          <div className="divide-y divide-[#DCDDD5]/70 border-y border-[#DCDDD5]">
            {recentVisits.map((visit) => {
              const person = people.find((p) => p.id === visit.personId);
              const terr = person ? territories.find((t) => t.id === person.territoryId) : undefined;
              const dateVal = visit.visitDate || visit.date;
              const details = visit.conversationDetails || visit.conversation;

              return (
                <div
                  key={visit.id}
                  onClick={() => person && onSelectPerson(person.id)}
                  className="py-3.5 px-2 flex items-start gap-4 cursor-pointer hover:bg-[#FCFBF8] active:bg-[#F5F3ED] transition-colors group"
                >
                  {/* Narrow Visual Column Date Marker */}
                  <EditorialDate dateString={dateVal} format="column" />

                  {/* Content */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display font-bold text-sm uppercase tracking-tight text-[#17201E] group-hover:text-[#183A35] truncate">
                        {person ? person.name : 'Unknown Person'}
                      </span>
                      {terr && (
                        <span className="text-[10px] font-mono uppercase font-semibold text-[#68716D] shrink-0">
                          {terr.name}{terr.code ? ` · T${terr.code}` : ''}
                        </span>
                      )}
                    </div>

                    <p className="font-medium text-xs text-[#183A35] line-clamp-1">
                      "{visit.topic}"
                    </p>

                    {details && (
                      <p className="text-xs text-[#68716D] line-clamp-1">
                        {details}
                      </p>
                    )}

                    {visit.nextTopic && (
                      <div className="text-[11px] text-[#B87545] font-medium pt-0.5">
                        Next: {visit.nextTopic}
                      </div>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-[#68716D] group-hover:text-[#183A35] group-hover:translate-x-0.5 transition-transform self-center shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
