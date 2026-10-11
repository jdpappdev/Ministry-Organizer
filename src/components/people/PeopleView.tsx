import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  ChevronRight,
  User,
  X,
  Users,
} from 'lucide-react';
import { Person, Territory, Visit, StatusType } from '../../types';
import { StatusIndicator } from '../common/StatusIndicator';
import { InitialsAvatar } from '../common/InitialsAvatar';
import { Select } from '../common/Select';
import { TopographicPattern } from '../common/TopographicBackground';

interface PeopleViewProps {
  people: Person[];
  territories: Territory[];
  visits: Visit[];
  onSelectPerson: (personId: string) => void;
  onOpenAddPerson: () => void;
  selectedTerritoryId?: string;
  onSelectTerritoryFilter?: (territoryId: string | 'all') => void;
  onPreviewPerson?: (person: Person) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  people,
  territories,
  visits,
  onSelectPerson,
  onOpenAddPerson,
  selectedTerritoryId = 'all',
  onSelectTerritoryFilter,
  onPreviewPerson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTerritory, setActiveTerritory] = useState<string>(selectedTerritoryId);
  const [statusFilter, setStatusFilter] = useState<StatusType | 'all'>('all');

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = person.name.toLowerCase().includes(q);
        const matchesAddress = person.address.toLowerCase().includes(q);
        const matchesBackground = person.background?.toLowerCase().includes(q);
        if (!matchesName && !matchesAddress && !matchesBackground) return false;
      }

      if (activeTerritory !== 'all' && person.territoryId !== activeTerritory) {
        return false;
      }

      if (statusFilter !== 'all' && person.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [people, searchQuery, activeTerritory, statusFilter]);

  const territoryMap = useMemo(() => {
    const map = new Map<string, Territory>();
    territories.forEach((t) => map.set(t.id, t));
    return map;
  }, [territories]);

  const latestVisits = useMemo(() => {
    const map = new Map<string, Visit>();
    visits.forEach((v) => {
      const vDate = v.visitDate || v.date;
      const existing = map.get(v.personId);
      const existingDate = existing ? (existing.visitDate || existing.date) : null;
      if (!existing || (vDate && existingDate && new Date(vDate) > new Date(existingDate))) {
        map.set(v.personId, v);
      }
    });
    return map;
  }, [visits]);

  const activeCount = useMemo(() => people.filter((p) => p.status === 'active').length, [people]);
  const needsAttentionCount = useMemo(() => people.filter((p) => p.status === 'needs_attention').length, [people]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20 animate-in fade-in duration-200">
      {/* 1. EDITORIAL PEOPLE HERO HEADER */}
      <div className="relative bg-[#FCFBF8] border border-[#DCDDD5] rounded-[18px] p-6 sm:p-7 overflow-hidden shadow-2xs select-none">
        <TopographicPattern opacity={0.07} />

        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#B87545]">
                DIRECTORY & CONTACTS
              </span>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#17201E] tracking-tight">
                People
              </h1>
              <p className="text-xs text-[#68716D]">
                Field journal records & return visit contacts.
              </p>
            </div>

            <button
              onClick={onOpenAddPerson}
              className="h-11 px-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#183A35] hover:bg-[#102C29] active:scale-[0.98] rounded-[12px] transition-all shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Person</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[#DCDDD5]/60">
            <div className="p-3 bg-white/80 border border-[#DCDDD5] rounded-[12px] space-y-0.5">
              <div className="text-[10px] font-mono text-[#68716D] uppercase font-semibold">Total</div>
              <div className="font-display text-xl font-bold text-[#183A35] tabular-nums">{people.length}</div>
            </div>

            <div className="p-3 bg-white/80 border border-[#DCDDD5] rounded-[12px] space-y-0.5">
              <div className="text-[10px] font-mono text-[#68716D] uppercase font-semibold">Active</div>
              <div className="font-display text-xl font-bold text-[#183A35] tabular-nums">{activeCount}</div>
            </div>

            <div className="p-3 bg-white/80 border border-[#DCDDD5] rounded-[12px] space-y-0.5">
              <div className="text-[10px] font-mono text-[#68716D] uppercase font-semibold">Follow-up</div>
              <div className="font-display text-xl font-bold text-[#B87545] tabular-nums">{needsAttentionCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Search & Filter Bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#68716D]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people by name, street, or topic..."
            className="w-full h-12 pl-11 pr-10 text-sm bg-[#FCFBF8] border border-[#DCDDD5] rounded-[14px] focus:outline-none focus:border-[#183A35] text-[#17201E] placeholder-[#68716D] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#68716D] hover:text-[#17201E]"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clean Filter Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1">
            <Select
              value={activeTerritory}
              onChange={(val) => {
                setActiveTerritory(val);
                if (onSelectTerritoryFilter) onSelectTerritoryFilter(val);
              }}
              options={[
                { value: 'all', label: `All Territories (${territories.length})` },
                ...territories.map((t) => ({
                  value: t.id,
                  label: `${t.code ? `T${t.code}: ` : ''}${t.name}`,
                })),
              ]}
              ariaLabel="Filter by territory"
            />
          </div>

          <div className="w-40">
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as StatusType | 'all')}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'needs_attention', label: 'Needs Follow-up' },
                { value: 'active', label: 'Recently Visited' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              ariaLabel="Filter by status"
            />
          </div>
        </div>
      </div>

      {/* COMPACT & READABLE CONTINUOUS DIRECTORY */}
      {filteredPeople.length === 0 ? (
        <div className="bg-[#FCFBF8] border border-dashed border-[#DCDDD5] rounded-[16px] p-10 text-center space-y-2">
          <User className="w-8 h-8 text-[#68716D] mx-auto opacity-40" />
          <p className="font-semibold text-sm text-[#17201E]">No records matching filters</p>
          <p className="text-xs text-[#68716D]">
            Try adjusting your search query or clear the active territory filter.
          </p>
          {(searchQuery || activeTerritory !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveTerritory('all');
                setStatusFilter('all');
              }}
              className="text-xs font-semibold text-[#183A35] underline pt-1"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-[#DCDDD5]/70 border-y border-[#DCDDD5] bg-[#FCFBF8] rounded-[16px] overflow-hidden shadow-2xs">
          {filteredPeople.map((person) => {
            const terr = territoryMap.get(person.territoryId);
            const latestVisit = latestVisits.get(person.id);

            return (
              <div
                key={person.id}
                onClick={() => {
                  if (onPreviewPerson) {
                    onPreviewPerson(person);
                  } else {
                    onSelectPerson(person.id);
                  }
                }}
                className="py-3.5 px-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#F5F3ED] active:bg-[#EBE8DF] transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <InitialsAvatar name={person.name} size="md" />

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-display font-bold text-sm tracking-tight text-[#17201E] group-hover:text-[#183A35] uppercase truncate">
                        {person.name}
                      </h2>
                      <StatusIndicator status={person.status} showText={false} />
                    </div>

                    <div className="text-xs text-[#68716D] flex items-center gap-1.5 truncate">
                      {terr && (
                        <span className="font-semibold text-[#183A35] uppercase">
                          {terr.name} · T{terr.code}
                        </span>
                      )}
                      <span>·</span>
                      <span className="truncate">{person.address}</span>
                    </div>

                    {latestVisit ? (
                      <p className="text-xs text-[#183A35] font-medium line-clamp-1">
                        "{latestVisit.topic}"
                      </p>
                    ) : (
                      <p className="text-xs text-[#68716D] italic">
                        No visits yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {latestVisit && (
                    <span className="text-[11px] font-mono text-[#68716D] font-medium hidden sm:inline">
                      {latestVisit.visitDate || latestVisit.date}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-[#68716D] group-hover:text-[#183A35] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
