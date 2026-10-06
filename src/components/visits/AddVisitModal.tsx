import React, { useState, useEffect } from 'react';
import { X, BookOpen, Calendar, Clock, Bookmark, Trash2 } from 'lucide-react';
import { Person, Visit } from '../../types';
import { NewVisitInput } from '../../data/store';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { Select } from '../common/Select';
import { getLocalDateKey } from '../../utils/dateUtils';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

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
      <div
        className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 bg-[#102C29]/40 backdrop-blur-xs cursor-default"
        onClick={onClose}
      >
        <div
          className="relative w-full sm:max-w-xl bg-[#FCFBF8] border-t sm:border border-[#DCDDD5] rounded-t-[20px] sm:rounded-[18px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200 cursor-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="log-visit-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#DCDDD5] bg-[#F5F3ED]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#183A35] flex items-center justify-center text-white shadow-2xs">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 id="log-visit-title" className="font-display font-bold text-base text-[#17201E] leading-tight">
                  {visitToEdit ? 'Edit Visit Record' : 'Record Ministry Visit'}
                </h2>
                {targetPerson && (
                  <p className="text-[11px] text-[#68716D] font-medium leading-tight">
                    With {targetPerson.name} · {targetPerson.address}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#68716D] hover:text-[#17201E] rounded-lg transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
            {/* Person Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#17201E] mb-1">
                Person <span className="text-[#B87545]">*</span>
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
              <label className="block text-xs font-semibold text-[#17201E] mb-1">
                Visit Date <span className="text-[#B87545]">*</span>
              </label>
              <input
                type="date"
                required
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-[12px] focus:outline-none focus:border-[#183A35]"
              />
            </div>

            {/* Topic Discussed */}
            <div>
              <label className="block text-xs font-semibold text-[#17201E] mb-1">
                Topic Discussed <span className="text-[#B87545]">*</span>
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What was discussed?"
                className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-[12px] focus:outline-none focus:border-[#183A35]"
              />
            </div>

            {/* Conversation Details */}
            <div>
              <label className="block text-xs font-semibold text-[#17201E] mb-1">
                Conversation Details & Scriptures
              </label>
              <textarea
                rows={3}
                value={conversationDetails}
                onChange={(e) => setConversationDetails(e.target.value)}
                placeholder="Add conversation details and scriptures"
                className="w-full p-3 text-sm bg-white border border-[#DCDDD5] rounded-[12px] focus:outline-none focus:border-[#183A35]"
              />
            </div>

            {/* Next Topic and Next Follow-up Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#17201E] mb-1">
                  Next Topic to Discuss
                </label>
                <input
                  type="text"
                  value={nextTopic}
                  onChange={(e) => setNextTopic(e.target.value)}
                  placeholder="What would you like to discuss next?"
                  className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-[12px] focus:outline-none focus:border-[#183A35]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17201E] mb-1">
                  Next Follow-up Date
                </label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-[12px] focus:outline-none focus:border-[#183A35]"
                />
              </div>
            </div>

            {/* Literature Left / Remarks */}
            <div>
              <label className="block text-xs font-semibold text-[#17201E] mb-1">
                Literature Left / Special Remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Literature placed, arrangements, or notes"
                className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-[12px] focus:outline-none focus:border-[#183A35]"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[#DCDDD5] gap-3">
              {visitToEdit && onDelete ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="h-12 px-3 flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 active:scale-95 rounded-[12px] transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Record</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {!visitToEdit && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-12 px-4 text-xs font-semibold text-[#68716D] hover:text-[#17201E] rounded-[12px]"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="h-12 px-6 text-xs font-semibold text-white bg-[#183A35] hover:bg-[#102C29] active:scale-[0.98] rounded-[12px] transition-all shadow-xs"
                >
                  {visitToEdit ? 'Save Changes' : 'Save Visit Log'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* SAFE IN-APP CONFIRMATION MODAL */}
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
