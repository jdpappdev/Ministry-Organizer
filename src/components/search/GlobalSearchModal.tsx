import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, MapPin, BookOpen, Map, ArrowRight } from 'lucide-react';
import { Person, Visit, Territory } from '../../types';
import { EditorialDate } from '../common/EditorialDate';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

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

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
          t.code?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      )
    : [];

  const hasResults =
    matchedPeople.length > 0 || matchedVisits.length > 0 || matchedTerritories.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 md:pt-24 bg-[#102C29]/40 backdrop-blur-xs cursor-default"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#FCFBF8] border border-[#DCDDD5] rounded-[18px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 cursor-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Global Search"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#DCDDD5] bg-white">
          <Search className="w-5 h-5 text-[#68716D] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, territories, topics..."
            className="w-full text-sm bg-transparent placeholder-[#68716D] text-[#17201E] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#68716D] hover:text-[#17201E]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#68716D] bg-[#F5F3ED] border border-[#DCDDD5] rounded">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!q && (
            <div className="py-8 text-center text-xs text-[#68716D]">
              <p className="font-medium text-[#17201E] mb-1">Search the Ministry Journal</p>
              <p>Find records by person name, conversation topic, or territory</p>
            </div>
          )}

          {q && !hasResults && (
            <div className="py-8 text-center text-xs text-[#68716D]">
              <p className="font-medium text-[#17201E] mb-1">No matching records found</p>
              <p>Try searching for a different keyword or check spelling</p>
            </div>
          )}

          {/* People Results */}
          {matchedPeople.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#68716D] px-2 mb-1.5">
                People ({matchedPeople.length})
              </div>
              <div className="space-y-1">
                {matchedPeople.map((person) => {
                  const terr = territories.find((t) => t.id === person.territoryId);
                  return (
                    <button
                      key={person.id}
                      onClick={() => {
                        onSelectPerson(person.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F5F3ED] text-left transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-[#183A35]/8 flex items-center justify-center text-[#183A35] shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-medium text-[#17201E] group-hover:text-[#183A35]">
                            {person.name}
                          </div>
                          <div className="text-xs text-[#68716D] flex items-center gap-1.5 truncate">
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
                      <ArrowRight className="w-4 h-4 text-[#68716D] group-hover:text-[#183A35] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Visits Results */}
          {matchedVisits.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#68716D] px-2 mb-1.5">
                Visit Notes & Topics ({matchedVisits.length})
              </div>
              <div className="space-y-1">
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
                      className="w-full flex items-start justify-between p-2.5 rounded-lg hover:bg-[#F5F3ED] text-left transition-colors group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-[#B87545]/10 flex items-center justify-center text-[#B87545] shrink-0 mt-0.5">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[#17201E]">
                            {visit.topic}
                          </div>
                          <p className="text-xs text-[#68716D] line-clamp-1 mt-0.5">
                            {visit.conversationDetails || visit.conversation}
                          </p>
                          <div className="text-[11px] text-[#68716D] mt-1 flex items-center gap-1.5">
                            <span>{person ? person.name : 'Unknown'}</span>
                            <span>·</span>
                            <EditorialDate dateString={visit.visitDate || visit.date} format="compact" />
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#68716D] group-hover:text-[#183A35] shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Territories Results */}
          {matchedTerritories.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#68716D] px-2 mb-1.5">
                Territories ({matchedTerritories.length})
              </div>
              <div className="space-y-1">
                {matchedTerritories.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTerritory(t.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#F5F3ED] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-[#B99A62]/15 flex items-center justify-center text-[#B99A62] shrink-0">
                        <Map className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-medium text-[#17201E]">
                          {t.name} <span className="text-xs text-[#68716D] font-normal">({t.code})</span>
                        </div>
                        {t.description && (
                          <div className="text-xs text-[#68716D] truncate">{t.description}</div>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#68716D] group-hover:text-[#183A35] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
