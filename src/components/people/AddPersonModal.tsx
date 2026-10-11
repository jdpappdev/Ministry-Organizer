import React, { useState, useEffect } from 'react';
import { X, User, MapPin, BookOpen, Calendar, Compass, ArrowRight, ArrowLeft } from 'lucide-react';
import { Territory, GenderType, StatusType, PersonLocation } from '../../types';
import { NewPersonInput, NewVisitInput } from '../../data/store';
import { Select } from '../common/Select';
import { LocationCaptureField } from '../common/LocationCaptureField';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  territories: Territory[];
  onSave: (person: NewPersonInput, firstVisit?: Omit<NewVisitInput, 'personId'>) => void;
  initialTerritoryId?: string;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({
  isOpen,
  onClose,
  territories,
  onSave,
  initialTerritoryId,
}) => {
  const [activeStep, setActiveStep] = useState<'who_where' | 'about' | 'today_next'>('who_where');

  useBodyScrollLock(isOpen);

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

  // Fields: WHO & WHERE
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<PersonLocation | null>(null);
  const [territoryId, setTerritoryId] = useState(
    initialTerritoryId || (territories[0]?.id ?? '')
  );

  // Fields: ABOUT
  const [gender, setGender] = useState<GenderType>('unspecified');
  const [age, setAge] = useState<string>('');
  const [background, setBackground] = useState('');
  const [remarks, setRemarks] = useState('');

  // Fields: TODAY & NEXT
  const [logFirstVisit, setLogFirstVisit] = useState(true);
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [visitTopic, setVisitTopic] = useState('');
  const [visitConversation, setVisitConversation] = useState('');
  const [nextTopic, setNextTopic] = useState('');
  const [visitRemarks, setVisitRemarks] = useState('');

  if (!isOpen) return null;

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !territoryId) return;

    const personInput: NewPersonInput = {
      name: name.trim(),
      gender,
      age: age ? parseInt(age, 10) : undefined,
      address: address.trim(),
      location: location || undefined,
      phone: phone.trim() || undefined,
      background: background.trim() || undefined,
      remarks: remarks.trim() || undefined,
      territoryId,
      status: nextTopic ? 'needs_attention' : 'active',
    };

    let firstVisit: Omit<NewVisitInput, 'personId'> | undefined = undefined;
    if (logFirstVisit && visitTopic.trim()) {
      firstVisit = {
        visitDate,
        date: visitDate,
        topic: visitTopic.trim(),
        conversationDetails: visitConversation.trim(),
        conversation: visitConversation.trim(),
        nextTopic: nextTopic.trim() || undefined,
        remarks: visitRemarks.trim() || undefined,
      };
    }

    onSave(personInput, firstVisit);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 bg-[#102C29]/40 backdrop-blur-xs cursor-default"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-xl bg-[#FCFBF8] border-t sm:border border-[#DCDDD5] rounded-t-[20px] sm:rounded-[20px] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 cursor-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-encounter-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Step indicator */}
        <div className="px-5 py-4 border-b border-[#DCDDD5] bg-[#F5F3ED] flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B87545]">
              RECORD ENCOUNTER
            </span>
            <h2 id="add-encounter-title" className="font-display font-bold text-lg text-[#17201E]">
              {activeStep === 'who_where' && '1. Who & Where'}
              {activeStep === 'about' && '2. Personal Context'}
              {activeStep === 'today_next' && '3. Today & Next Visit'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#68716D] hover:text-[#17201E] rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress dots */}
        <div className="grid grid-cols-3 h-1 bg-[#DCDDD5]">
          <div className={`h-full bg-[#183A35] ${activeStep === 'who_where' ? 'col-span-1' : activeStep === 'about' ? 'col-span-2' : 'col-span-3'} transition-all duration-300`} />
        </div>

        {/* Form Body */}
        <form onSubmit={handleFinish} className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: WHO & WHERE */}
          {activeStep === 'who_where' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#183A35]">
                  WHO DID YOU VISIT?
                </span>
                <p className="text-xs text-[#68716D]">
                  Enter the individual or family name.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17201E] mb-1">
                  Full Name <span className="text-[#B87545]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter person's name"
                  className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-xl focus:outline-none focus:border-[#183A35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17201E] mb-1">
                  Phone / Contact Details
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone or contact info"
                  className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-xl focus:outline-none focus:border-[#183A35]"
                />
              </div>

              <div className="space-y-1 pt-2 border-t border-[#DCDDD5]/60">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#183A35]">
                  WHERE ARE THEY LOCATED?
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17201E] mb-1">
                  Address / Residence Landmark <span className="text-[#B87545]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address or landmark"
                  className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-xl focus:outline-none focus:border-[#183A35]"
                />
              </div>

              {/* Optional GPS Location Capture */}
              <LocationCaptureField
                location={location}
                onChange={setLocation}
              />

              <div>
                <label className="block text-xs font-semibold text-[#17201E] mb-1">
                  Assigned Territory <span className="text-[#B87545]">*</span>
                </label>
                <Select
                  value={territoryId}
                  onChange={(val) => setTerritoryId(val)}
                  size="lg"
                  options={territories.map((t) => ({
                    value: t.id,
                    label: `${t.code ? `Territory ${t.code}: ` : ''}${t.name}`,
                  }))}
                  ariaLabel="Assigned territory"
                />
              </div>
            </div>
          )}

          {/* STEP 2: ABOUT */}
          {activeStep === 'about' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#183A35]">
                  ABOUT THIS PERSON
                </span>
                <p className="text-xs text-[#68716D]">
                  Context helps tailor future scriptural discussions.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17201E] mb-1">
                    Gender
                  </label>
                  <Select
                    value={gender}
                    onChange={(val) => setGender(val as GenderType)}
                    size="lg"
                    options={[
                      { value: 'unspecified', label: 'Unspecified / Family' },
                      { value: 'female', label: 'Female' },
                      { value: 'male', label: 'Male' },
                    ]}
                    ariaLabel="Gender"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17201E] mb-1">
                    Approx. Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Age in years"
                    className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-xl focus:outline-none focus:border-[#183A35]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17201E] mb-1">
                  Background Context & Family
                </label>
                <textarea
                  rows={3}
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  placeholder="Add background context or family notes"
                  className="w-full p-3 text-sm bg-white border border-[#DCDDD5] rounded-xl focus:outline-none focus:border-[#183A35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17201E] mb-1">
                  Visiting Schedule Remarks / Best Hours
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add visiting remarks or best hours"
                  className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-xl focus:outline-none focus:border-[#183A35]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: TODAY & NEXT */}
          {activeStep === 'today_next' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#183A35]">
                  TODAY'S CONVERSATION
                </span>
                <label className="text-xs text-[#68716D] flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={logFirstVisit}
                    onChange={(e) => setLogFirstVisit(e.target.checked)}
                    className="rounded text-[#183A35]"
                  />
                  <span>Record visit notes</span>
                </label>
              </div>

              {logFirstVisit && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#17201E] mb-1">
                        Visit Date
                      </label>
                      <input
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full h-12 px-3 text-sm bg-white border border-[#DCDDD5] rounded-xl focus:outline-none focus:border-[#183A35]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#17201E] mb-1">
                        Topic Discussed
                      </label>
                      <input
                        type="text"
                        value={visitTopic}
                        onChange={(e) => setVisitTopic(e.target.value)}
                        placeholder="What was discussed?"
                        className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-xl focus:outline-none focus:border-[#183A35]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#17201E] mb-1">
                      Conversation Details & Scriptures
                    </label>
                    <textarea
                      rows={3}
                      value={visitConversation}
                      onChange={(e) => setVisitConversation(e.target.value)}
                      placeholder="Add conversation details and scriptures"
                      className="w-full p-3 text-sm bg-white border border-[#DCDDD5] rounded-xl focus:outline-none focus:border-[#183A35]"
                    />
                  </div>

                  <div className="space-y-1 pt-2 border-t border-[#DCDDD5]/60">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#B87545]">
                      NEXT FOLLOW-UP PLAN
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#17201E] mb-1">
                      Next Topic to Discuss
                    </label>
                    <input
                      type="text"
                      value={nextTopic}
                      onChange={(e) => setNextTopic(e.target.value)}
                      placeholder="What would you like to discuss next?"
                      className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-xl focus:outline-none focus:border-[#183A35]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#17201E] mb-1">
                      Literature Left / Remarks
                    </label>
                    <input
                      type="text"
                      value={visitRemarks}
                      onChange={(e) => setVisitRemarks(e.target.value)}
                      placeholder="Literature placed, arrangements, or notes"
                      className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-xl focus:outline-none focus:border-[#183A35]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls (48px height) */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-[#DCDDD5]">
            {activeStep !== 'who_where' ? (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 'today_next') setActiveStep('about');
                  else if (activeStep === 'about') setActiveStep('who_where');
                }}
                className="h-12 px-4 flex items-center gap-1.5 text-xs font-semibold text-[#68716D] hover:text-[#17201E] rounded-xl border border-[#DCDDD5]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="h-12 px-4 text-xs font-semibold text-[#68716D] hover:text-[#17201E]"
              >
                Cancel
              </button>
            )}

            {activeStep !== 'today_next' ? (
              <button
                type="button"
                disabled={activeStep === 'who_where' && (!name.trim() || !address.trim())}
                onClick={() => {
                  if (activeStep === 'who_where') setActiveStep('about');
                  else if (activeStep === 'about') setActiveStep('today_next');
                }}
                className="h-12 px-6 flex items-center gap-2 text-xs font-semibold text-white bg-[#183A35] hover:bg-[#102C29] disabled:opacity-50 rounded-xl transition-all shadow-xs ml-auto"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!name.trim() || !address.trim()}
                className="h-12 px-6 flex items-center justify-center text-xs font-semibold text-white bg-[#183A35] hover:bg-[#102C29] rounded-xl transition-all shadow-xs ml-auto"
              >
                Save Field Entry
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
