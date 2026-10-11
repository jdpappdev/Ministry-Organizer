import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, MapPin, BookOpen, Map, ArrowRight } from 'lucide-react';
import { Person, Visit, Territory } from '../../types';
import { EditorialDate } from '../common/EditorialDate';
import { FloatingCardModal } from '../common/BottomSheet';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  visits: Visit[];
  territories: Territory[];
  onSelectPerson: (personId: string) => void;
  onSelectTerritory: (territoryId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  people,
  visits,
  territories,
  onSelectPerson,
  onSelectTerritory,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedPeople = q
    ? people.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.background?.toLowerCase().includes(q) ||
          p.remarks?.toLowerCase().includes(q)
      )
    : [];

  const matchedVisits = q
    ? visits.filter(
        (v) =>
          v.topic.toLowerCase().includes(q) ||
          (v.conversationDetails || v.conversation || '').toLowerCase().includes(q) ||
          v.nextTopic?.toLowerCase().includes(q) ||
          v.remarks?.toLowerCase().includes(q)
      )
    : [];

  const matchedTerritories = q
    ? territories.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.code && t.code.toLowerCase().includes(q)) ||
          t.description?.toLowerCase().includes(q) ||
          t.boundaryNotes?.toLowerCase().includes(q)
      )
    : [];

  const hasResults =
    matchedPeople.length > 0 || matchedVisits.length > 0 || matchedTerritories.length > 0;

  return (
    <FloatingCardModal
      isOpen={isOpen}
      onClose={onClose}
      title="Search Records"
      subtitle="Find people, conversations, or territories"
      noPadding
    >
      <div className="flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#E6E0D2] bg-[#F5F1E8]">
          <Search className="w-5 h-5 text-[#5F6B66] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, territories, topics..."
            className="w-full text-sm bg-transparent placeholder-[#5F6B66] text-[#1B2421] focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#5F6B66] hover:text-[#1B2421] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Area */}
        <div className="max-h-[50vh] overflow-y-auto p-4 space-y-4">
          {!q && (
            <div className="py-8 text-center text-xs text-[#5F6B66]">
              <p className="font-semibold text-[#1B2421] mb-1">Search the Ministry Journal</p>
              <p>Find records by person name, conversation topic, or territory</p>
            </div>
          )}

          {q && !hasResults && (
            <div className="py-8 text-center text-xs text-[#5F6B66]">
              <p className="font-semibold text-[#1B2421] mb-1">No matching records found</p>
              <p>Try searching for a different keyword or check spelling</p>
            </div>
          )}

          {/* People Results */}
          {matchedPeople.length > 0 && (
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5F6B66] px-2 mb-2">
                People ({matchedPeople.length})
              </div>
              <div className="space-y-1.5">
                {matchedPeople.map((person) => {
                  const terr = territories.find((t) => t.id === person.territoryId);
                  return (
                    <button
                      key={person.id}
                      onClick={() => {
                        onSelectPerson(person.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-[14px] bg-white border border-[#E6E0D2] hover:border-[#1F3D36] text-left transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#1F3D36]/10 flex items-center justify-center text-[#1F3D36] shrink-0 font-display font-bold text-xs">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-semibold text-[#1B2421] group-hover:text-[#1F3D36]">
                            {person.name}
                          </div>
                          <div className="text-xs text-[#5F6B66] flex items-center gap-1.5 truncate mt-0.5">
                            <span>{person.address}</span>
                            {terr && (
                              <>
                                <span>·</span>
                                <span>{terr.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#5F6B66] group-hover:text-[#1F3D36] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Visits Results */}
          {matchedVisits.length > 0 && (
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5F6B66] px-2 mb-2">
                Visit Notes & Topics ({matchedVisits.length})
              </div>
              <div className="space-y-1.5">
                {matchedVisits.map((visit) => {
                  const person = people.find((p) => p.id === visit.personId);
                  return (
                    <button
                      key={visit.id}
                      onClick={() => {
                        if (person) {
                          onSelectPerson(person.id);
                          onClose();
                        }
                      }}
                      className="w-full flex items-start justify-between p-3 rounded-[14px] bg-white border border-[#E6E0D2] hover:border-[#1F3D36] text-left transition-colors group cursor-pointer"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#1F3D36]/10 flex items-center justify-center text-[#1F3D36] shrink-0 mt-0.5">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#1B2421]">
                            {visit.topic}
                          </div>
                          <p className="text-xs text-[#5F6B66] line-clamp-1 mt-0.5">
                            {visit.conversationDetails || visit.conversation}
                          </p>
                          <div className="text-[11px] text-[#5F6B66] mt-1 flex items-center gap-1.5 font-medium">
                            <span>{person ? person.name : 'Unknown'}</span>
                            <span>·</span>
                            <EditorialDate dateString={visit.visitDate || visit.date} format="compact" />
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#5F6B66] group-hover:text-[#1F3D36] shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Territories Results */}
          {matchedTerritories.length > 0 && (
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5F6B66] px-2 mb-2">
                Territories ({matchedTerritories.length})
              </div>
              <div className="space-y-1.5">
                {matchedTerritories.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTerritory(t.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-[14px] bg-white border border-[#E6E0D2] hover:border-[#1F3D36] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-[#1F3D36]/10 flex items-center justify-center text-[#1F3D36] shrink-0">
                        <Map className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-semibold text-[#1B2421]">
                          {t.name} <span className="text-xs text-[#5F6B66] font-normal">({t.code})</span>
                        </div>
                        {t.description && (
                          <div className="text-xs text-[#5F6B66] truncate mt-0.5">{t.description}</div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#5F6B66] group-hover:text-[#1F3D36] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </FloatingCardModal>
  );
};
