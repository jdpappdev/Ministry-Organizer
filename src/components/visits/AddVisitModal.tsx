import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Person, Visit } from '../../types';
import { NewVisitInput } from '../../data/store';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { Select } from '../common/Select';
import { getLocalDateKey } from '../../utils/dateUtils';
import { FloatingCardModal } from '../common/BottomSheet';

interface AddVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  selectedPersonId?: string;
  visitToEdit?: Visit | null;
  onSave: (visit: NewVisitInput) => void;
  onUpdate?: (id: string, updates: Partial<Visit>) => void;
  onDelete?: (id: string) => void;
}

export const AddVisitModal: React.FC<AddVisitModalProps> = ({
  isOpen,
  onClose,
  people,
  selectedPersonId,
  visitToEdit,
  onSave,
  onUpdate,
  onDelete,
}) => {
  const [personId, setPersonId] = useState(
    visitToEdit?.personId || selectedPersonId || (people[0]?.id ?? '')
  );
  const [visitDate, setVisitDate] = useState(() =>
    visitToEdit ? (visitToEdit.visitDate || visitToEdit.date) : getLocalDateKey()
  );
  const [topic, setTopic] = useState(visitToEdit?.topic || '');
  const [conversationDetails, setConversationDetails] = useState(
    visitToEdit?.conversationDetails ?? visitToEdit?.conversation ?? ''
  );
  const [nextTopic, setNextTopic] = useState(visitToEdit?.nextTopic || '');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(visitToEdit?.nextFollowUpDate || '');
  const [remarks, setRemarks] = useState(visitToEdit?.remarks || '');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Synchronize state when modal opens or target changes
  useEffect(() => {
    if (isOpen) {
      if (visitToEdit) {
        setPersonId(visitToEdit.personId);
        setVisitDate(visitToEdit.visitDate || visitToEdit.date);
        setTopic(visitToEdit.topic);
        setConversationDetails(visitToEdit.conversationDetails ?? visitToEdit.conversation ?? '');
        setNextTopic(visitToEdit.nextTopic || '');
        setNextFollowUpDate(visitToEdit.nextFollowUpDate || '');
        setRemarks(visitToEdit.remarks || '');
      } else {
        setPersonId(selectedPersonId || (people[0]?.id ?? ''));
        setVisitDate(getLocalDateKey());
        setTopic('');
        setConversationDetails('');
        setNextTopic('');
        setNextFollowUpDate('');
        setRemarks('');
      }
      setIsConfirmDeleteOpen(false);
    }
  }, [isOpen, visitToEdit, selectedPersonId, people]);

  if (!isOpen) return null;

  const targetPerson = people.find((p) => p.id === personId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId || !topic.trim()) return;

    if (visitToEdit && onUpdate) {
      onUpdate(visitToEdit.id, {
        visitDate,
        date: visitDate,
        topic: topic.trim(),
        conversationDetails: conversationDetails.trim(),
        conversation: conversationDetails.trim(),
        nextTopic: nextTopic.trim() || undefined,
        nextFollowUpDate: nextFollowUpDate.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });
    } else {
      onSave({
        personId,
        visitDate,
        date: visitDate,
        topic: topic.trim(),
        conversationDetails: conversationDetails.trim(),
        conversation: conversationDetails.trim(),
        nextTopic: nextTopic.trim() || undefined,
        nextFollowUpDate: nextFollowUpDate.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });
    }

    onClose();
  };

  const handleConfirmDelete = () => {
    if (!visitToEdit || !onDelete) return;
    onDelete(visitToEdit.id);
    setIsConfirmDeleteOpen(false);
    onClose();
  };

  return (
    <>
      <FloatingCardModal
        isOpen={isOpen}
        onClose={onClose}
        title={visitToEdit ? 'Edit Visit Record' : 'Record Ministry Visit'}
        subtitle={targetPerson ? `With ${targetPerson.name} · ${targetPerson.address}` : 'Field conversation log'}
        maxWidthClass="max-w-[480px]"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Person Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#1B2421] mb-1">
              Person <span className="text-[#C2571A]">*</span>
            </label>
            <Select
              value={personId}
              onChange={(val) => setPersonId(val)}
              disabled={Boolean(visitToEdit) || Boolean(selectedPersonId)}
              size="lg"
              options={people.map((p) => ({
                value: p.id,
                label: p.name,
                sublabel: p.address,
              }))}
              ariaLabel="Person"
            />
          </div>

          {/* Visit Date */}
          <div>
            <label className="block text-xs font-semibold text-[#1B2421] mb-1">
              Visit Date <span className="text-[#C2571A]">*</span>
            </label>
            <input
              type="date"
              required
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full h-12 px-3.5 text-sm bg-white border border-[#E6E0D2] rounded-[12px] focus:outline-none focus:border-[#1F3D36] text-[#1B2421]"
            />
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-[#1B2421] mb-1">
              Discussion Topic <span className="text-[#C2571A]">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus={!visitToEdit}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Hope for the future, Prayer, Family life"
              className="w-full h-12 px-3.5 text-sm bg-white border border-[#E6E0D2] rounded-[12px] focus:outline-none focus:border-[#1F3D36] text-[#1B2421]"
            />
          </div>

          {/* Conversation details */}
          <div>
            <label className="block text-xs font-semibold text-[#1B2421] mb-1">
              Conversation Notes & Scripture
            </label>
            <textarea
              rows={3}
              value={conversationDetails}
              onChange={(e) => setConversationDetails(e.target.value)}
              placeholder="Add key thoughts, scriptures shared, or family context"
              className="w-full p-3 text-sm bg-white border border-[#E6E0D2] rounded-[12px] focus:outline-none focus:border-[#1F3D36] text-[#1B2421]"
            />
          </div>

          {/* Follow-up planning */}
          <div className="pt-2 border-t border-[#E6E0D2] space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5F6B66]">
              Follow-Up Arrangement
            </span>

            <div>
              <label className="block text-xs font-semibold text-[#1B2421] mb-1">
                Next Topic to Discuss
              </label>
              <input
                type="text"
                value={nextTopic}
                onChange={(e) => setNextTopic(e.target.value)}
                placeholder="What did you arrange to discuss next?"
                className="w-full h-12 px-3.5 text-sm bg-white border border-[#E6E0D2] rounded-[12px] focus:outline-none focus:border-[#1F3D36] text-[#1B2421]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B2421] mb-1">
                Planned Date for Next Visit
              </label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full h-12 px-3.5 text-sm bg-white border border-[#E6E0D2] rounded-[12px] focus:outline-none focus:border-[#1F3D36] text-[#1B2421]"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-[#1B2421] mb-1">
              Literature Left / Observations
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Literature placed, arrangements, or notes"
              className="w-full h-12 px-3.5 text-sm bg-white border border-[#E6E0D2] rounded-[12px] focus:outline-none focus:border-[#1F3D36] text-[#1B2421]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E6E0D2] gap-3">
            {visitToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="text-xs font-semibold text-[#A63C1E] hover:underline flex items-center gap-1.5 py-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="btn-tactile-secondary px-5 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-tactile-primary px-6 text-sm"
              >
                {visitToEdit ? 'Save Changes' : 'Save Visit Log'}
              </button>
            </div>
          </div>
        </form>
      </FloatingCardModal>

      {/* Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete this visit?"
        description="This visit record will be permanently removed."
      />
    </>
  );
};
