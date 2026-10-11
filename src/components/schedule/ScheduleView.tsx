import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
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
    () =>
      territoryFilteredFollowUps
        .filter((f) => f.date < todayStr)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [territoryFilteredFollowUps, todayStr]
  );

  const todayList = useMemo(
    () => territoryFilteredFollowUps.filter((f) => f.date === todayStr),
    [territoryFilteredFollowUps, todayStr]
  );

  const upcoming = useMemo(
    () =>
      territoryFilteredFollowUps
        .filter((f) => f.date > todayStr)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [territoryFilteredFollowUps, todayStr]
  );

  const selectedDateList = useMemo(
    () => territoryFilteredFollowUps.filter((f) => f.date === selectedDate),
    [territoryFilteredFollowUps, selectedDate]
  );

  // Day shifting for horizontal scroller
  const handleShiftDay = (direction: -1 | 1) => {
    const cur = parseLocalDateKey(selectedDate);
    cur.setDate(cur.getDate() + direction);
    const newKey = getLocalDateKey(cur);
    setSelectedDate(newKey);
    setFilterCategory('date');
  };

  const handleSelectSpecificDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setFilterCategory('date');
  };

  // Generate 7-day strip centered on selectedDate
  const dateStripDays = useMemo(() => {
    const center = parseLocalDateKey(selectedDate);
    const days: { dateStr: string; dayName: string; dayNum: number }[] = [];
    for (let offset = -3; offset <= 3; offset++) {
      const d = new Date(center);
      d.setDate(center.getDate() + offset);
      const dateStr = getLocalDateKey(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
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
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [selectedDate]);

  const renderFollowUpItem = (item: ActiveFollowUp, isOverdue = false, isTodayItem = false) => {
    return (
      <div
        key={`${item.personId}-${item.visitId}`}
        onClick={() => onSelectPerson(item.personId)}
        className="list-card p-4 flex items-start gap-4 cursor-pointer group select-none"
      >
        {/* Date Column */}
        <EditorialDate dateString={item.date} format="column" />

        {/* Main Content Area */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Row 1: Person Name + Chevron on far right */}
          <div className="flex items-center justify-between gap-2">
            <span className="font-display font-bold text-base text-[#1B2421] group-hover:text-[#1F3D36] truncate min-w-0">
              {item.personName}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#5F6B66] group-hover:text-[#1F3D36] transition-colors shrink-0">
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Row 2: Territory */}
          {item.territoryName && (
            <div className="text-[11px] font-mono uppercase font-semibold text-[#5F6B66] truncate">
              {item.territoryName}{item.territoryCode ? ` · T${item.territoryCode}` : ''}
            </div>
          )}

          {/* Row 3: Topic & Status Metadata */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5F6B66] pt-0.5">
            <span className="font-medium text-[#1F3D36] truncate max-w-[200px] sm:max-w-[300px]">
              "{item.topic}"
            </span>
            <span>·</span>
            {isOverdue && (
              <span className="pill-overdue">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>Overdue follow-up</span>
              </span>
            )}
            {isTodayItem && (
              <span className="pill-neutral-sage">
                <Clock className="w-3 h-3 shrink-0" />
                <span>Scheduled today</span>
              </span>
            )}
            {!isOverdue && !isTodayItem && (
              <span className="font-mono text-[11px] text-[#5F6B66]">
                Visited {formatVisitedDate(item.visitDate)}
              </span>
            )}
          </div>

          {/* Row 4: Reschedule Action Button */}
          <div className="pt-2 flex items-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRescheduleItem(item);
              }}
              className="btn-tactile-secondary h-8 px-3 text-xs gap-1.5"
            >
              <RotateCw className="w-3 h-3 text-[#1F3D36]" />
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
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1B2421]">
              Schedule
            </h1>
            <p className="text-xs font-medium text-[#5F6B66] mt-0.5">
              {territoryFilteredFollowUps.length} follow-up {territoryFilteredFollowUps.length === 1 ? 'visit' : 'visits'} planned
            </p>
          </div>

          {/* Territory filter */}
          {territories.length > 0 && (
            <div className="w-44">
              <Select
                value={selectedTerritoryId}
                onChange={(val) => setSelectedTerritoryId(val)}
                options={[
                  { value: 'all', label: `All Territories (${territories.length})` },
                  ...territories.map((t) => ({
                    value: t.id,
                    label: `${t.code ? `T${t.code}: ` : ''}${t.name}`,
                  })),
                ]}
                ariaLabel="Filter schedule by territory"
              />
            </div>
          )}
        </div>

        {/* 2. CALENDAR HERO STRIP: Level 1 Raised Card */}
        <div className="level-1-raised p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1F3D36]" />
              <span className="font-display font-bold text-sm text-[#1B2421]">
                {selectedDateMonthYear}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectSpecificDate(todayStr)}
                className="text-xs font-semibold px-2.5 py-1 rounded-[8px] bg-[#F5F1E8] text-[#1F3D36] border border-[#E6E0D2] hover:bg-[#ECE7DC] transition-colors cursor-pointer"
              >
                Today
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleShiftDay(-1)}
                  className="w-8 h-8 flex items-center justify-center text-[#5F6B66] hover:text-[#1B2421] rounded-lg transition-colors cursor-pointer"
                  aria-label="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleShiftDay(1)}
                  className="w-8 h-8 flex items-center justify-center text-[#5F6B66] hover:text-[#1B2421] rounded-lg transition-colors cursor-pointer"
                  aria-label="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 3. HORIZONTAL DATE STRIP */}
          <div className="grid grid-cols-7 gap-1 pt-1 border-t border-[#E6E0D2]/70">
            {dateStripDays.map((day) => {
              const isSelected = day.dateStr === selectedDate;
              const isToday = day.dateStr === todayStr;

              return (
                <button
                  key={day.dateStr}
                  onClick={() => handleSelectSpecificDate(day.dateStr)}
                  className={`py-2 px-1 rounded-[12px] flex flex-col items-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1F3D36] text-white shadow-sm'
                      : 'hover:bg-[#F5F1E8] text-[#5F6B66]'
                  }`}
                >
                  <span className={`text-[10px] font-mono uppercase font-bold ${
                    isSelected ? 'text-[#9DB3A5]' : 'text-[#5F6B66]'
                  }`}>
                    {isToday ? 'TODAY' : day.dayName}
                  </span>
                  <span className={`text-base font-display font-bold leading-tight mt-0.5 ${
                    isSelected ? 'text-white' : 'text-[#1B2421]'
                  }`}>
                    {day.dayNum}
                  </span>
                  {isToday && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      isSelected ? 'bg-[#9DB3A5]' : 'bg-[#1F3D36]'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. PAPER TABS: Overlapping file tabs with 180ms ease-out */}
      <div className="flex items-end gap-1.5 border-b border-[#E6E0D2] px-1 overflow-x-auto pt-1">
        <button
          onClick={() => setFilterCategory('all')}
          className={`paper-tab px-4 py-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer ${
            filterCategory === 'all' ? 'paper-tab-active' : 'paper-tab-inactive'
          }`}
        >
          All ({territoryFilteredFollowUps.length})
        </button>
        <button
          onClick={() => setFilterCategory('today')}
          className={`paper-tab px-4 py-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer ${
            filterCategory === 'today' ? 'paper-tab-active' : 'paper-tab-inactive'
          }`}
        >
          Today ({todayList.length})
        </button>
        <button
          onClick={() => setFilterCategory('overdue')}
          className={`paper-tab px-4 py-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer ${
            filterCategory === 'overdue'
              ? 'paper-tab-active'
              : overdue.length > 0
              ? 'paper-tab-inactive text-[#C2571A] font-bold'
              : 'paper-tab-inactive'
          }`}
        >
          Overdue ({overdue.length})
        </button>
        <button
          onClick={() => setFilterCategory('upcoming')}
          className={`paper-tab px-4 py-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer ${
            filterCategory === 'upcoming' ? 'paper-tab-active' : 'paper-tab-inactive'
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        {filterCategory === 'date' && (
          <button
            onClick={() => setFilterCategory('date')}
            className="paper-tab paper-tab-active px-4 py-2.5 text-xs font-semibold whitespace-nowrap cursor-pointer"
          >
            Date ({selectedDateList.length})
          </button>
        )}
      </div>

      {/* 5. AGENDA CONTENT */}
      {territoryFilteredFollowUps.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E6E0D2] rounded-[16px] p-8 text-center text-xs text-[#5F6B66] space-y-1">
          <p className="font-semibold text-sm text-[#1B2421]">
            {selectedTerritoryId !== 'all' ? 'No follow-ups in this territory' : 'No active follow-ups'}
          </p>
          <p>When you record field visits with follow-up dates, they automatically appear here.</p>
        </div>
      ) : filterCategory === 'date' ? (
        /* SPECIFIC DATE AGENDA VIEW */
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#1F3D36]">
              {selectedDateFormatted} · {selectedDateList.length} {selectedDateList.length === 1 ? 'follow-up' : 'follow-ups'}
            </h2>
          </div>

          {selectedDateList.length === 0 ? (
            <div className="bg-white border border-dashed border-[#E6E0D2] rounded-[16px] p-8 text-center text-xs text-[#5F6B66]">
              <p className="font-semibold text-sm text-[#1B2421] mb-0.5">No follow-ups today</p>
              <p>Your schedule is clear for this date.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
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
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C2571A]" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#C2571A]">
                  Overdue ({overdue.length})
                </h2>
              </div>
              <div className="space-y-3.5">
                {overdue.map((item) => renderFollowUpItem(item, true, false))}
              </div>
            </div>
          )}

          {/* TODAY */}
          {(filterCategory === 'all' || filterCategory === 'today') && todayList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1F3D36]" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#1F3D36]">
                  Today ({todayList.length})
                </h2>
              </div>
              <div className="space-y-3.5">
                {todayList.map((item) => renderFollowUpItem(item, false, true))}
              </div>
            </div>
          )}

          {/* UPCOMING */}
          {(filterCategory === 'all' || filterCategory === 'upcoming') && upcoming.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5F6B66]" />
                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#5F6B66]">
                  Upcoming ({upcoming.length})
                </h2>
              </div>
              <div className="space-y-3.5">
                {upcoming.map((item) => renderFollowUpItem(item, false, false))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {selectedRescheduleItem && (
        <RescheduleFollowUpModal
          isOpen={Boolean(selectedRescheduleItem)}
          onClose={() => setSelectedRescheduleItem(null)}
          personName={selectedRescheduleItem.personName}
          currentDate={selectedRescheduleItem.date}
          visitId={selectedRescheduleItem.visitId}
          onSave={(vId, newDate) => {
            if (onUpdateVisit) {
              onUpdateVisit(vId, { nextFollowUpDate: newDate });
            }
          }}
        />
      )}
    </div>
  );
};
