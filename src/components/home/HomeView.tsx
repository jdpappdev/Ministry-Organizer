import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronRight,
  AlertCircle,
  Clock,
  RotateCw,
} from 'lucide-react';
import { Person, Visit, Territory } from '../../types';
import { EditorialDate } from '../common/EditorialDate';
import { TopographicPattern } from '../common/TopographicBackground';
import { InitialsAvatar } from '../common/InitialsAvatar';
import { StatusIndicator } from '../common/StatusIndicator';
import { ActiveFollowUp } from '../../data/store';
import { RescheduleFollowUpModal } from '../schedule/RescheduleFollowUpModal';
import { getLocalDateKey, parseLocalDateKey } from '../../utils/dateUtils';

function formatVisitedDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    const monthShort = date.toLocaleDateString('en-US', { month: 'short' });
    return `${monthShort} ${day}`;
  } catch (_) {
    return dateStr;
  }
}

interface HomeViewProps {
  people: Person[];
  visits: Visit[];
  territories: Territory[];
  onSelectPerson: (personId: string) => void;
  onSelectTerritory?: (territoryId: string) => void;
  onOpenAddPerson: () => void;
  onOpenRecordVisit: () => void;
  onNavigateTab: (tab: 'people' | 'territories' | 'growth' | 'activity') => void;
  onPreviewPerson?: (person: Person) => void;
  userName?: string;
  onUpdateVisit?: (id: string, updates: Partial<Visit>) => void;
}

type FilterCategory = 'all' | 'today' | 'overdue' | 'upcoming' | 'date';

interface WeekData {
  id: string;
  days: {
    dateStr: string;
    dayName: string;
    dayNum: number;
    dateObj: Date;
  }[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  people,
  visits,
  territories,
  onSelectPerson,
  userName = '',
  onUpdateVisit,
}) => {
  const today = new Date();
  const dayNum = String(today.getDate()).padStart(2, '0');
  const monthFull = today.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  const weekdayFull = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const todayStr = useMemo(() => getLocalDateKey(), []);

  // Filter & Navigation states
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [selectedRescheduleItem, setSelectedRescheduleItem] = useState<ActiveFollowUp | null>(null);

  // Infinite weeks list state
  const [weeks, setWeeks] = useState<WeekData[]>(() => {
    const base = parseLocalDateKey(todayStr);
    const dayOfWeek = base.getDay();
    const sundayOfCurrentWeek = new Date(base);
    sundayOfCurrentWeek.setDate(base.getDate() - dayOfWeek);

    const initialWeeks: WeekData[] = [];
    for (let offset = -20; offset <= 20; offset++) {
      const weekStart = new Date(sundayOfCurrentWeek);
      weekStart.setDate(sundayOfCurrentWeek.getDate() + offset * 7);

      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const dateStr = getLocalDateKey(d);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNumVal = d.getDate();
        days.push({ dateStr, dayName, dayNum: dayNumVal, dateObj: d });
      }
      initialWeeks.push({ id: `week-${offset}`, days });
    }
    return initialWeeks;
  });

  const [isMonthFading, setIsMonthFading] = useState<boolean>(false);
  const [displayedMonthYear, setDisplayedMonthYear] = useState<string>(() => {
    const d = parseLocalDateKey(todayStr);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialScrollDone = useRef<boolean>(false);

  // When selectedDate changes, ensure the month matches the selected day if week spans months
  useEffect(() => {
    const d = parseLocalDateKey(selectedDate);
    const newMonthYear = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (newMonthYear !== displayedMonthYear) {
      setIsMonthFading(true);
      setTimeout(() => {
        setDisplayedMonthYear(newMonthYear);
        setIsMonthFading(false);
      }, 150);
    }
  }, [selectedDate, displayedMonthYear]);

  // Scroll to current week on mount without animation
  useEffect(() => {
    if (containerRef.current && !isInitialScrollDone.current) {
      const middleIndex = Math.floor(weeks.length / 2);
      const child = containerRef.current.children[middleIndex] as HTMLElement;
      if (child) {
        containerRef.current.scrollLeft = child.offsetLeft;
        isInitialScrollDone.current = true;
      }
    }
  }, [weeks.length]);

  // Derive active follow-ups strictly from the LATEST visit for each person (all territories)
  const activeFollowUps = useMemo(() => {
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

    return followUps;
  }, [people, visits, territories]);

  const scheduledDatesSet = useMemo(() => {
    const set = new Set<string>();
    activeFollowUps.forEach((f) => set.add(f.date));
    return set;
  }, [activeFollowUps]);

  const overdue = useMemo(
    () => activeFollowUps.filter((f) => f.date < todayStr).sort((a, b) => a.date.localeCompare(b.date)),
    [activeFollowUps, todayStr]
  );

  const todayList = useMemo(
    () => activeFollowUps.filter((f) => f.date === todayStr),
    [activeFollowUps, todayStr]
  );

  const upcoming = useMemo(
    () => activeFollowUps.filter((f) => f.date > todayStr).sort((a, b) => a.date.localeCompare(b.date)),
    [activeFollowUps, todayStr]
  );

  const selectedDateList = useMemo(
    () => activeFollowUps.filter((f) => f.date === selectedDate),
    [activeFollowUps, selectedDate]
  );

  // Handle scroll detection to update month/year label with 150ms fade
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;

    const children = Array.from(container.children) as HTMLElement[];
    let closestIndex = 0;
    let minDiff = Infinity;

    children.forEach((child, idx) => {
      const diff = Math.abs(child.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    const activeWeek = weeks[closestIndex];
    if (activeWeek && activeWeek.days[3]) {
      const midDate = activeWeek.days[3].dateObj;
      const newLabel = midDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (newLabel !== displayedMonthYear) {
        setIsMonthFading(true);
        setTimeout(() => {
          setDisplayedMonthYear(newLabel);
          setIsMonthFading(false);
        }, 150);
      }
    }

    // Infinite scroll prepend/append check
    if (closestIndex <= 2) {
      setWeeks((prev) => {
        const firstWeekStart = prev[0].days[0].dateObj;
        const newWeeks: WeekData[] = [];
        for (let i = 10; i >= 1; i--) {
          const wStart = new Date(firstWeekStart);
          wStart.setDate(firstWeekStart.getDate() - i * 7);
          const days = [];
          for (let dIdx = 0; dIdx < 7; dIdx++) {
            const d = new Date(wStart);
            d.setDate(wStart.getDate() + dIdx);
            days.push({
              dateStr: getLocalDateKey(d),
              dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
              dayNum: d.getDate(),
              dateObj: d,
            });
          }
          newWeeks.push({ id: `prep-${wStart.getTime()}`, days });
        }
        const addedWidth = newWeeks.length * container.clientWidth;
        container.scrollLeft += addedWidth;
        return [...newWeeks, ...prev];
      });
    } else if (closestIndex >= weeks.length - 3) {
      setWeeks((prev) => {
        const lastWeekStart = prev[prev.length - 1].days[0].dateObj;
        const newWeeks: WeekData[] = [];
        for (let i = 1; i <= 10; i++) {
          const wStart = new Date(lastWeekStart);
          wStart.setDate(lastWeekStart.getDate() + i * 7);
          const days = [];
          for (let dIdx = 0; dIdx < 7; dIdx++) {
            const d = new Date(wStart);
            d.setDate(wStart.getDate() + dIdx);
            days.push({
              dateStr: getLocalDateKey(d),
              dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
              dayNum: d.getDate(),
              dateObj: d,
            });
          }
          newWeeks.push({ id: `app-${wStart.getTime()}`, days });
        }
        return [...prev, ...newWeeks];
      });
    }
  }, [weeks, displayedMonthYear]);

  const isSelectedDateInView = useMemo(() => {
    return weeks.some((w) => w.days.some((d) => d.dateStr === selectedDate));
  }, [weeks, selectedDate]);

  const handleJumpToToday = () => {
    setSelectedDate(todayStr);
    setFilterCategory('today');
    if (containerRef.current) {
      const middleIndex = Math.floor(weeks.length / 2);
      const child = containerRef.current.children[middleIndex] as HTMLElement;
      if (child) {
        containerRef.current.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
      }
    }
  };

  const selectedDateFormatted = useMemo(() => {
    const d = parseLocalDateKey(selectedDate);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  const renderFollowUpItem = (item: ActiveFollowUp, isOverdue = false, isTodayItem = false) => {
    const person = people.find((p) => p.id === item.personId);
    if (!person) return null;

    return (
      <div
        key={`${item.personId}-${item.visitId}`}
        onClick={() => onSelectPerson(item.personId)}
        className="py-3.5 px-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F5F3ED] active:bg-[#EBE8DF] transition-colors group"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <EditorialDate dateString={item.date} format="column" />

          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-sm tracking-tight text-[#17201E] group-hover:text-[#183A35] uppercase truncate">
                {item.personName}
              </h2>
              <StatusIndicator status={person.status} showText={false} />
            </div>

            <div className="text-xs text-[#68716D] flex items-center gap-1.5 truncate">
              {item.territoryName && (
                <span className="font-semibold text-[#183A35] uppercase">
                  {item.territoryName}{item.territoryCode ? ` · T${item.territoryCode}` : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs text-[#183A35] font-medium line-clamp-1">
                "{item.topic}"
              </p>
              {isOverdue && (
                <span className="text-[10px] text-[#B87545] font-semibold flex items-center gap-0.5 shrink-0">
                  <AlertCircle className="w-3 h-3" />
                  Overdue
                </span>
              )}
              {isTodayItem && (
                <span className="text-[10px] text-[#183A35] font-semibold flex items-center gap-0.5 shrink-0">
                  <Clock className="w-3 h-3 text-[#B99A62]" />
                  Due today
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRescheduleItem(item);
          }}
          className="shrink-0 h-7 px-2.5 text-[10px] font-semibold text-[#1B2421] bg-[#E9E2D3] hover:bg-[#D6CBB8] active:scale-95 rounded-[8px] transition-all flex items-center gap-1 shadow-2xs border border-[#D6CBB8]"
        >
          <RotateCw className="w-2.5 h-2.5 text-[#C2571A]" />
          <span>Reschedule</span>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16">
      {/* 1. TODAY'S DATE: DISTINCTIVE EDITORIAL HOME DATE HERO */}
      <div className="relative bg-[#FCFBF8] border border-[#DCDDD5] rounded-[18px] p-5 sm:p-6 overflow-hidden shadow-2xs select-none">
        <TopographicPattern opacity={0.07} />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-1 h-14 bg-[#B87545] rounded-full shrink-0" aria-hidden="true" />

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

      {/* SCHEDULE SECTION EMBEDDED DIRECTLY ON HOME */}
      <div className="space-y-4">
        {/* ONE UNIFIED CARD FOR MONTH/YEAR LABEL & WEEK STRIP */}
        <div className="bg-[#FCFBF8] border border-[#DCDDD5] rounded-[16px] p-4 shadow-2xs relative space-y-3">
          {/* Row 1: Month & Year Label (18px semibold, left aligned) */}
          <div className="flex items-center justify-between gap-3 px-1">
            <h2
              className={`text-[18px] font-semibold text-[#183A35] tracking-tight transition-opacity duration-150 ${
                isMonthFading ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {displayedMonthYear}
            </h2>

            {!isSelectedDateInView && (
              <button
                onClick={handleJumpToToday}
                className="h-6 px-2 text-[10px] font-semibold text-[#183A35] bg-[#F5F3ED] hover:bg-[#183A35] hover:text-white rounded-[6px] transition-colors shadow-2xs animate-in fade-in duration-150"
              >
                Today
              </button>
            )}
          </div>

          {/* Row 2: Native Horizontal Scroll Container for Weeks with 12px gap */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory focus:outline-none pt-0.5"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorX: 'contain',
              scrollbarWidth: 'none',
            }}
          >
            {weeks.map((week) => (
              <div
                key={week.id}
                className="flex flex-none w-full snap-start snap-always grid grid-cols-7 gap-1 px-0.5"
                style={{ flex: '0 0 100%' }}
              >
                {week.days.map((day) => {
                  const isSelected = day.dateStr === selectedDate;
                  const isToday = day.dateStr === todayStr;
                  const hasVisits = scheduledDatesSet.has(day.dateStr);

                  return (
                    <button
                      key={day.dateStr}
                      onClick={() => setSelectedDate(day.dateStr)}
                      className={`min-w-[44px] min-h-[44px] py-2 px-1 rounded-[10px] flex flex-col items-center justify-center transition-all duration-150 relative ${
                        isSelected
                          ? 'bg-[#183A35] text-white shadow-2xs scale-[1.02]'
                          : 'hover:bg-[#F5F3ED] text-[#68716D]'
                      }`}
                    >
                      <span className={`text-[10px] font-mono uppercase font-bold ${
                        isSelected ? 'text-[#B99A62]' : 'text-[#68716D]'
                      }`}>
                        {day.dayName}
                      </span>
                      <span className={`text-sm font-display font-bold leading-tight mt-0.5 ${
                        isSelected ? 'text-white' : 'text-[#17201E]'
                      }`}>
                        {day.dayNum}
                      </span>
                      {hasVisits && (
                        <span className={`w-1 h-1 rounded-full mt-1 ${
                          isSelected ? 'bg-[#B99A62]' : 'bg-[#183A35]'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className="flex items-center p-1 bg-[#FCFBF8] border border-[#DCDDD5] rounded-[12px] overflow-x-auto">
          <button
            onClick={() => setFilterCategory('all')}
            className={`flex-1 h-8 text-xs font-semibold rounded-[8px] transition-colors whitespace-nowrap px-3 ${
              filterCategory === 'all'
                ? 'bg-[#183A35] text-white shadow-2xs'
                : 'text-[#68716D] hover:text-[#17201E]'
            }`}
          >
            All ({activeFollowUps.length})
          </button>
          <button
            onClick={() => setFilterCategory('today')}
            className={`flex-1 h-8 text-xs font-semibold rounded-[8px] transition-colors whitespace-nowrap px-3 ${
              filterCategory === 'today'
                ? 'bg-[#183A35] text-white shadow-2xs'
                : 'text-[#68716D] hover:text-[#17201E]'
            }`}
          >
            Today ({todayList.length})
          </button>
          <button
            onClick={() => setFilterCategory('overdue')}
            className={`flex-1 h-8 text-xs font-semibold rounded-[8px] transition-colors whitespace-nowrap px-3 ${
              filterCategory === 'overdue'
                ? 'bg-[#183A35] text-white shadow-2xs'
                : overdue.length > 0
                ? 'text-[#B87545] font-bold hover:text-[#17201E]'
                : 'text-[#68716D] hover:text-[#17201E]'
            }`}
          >
            Overdue ({overdue.length})
          </button>
          <button
            onClick={() => setFilterCategory('upcoming')}
            className={`flex-1 h-8 text-xs font-semibold rounded-[8px] transition-colors whitespace-nowrap px-3 ${
              filterCategory === 'upcoming'
                ? 'bg-[#183A35] text-white shadow-2xs'
                : 'text-[#68716D] hover:text-[#17201E]'
            }`}
          >
            Upcoming ({upcoming.length})
          </button>
          {filterCategory === 'date' && (
            <button
              onClick={() => setFilterCategory('date')}
              className="flex-1 h-8 text-xs font-semibold rounded-[8px] bg-[#B87545] text-white shadow-2xs whitespace-nowrap px-3"
            >
              Date ({selectedDateList.length})
            </button>
          )}
        </div>

        {/* Grouped Follow-up List */}
        {activeFollowUps.length === 0 ? (
          <div className="bg-[#FCFBF8] border border-dashed border-[#DCDDD5] rounded-[16px] p-8 text-center text-xs text-[#68716D] space-y-1">
            <p className="font-semibold text-sm text-[#17201E]">No active follow-ups</p>
            <p>When you record field visits with follow-up dates, they automatically appear here.</p>
          </div>
        ) : filterCategory === 'date' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#183A35]">
                {selectedDateFormatted} · {selectedDateList.length} {selectedDateList.length === 1 ? 'follow-up' : 'follow-ups'}
              </h2>
            </div>

            {selectedDateList.length === 0 ? (
              <div className="bg-[#FCFBF8] border border-dashed border-[#DCDDD5] rounded-[16px] p-8 text-center text-xs text-[#68716D]">
                <p className="font-semibold text-sm text-[#17201E] mb-0.5">No follow-ups today</p>
                <p>Your schedule is clear for this date.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#DCDDD5]/70 border-y border-[#DCDDD5]">
                {selectedDateList.map((item) =>
                  renderFollowUpItem(item, item.date < todayStr, item.date === todayStr)
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {(filterCategory === 'all' || filterCategory === 'overdue') && overdue.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="w-2 h-2 rounded-full bg-[#B87545]" />
                  <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#B87545]">
                    OVERDUE ({overdue.length})
                  </h2>
                </div>
                <div className="divide-y divide-[#DCDDD5]/70 border-y border-[#DCDDD5]">
                  {overdue.map((item) => renderFollowUpItem(item, true, false))}
                </div>
              </div>
            )}

            {(filterCategory === 'all' || filterCategory === 'today') && todayList.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="w-2 h-2 rounded-full bg-[#B99A62]" />
                  <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#183A35]">
                    TODAY ({todayList.length})
                  </h2>
                </div>
                <div className="divide-y divide-[#DCDDD5]/70 border-y border-[#DCDDD5]">
                  {todayList.map((item) => renderFollowUpItem(item, false, true))}
                </div>
              </div>
            )}

            {(filterCategory === 'all' || filterCategory === 'upcoming') && upcoming.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 px-1">
                  <span className="w-2 h-2 rounded-full bg-[#183A35]" />
                  <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#68716D]">
                    UPCOMING ({upcoming.length})
                  </h2>
                </div>
                <div className="divide-y divide-[#DCDDD5]/70 border-y border-[#DCDDD5]">
                  {upcoming.map((item) => renderFollowUpItem(item, false, false))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      <RescheduleFollowUpModal
        isOpen={Boolean(selectedRescheduleItem)}
        onClose={() => setSelectedRescheduleItem(null)}
        personName={selectedRescheduleItem?.personName || ''}
        currentDate={selectedRescheduleItem?.date || ''}
        visitId={selectedRescheduleItem?.visitId || ''}
        onSave={(vId, newDate) => {
          if (onUpdateVisit) {
            onUpdateVisit(vId, { nextFollowUpDate: newDate });
          }
        }}
      />
    </div>
  );
};
