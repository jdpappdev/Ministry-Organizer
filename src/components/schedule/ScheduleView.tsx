import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  MapPin,
  Filter,
  RotateCw,
} from 'lucide-react';
import { Person, Visit, Territory } from '../../types';
import { EditorialDate } from '../common/EditorialDate';
import { ActiveFollowUp } from '../../data/store';
import { RescheduleFollowUpModal } from './RescheduleFollowUpModal';
import { Select } from '../common/Select';
import { getLocalDateKey, parseLocalDateKey, formatLocalDateKey } from '../../utils/dateUtils';

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

interface ScheduleViewProps {
  people: Person[];
  visits: Visit[];
  territories: Territory[];
  onSelectPerson: (personId: string) => void;
  onUpdateVisit?: (id: string, updates: Partial<Visit>) => void;
}

type FilterCategory = 'all' | 'today' | 'overdue' | 'upcoming' | 'date';

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  people,
  visits,
  territories,
  onSelectPerson,
  onUpdateVisit,
}) => {
  const todayStr = useMemo(() => getLocalDateKey(), []);

  // Filter & Navigation states
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>('all');

  // Reschedule Modal state
  const [selectedRescheduleItem, setSelectedRescheduleItem] = useState<ActiveFollowUp | null>(null);

  // Derive active follow-ups strictly from the LATEST visit for each person
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

  // Apply Territory Filter
  const territoryFilteredFollowUps = useMemo(() => {
    if (selectedTerritoryId === 'all') return activeFollowUps;
    return activeFollowUps.filter((f) => f.territoryId === selectedTerritoryId);
  }, [activeFollowUps, selectedTerritoryId]);

  // Categorize
  const overdue = useMemo(
    () => territoryFilteredFollowUps.filter((f) => f.date < todayStr).sort((a, b) => a.date.localeCompare(b.date)),
    [territoryFilteredFollowUps, todayStr]
  );

  const todayList = useMemo(
    () => territoryFilteredFollowUps.filter((f) => f.date === todayStr),
    [territoryFilteredFollowUps, todayStr]
  );

  const upcoming = useMemo(
    () => territoryFilteredFollowUps.filter((f) => f.date > todayStr).sort((a, b) => a.date.localeCompare(b.date)),
    [territoryFilteredFollowUps, todayStr]
  );

  const selectedDateList = useMemo(
    () => territoryFilteredFollowUps.filter((f) => f.date === selectedDate),
    [territoryFilteredFollowUps, selectedDate]
  );

  // Date Navigation Helpers
  const handleShiftDay = (deltaDays: number) => {
    const current = parseLocalDateKey(selectedDate);
    current.setDate(current.getDate() + deltaDays);
    const newDateStr = getLocalDateKey(current);
    setSelectedDate(newDateStr);
    setFilterCategory('date');
  };

  const handleSelectSpecificDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setFilterCategory('date');
  };

  const handleResetToToday = () => {
    setSelectedDate(todayStr);
    setFilterCategory('today');
  };

  // Generate 7-day horizontal strip around selectedDate
  const dateStripDays = useMemo(() => {
    const center = parseLocalDateKey(selectedDate);
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(center);
      d.setDate(center.getDate() + i);
      const dateStr = getLocalDateKey(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      days.push({ dateStr, dayName, dayNum });
    }
    return days;
  }, [selectedDate]);

  // Selected date formatted for editorial display
  const selectedDateFormatted = useMemo(() => {
    const d = parseLocalDateKey(selectedDate);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  const selectedDateMonthYear = useMemo(() => {
    const d = parseLocalDateKey(selectedDate);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  }, [selectedDate]);

  const renderFollowUpItem = (item: ActiveFollowUp, isOverdue = false, isTodayItem = false) => {
    return (
      <div
        key={`${item.personId}-${item.visitId}`}
        onClick={() => onSelectPerson(item.personId)}
        className="py-2.5 px-2 sm:px-3 flex items-start gap-3.5 cursor-pointer hover:bg-[#FCFBF8] active:bg-[#F5F3ED] transition-colors group"
      >
        {/* Date Column */}
        <EditorialDate dateString={item.date} format="column" />

        {/* Main Content Area */}
        <div className="min-w-0 flex-1 space-y-0.5">
          {/* Row 1: Person Name (Full available width) + Chevron on far right */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-display font-bold text-sm uppercase tracking-tight text-[#17201E] group-hover:text-[#183A35] truncate min-w-0">
              {item.personName}
            </span>
            <ChevronRight className="w-4 h-4 text-[#68716D] group-hover:text-[#183A35] group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>

          {/* Row 2: Territory */}
          {item.territoryName && (
            <div className="text-[10px] font-mono uppercase font-semibold text-[#68716D] truncate">
              {item.territoryName}{item.territoryCode ? ` · T${item.territoryCode}` : ''}
            </div>
          )}

          {/* Row 3: Topic & Status Metadata */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-[#68716D] pt-0.5">
            <span className="font-medium text-[#183A35] truncate max-w-[180px] sm:max-w-[280px]">
              "{item.topic}"
            </span>
            <span className="text-[#DCDDD5]">·</span>
            {isOverdue && (
              <span className="text-[#B87545] font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Overdue follow-up
              </span>
            )}
            {isTodayItem && (
              <span className="text-[#183A35] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#B99A62] shrink-0" />
                Scheduled today
              </span>
            )}
            {!isOverdue && !isTodayItem && (
              <span className="font-mono text-[11px] text-[#68716D]">
                Visited {formatVisitedDate(item.visitDate)}
              </span>
            )}
          </div>

          {/* Row 4: Reschedule Action — Compact outlined button on its own line below */}
          <div className="pt-1.5 flex items-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRescheduleItem(item);
              }}
              className="h-7 px-2.5 text-[11px] font-semibold text-[#183A35] bg-white border border-[#DCDDD5] hover:bg-[#F5F3ED] hover:border-[#183A35] active:scale-95 rounded-[8px] transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCw className="w-3 h-3 text-[#183A35]" />
              <span>Reschedule</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-20">
      {/* 1. HEADER & DATE NAVIGATION */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#17201E]">
              Schedule
            </h1>
            <p className="text-xs font-medium text-[#68716D] mt-0.5">
              Field agenda & planned return visits
            </p>
          </div>

          {/* Territory Filter Dropdown */}
          <div className="w-44">
            <Select
              value={selectedTerritoryId}
              onChange={(val) => setSelectedTerritoryId(val)}
              size="sm"
              options={[
                { value: 'all', label: 'All Territories' },
                ...territories.map((t) => ({
                  value: t.id,
                  label: `${t.name}${t.code ? ` (T${t.code})` : ''}`,
                })),
              ]}
              ariaLabel="Filter by territory"
            />
          </div>
        </div>

        {/* 2. COMPACT EDITORIAL DATE NAVIGATOR */}
        <div className="bg-[#FCFBF8] border border-[#DCDDD5] rounded-[14px] p-3 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B87545]">
              {selectedDateMonthYear}
            </span>

            <div className="flex items-center gap-2">
              {selectedDate !== todayStr && (
                <button
                  onClick={handleResetToToday}
                  className="h-7 px-2.5 text-[11px] font-semibold text-[#183A35] bg-[#F5F3ED] hover:bg-[#183A35] hover:text-white rounded-[6px] transition-colors"
                >
                  Today
                </button>
              )}
              <div className="flex items-center gap-1 bg-[#F5F3ED] rounded-[8px] p-0.5 border border-[#DCDDD5]/60">
                <button
                  onClick={() => handleShiftDay(-1)}
                  className="p-1 text-[#68716D] hover:text-[#17201E] rounded transition-colors"
                  aria-label="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-[#17201E] px-1.5 min-w-[70px] text-center">
                  {selectedDateFormatted.split(',')[0]} {selectedDateFormatted.split(',')[1]}
                </span>
                <button
                  onClick={() => handleShiftDay(1)}
                  className="p-1 text-[#68716D] hover:text-[#17201E] rounded transition-colors"
                  aria-label="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. HORIZONTAL DATE STRIP */}
          <div className="grid grid-cols-7 gap-1 pt-1 border-t border-[#DCDDD5]/60">
            {dateStripDays.map((day) => {
              const isSelected = day.dateStr === selectedDate;
              const isToday = day.dateStr === todayStr;

              return (
                <button
                  key={day.dateStr}
                  onClick={() => handleSelectSpecificDate(day.dateStr)}
                  className={`py-1.5 px-1 rounded-[10px] flex flex-col items-center transition-all ${
                    isSelected
                      ? 'bg-[#183A35] text-white shadow-2xs'
                      : 'hover:bg-[#F5F3ED] text-[#68716D]'
                  }`}
                >
                  <span className={`text-[10px] font-mono uppercase font-bold ${
                    isSelected ? 'text-[#B99A62]' : 'text-[#68716D]'
                  }`}>
                    {isToday ? 'TODAY' : day.dayName}
                  </span>
                  <span className={`text-sm font-display font-bold leading-tight mt-0.5 ${
                    isSelected ? 'text-white' : 'text-[#17201E]'
                  }`}>
                    {day.dayNum}
                  </span>
                  {isToday && (
                    <span className={`w-1 h-1 rounded-full mt-1 ${
                      isSelected ? 'bg-[#B99A62]' : 'bg-[#183A35]'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. LIGHTWEIGHT CATEGORY FILTERS */}
      <div className="flex items-center p-1 bg-[#FCFBF8] border border-[#DCDDD5] rounded-[12px] overflow-x-auto">
        <button
          onClick={() => setFilterCategory('all')}
          className={`flex-1 h-8 text-xs font-semibold rounded-[8px] transition-colors whitespace-nowrap px-3 ${
            filterCategory === 'all'
              ? 'bg-[#183A35] text-white shadow-2xs'
              : 'text-[#68716D] hover:text-[#17201E]'
          }`}
        >
          All ({territoryFilteredFollowUps.length})
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

      {/* 5. AGENDA CONTENT */}
      {territoryFilteredFollowUps.length === 0 ? (
        <div className="bg-[#FCFBF8] border border-dashed border-[#DCDDD5] rounded-[16px] p-8 text-center text-xs text-[#68716D] space-y-1">
          <p className="font-semibold text-sm text-[#17201E]">
            {selectedTerritoryId !== 'all' ? 'No follow-ups in this territory' : 'No active follow-ups'}
          </p>
          <p>When you record field visits with follow-up dates, they automatically appear here.</p>
        </div>
      ) : filterCategory === 'date' ? (
        /* SPECIFIC DATE AGENDA VIEW */
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
        /* CATEGORY AGENDA SECTIONS */
        <div className="space-y-6">
          {/* OVERDUE */}
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

          {/* TODAY */}
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

          {/* UPCOMING */}
          {(filterCategory === 'all' || filterCategory === 'upcoming') && upcoming.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
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

          {/* Empty States */}
          {filterCategory === 'overdue' && overdue.length === 0 && (
            <div className="bg-[#FCFBF8] border border-dashed border-[#DCDDD5] rounded-[16px] p-8 text-center text-xs text-[#68716D]">
              <p className="font-semibold text-sm text-[#17201E] mb-0.5">No overdue follow-ups</p>
              <p>All field visit records are up to date.</p>
            </div>
          )}

          {filterCategory === 'today' && todayList.length === 0 && (
            <div className="bg-[#FCFBF8] border border-dashed border-[#DCDDD5] rounded-[16px] p-8 text-center text-xs text-[#68716D]">
              <p className="font-semibold text-sm text-[#17201E] mb-0.5">No follow-ups today</p>
              <p>Your schedule is clear for this date.</p>
            </div>
          )}

          {filterCategory === 'upcoming' && upcoming.length === 0 && (
            <div className="bg-[#FCFBF8] border border-dashed border-[#DCDDD5] rounded-[16px] p-8 text-center text-xs text-[#68716D]">
              <p className="font-semibold text-sm text-[#17201E] mb-0.5">No upcoming follow-ups</p>
              <p>No future return visits planned yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Reschedule Follow-Up Modal */}
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
