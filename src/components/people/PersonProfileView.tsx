import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Phone,
  MapPin,
  Clock,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  Bookmark,
} from 'lucide-react';
import { Person, PersonLocation, Visit, Territory } from '../../types';
import { EditorialDate } from '../common/EditorialDate';
import { StatusIndicator } from '../common/StatusIndicator';
import { TopographicPattern } from '../common/TopographicBackground';
import { InitialsAvatar } from '../common/InitialsAvatar';
import { AddVisitModal } from '../visits/AddVisitModal';
import { RescheduleFollowUpModal } from '../schedule/RescheduleFollowUpModal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { LocationCaptureField } from '../common/LocationCaptureField';
import { NewVisitInput } from '../../data/store';

interface PersonProfileViewProps {
  person: Person;
  territory?: Territory;
  territories?: Territory[];
  visits: Visit[];
  onBack: () => void;
  onRecordVisit: (visit: NewVisitInput) => void;
  onUpdateVisit?: (id: string, updates: Partial<Visit>) => void;
  onDeleteVisit?: (id: string) => void;
  onUpdatePerson: (id: string, updates: Partial<Person>) => void;
  onDeletePerson: (id: string) => void;
  allPeople: Person[];
}

export const PersonProfileView: React.FC<PersonProfileViewProps> = ({
  person,
  territory,
  territories = [],
  visits,
  onBack,
  onRecordVisit,
  onUpdateVisit,
  onDeleteVisit,
  onUpdatePerson,
  onDeletePerson,
  allPeople,
}) => {
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [selectedVisitToEdit, setSelectedVisitToEdit] = useState<Visit | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDeletePersonOpen, setIsConfirmDeletePersonOpen] = useState(false);

  // Edit fields
  const [name, setName] = useState(person.name);
  const [territoryId, setTerritoryId] = useState(person.territoryId);
  const [address, setAddress] = useState(person.address);
  const [location, setLocation] = useState<PersonLocation | null>(person.location || null);
  const [phone, setPhone] = useState(person.phone || '');
  const [background, setBackground] = useState(person.background || '');
  const [remarks, setRemarks] = useState(person.remarks || '');

  useEffect(() => {
    setName(person.name);
    setTerritoryId(person.territoryId);
    setAddress(person.address);
    setLocation(person.location || null);
    setPhone(person.phone || '');
    setBackground(person.background || '');
    setRemarks(person.remarks || '');
  }, [person]);

  // Sorted visits in reverse chronological order: newest first
  const sortedVisits = [...visits].sort((a, b) => {
    const dateA = new Date(a.visitDate || a.date).getTime();
    const dateB = new Date(b.visitDate || b.date).getTime();
    return dateB - dateA;
  });

  const latestVisit = sortedVisits[0];

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();

    onUpdatePerson(person.id, {
      name: name.trim(),
      territoryId,
      address: address.trim(),
      location: location || null,
      phone: phone.trim() || undefined,
      background: background.trim() || undefined,
      remarks: remarks.trim() || undefined,
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* 1. TOP NAV: ← People */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="h-11 px-3 -ml-2 inline-flex items-center gap-2 text-xs font-semibold text-[#183A35] hover:text-[#102C29] active:scale-95 transition-all rounded-[10px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>People</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2.5 text-[#68716D] hover:text-[#183A35] hover:bg-[#F5F3ED] rounded-[10px] transition-colors"
            aria-label="Edit Profile"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsConfirmDeletePersonOpen(true)}
            className="p-2.5 text-[#68716D] hover:text-red-700 hover:bg-red-50 rounded-[10px] transition-colors"
            aria-label="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. PROFILE HERO SURFACE (Level 1 raised, title-case name, strong date marker) */}
      <div className="relative level-1-raised p-6 sm:p-7 overflow-hidden">
        <TopographicPattern opacity={0.05} />

        <div className="relative z-10 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <StatusIndicator status={person.status} />
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#1B2421]">
                {person.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5F6B66] pt-0.5">
                {territory && (
                  <span className="font-semibold text-[#1F3D36]">
                    {territory.name} · T{territory.code}
                  </span>
                )}
                <span>·</span>
                <span className="flex items-center gap-1 font-medium text-[#1B2421]">
                  <MapPin className="w-3.5 h-3.5 text-[#1F3D36]" />
                  {person.address}
                </span>
              </div>
            </div>

            <InitialsAvatar name={person.name} size="lg" />
          </div>

          {/* Last Visit Editorial Anchor Line & Active Follow-up */}
          {latestVisit ? (
            <div className="pt-2 border-t border-[#E6E0D2] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <EditorialDate dateString={latestVisit.visitDate || latestVisit.date} format="compact" />
                  <span className="text-xs text-[#5F6B66] truncate">
                    Last visited · <span className="text-[#1F3D36] font-semibold">"{latestVisit.topic}"</span>
                  </span>
                </div>
              </div>

              {latestVisit.nextFollowUpDate && (
                <div className="flex items-center justify-between bg-[#F5F1E8] border border-[#E6E0D2] rounded-[12px] p-2.5">
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#1F3D36]" />
                    <span className="font-semibold text-[#1F3D36]">
                      Active follow-up: {latestVisit.nextFollowUpDate}
                    </span>
                    {latestVisit.nextTopic && (
                      <span className="text-[#5F6B66] hidden sm:inline">({latestVisit.nextTopic})</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRescheduleOpen(true)}
                    className="btn-tactile-secondary h-8 px-3 text-xs"
                  >
                    Reschedule
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="pt-2 border-t border-[#E6E0D2] text-xs text-[#5F6B66] italic">
              No visits recorded yet
            </div>
          )}
        </div>
      </div>

      {/* PRIMARY ACTIONS: [ Record Visit ] [ Schedule Visit ] */}
      <div className="grid grid-cols-2 gap-3.5">
        <button
          onClick={() => {
            setSelectedVisitToEdit(null);
            setIsVisitModalOpen(true);
          }}
          className="btn-tactile-primary text-xs"
        >
          <Plus className="w-4 h-4 mr-1" />
          <span>Record Visit</span>
        </button>

        <button
          onClick={() => {
            if (latestVisit) {
              setIsRescheduleOpen(true);
            } else {
              setSelectedVisitToEdit(null);
              setIsVisitModalOpen(true);
            }
          }}
          className="btn-tactile-secondary text-xs"
        >
          <Calendar className="w-4 h-4 text-[#1F3D36] mr-1" />
          <span>{latestVisit?.nextFollowUpDate ? 'Follow-Up' : 'Plan Visit'}</span>
        </button>
      </div>

      {/* EDIT FORM (if toggled) */}
      {isEditing && (
        <form
          onSubmit={handleSaveEdit}
          className="bg-[#FCFBF8] border border-[#DCDDD5] rounded-[16px] p-5 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-[#DCDDD5] pb-2">
            <h3 className="font-display font-semibold text-sm text-[#183A35]">
              Edit Field Details
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-[#68716D]"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-[#17201E] mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter person's name"
                className="w-full h-11 px-3 border border-[#DCDDD5] rounded-[10px] text-sm bg-white"
              />
            </div>

            <div>
              <label className="block font-medium text-[#17201E] mb-1">Assigned Territory</label>
              <select
                value={territoryId}
                onChange={(e) => setTerritoryId(e.target.value)}
                className="w-full h-11 px-3 border border-[#DCDDD5] rounded-[10px] text-sm bg-white font-medium"
              >
                {territories.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.code ? `T${t.code} · ` : ''}{t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-[#17201E] mb-1">Location / Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address or landmark"
                className="w-full h-11 px-3 border border-[#DCDDD5] rounded-[10px] text-sm bg-white"
              />
            </div>

            {/* Optional Map Location Capture */}
            <LocationCaptureField
              location={location}
              onChange={setLocation}
            />

            <div>
              <label className="block font-medium text-[#17201E] mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone or contact info"
                className="w-full h-11 px-3 border border-[#DCDDD5] rounded-[10px] text-sm bg-white"
              />
            </div>
            <div>
              <label className="block font-medium text-[#17201E] mb-1">Background Context</label>
              <textarea
                rows={2}
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="Add background context or family notes"
                className="w-full p-3 border border-[#DCDDD5] rounded-[10px] text-sm bg-white"
              />
            </div>
            <div>
              <label className="block font-medium text-[#17201E] mb-1">Visiting Remarks / Schedule</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add visiting remarks or best hours"
                className="w-full h-11 px-3 border border-[#DCDDD5] rounded-[10px] text-sm bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-tactile-secondary px-4 text-xs h-10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile-primary px-5 text-xs h-10"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* 3. BACKGROUND & CONTEXT SECTION */}
      <div className="space-y-4 border-t border-[#DCDDD5]/70 pt-5">
        <div className="space-y-1.5">
          <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#B87545]">
            BACKGROUND & CONTEXT
          </h2>
          <p className="text-sm text-[#17201E] leading-relaxed">
            {person.background || 'No background information logged yet.'}
          </p>

          {person.phone && (
            <div className="pt-1 text-xs text-[#68716D] flex items-center gap-1.5 font-mono">
              <Phone className="w-3.5 h-3.5 text-[#B87545]" />
              <span>{person.phone}</span>
            </div>
          )}
        </div>

        {/* REMARKS SECTION */}
        {person.remarks && (
          <div className="space-y-1.5 pt-2 border-t border-[#DCDDD5]/40">
            <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#68716D]">
              REMARKS
            </h2>
            <p className="text-xs text-[#17201E]/90 leading-relaxed">
              {person.remarks}
            </p>
          </div>
        )}
      </div>

      {/* 4. NEXT TOPIC (Soft Surface) */}
      {latestVisit?.nextTopic && (
        <div className="p-4 rounded-[14px] bg-[#F5F3ED] border border-[#DCDDD5] space-y-1">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B87545]">
            NEXT DISCUSSION TOPIC
          </div>
          <p className="font-display font-bold text-base text-[#183A35]">
            {latestVisit.nextTopic}
          </p>
          <button
            onClick={() => {
              setSelectedVisitToEdit(null);
              setIsVisitModalOpen(true);
            }}
            className="text-xs font-semibold text-[#B87545] hover:text-[#183A35] pt-1 inline-flex items-center gap-1"
          >
            <span>Record follow-up on this topic</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5. VISIT HISTORY: Reverse Chronological Order */}
      <div className="space-y-3 pt-3">
        <div className="flex items-center justify-between border-b border-[#DCDDD5] pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#183A35]" />
            <h2 className="font-display font-bold text-base uppercase tracking-tight text-[#17201E]">
              VISIT HISTORY
            </h2>
            <span className="text-xs text-[#68716D]">({sortedVisits.length})</span>
          </div>

          <button
            onClick={() => {
              setSelectedVisitToEdit(null);
              setIsVisitModalOpen(true);
            }}
            className="text-xs font-semibold text-[#183A35] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Visit</span>
          </button>
        </div>

        {sortedVisits.length === 0 ? (
          <div className="bg-white border border-dashed border-[#E6E0D2] rounded-[16px] p-8 text-center text-xs text-[#5F6B66] space-y-2">
            <BookOpen className="w-6 h-6 mx-auto opacity-40 text-[#1F3D36]" />
            <p className="font-semibold text-sm text-[#1B2421]">No visits recorded yet</p>
            <p>Log your initial conversation and scriptural notes.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {sortedVisits.map((visit) => {
              const details = visit.conversationDetails || visit.conversation;
              const dateVal = visit.visitDate || visit.date;

              return (
                <div key={visit.id} className="list-card p-4 flex items-start gap-4 group select-none">
                  {/* Editorial Column Date Marker */}
                  <EditorialDate dateString={dateVal} format="column" />

                  {/* Content */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display font-bold text-base text-[#1F3D36]">
                        {visit.topic}
                      </span>

                      {/* Edit Button */}
                      {onUpdateVisit && (
                        <button
                          onClick={() => {
                            setSelectedVisitToEdit(visit);
                            setIsVisitModalOpen(true);
                          }}
                          className="w-8 h-8 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#5F6B66] hover:text-[#1F3D36] transition-colors cursor-pointer"
                          title="Edit this visit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {details && (
                      <p className="text-xs text-[#1B2421]/90 leading-relaxed whitespace-pre-wrap">
                        {details}
                      </p>
                    )}

                    {visit.nextTopic && (
                      <div className="text-xs text-[#5F6B66] font-medium pt-0.5">
                        Next: {visit.nextTopic}
                      </div>
                    )}

                    {(visit.nextFollowUpDate || visit.remarks) && (
                      <div className="pt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#5F6B66]">
                        {visit.nextFollowUpDate && (
                          <span className="flex items-center gap-1 font-mono font-medium">
                            <Calendar className="w-3 h-3 text-[#1F3D36]" />
                            <span>Planned: {visit.nextFollowUpDate}</span>
                          </span>
                        )}
                        {visit.remarks && <span>Note: {visit.remarks}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => {
          setIsVisitModalOpen(false);
          setSelectedVisitToEdit(null);
        }}
        people={allPeople}
        selectedPersonId={person.id}
        visitToEdit={selectedVisitToEdit}
        onSave={onRecordVisit}
        onUpdate={onUpdateVisit}
        onDelete={onDeleteVisit}
      />

      {latestVisit && (
        <RescheduleFollowUpModal
          isOpen={isRescheduleOpen}
          onClose={() => setIsRescheduleOpen(false)}
          personName={person.name}
          currentDate={latestVisit.nextFollowUpDate || ''}
          visitId={latestVisit.id}
          onSave={(vId, newDate) => {
            if (onUpdateVisit) {
              onUpdateVisit(vId, { nextFollowUpDate: newDate });
            }
          }}
        />
      )}

      {/* Safe In-App Confirmation Modal for Person Delete */}
      <ConfirmDeleteModal
        isOpen={isConfirmDeletePersonOpen}
        onClose={() => setIsConfirmDeletePersonOpen(false)}
        onConfirm={() => {
          onDeletePerson(person.id);
          onBack();
        }}
        title={`Delete ${person.name}?`}
        description="Their visit history will also be removed."
      />
    </div>
  );
};
