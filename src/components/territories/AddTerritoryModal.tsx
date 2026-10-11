import React, { useState, useEffect } from 'react';
import { X, Map, Compass, Edit2, Trash2 } from 'lucide-react';
import { Territory } from '../../types';
import { NewTerritoryInput } from '../../data/store';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface AddTerritoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  territoryToEdit?: Territory | null;
  onSave: (territory: NewTerritoryInput) => void;
  onUpdate?: (id: string, updates: Partial<Territory>) => void;
  onDelete?: (id: string) => void;
}

export const AddTerritoryModal: React.FC<AddTerritoryModalProps> = ({
  isOpen,
  onClose,
  territoryToEdit,
  onSave,
  onUpdate,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [boundaryNotes, setBoundaryNotes] = useState('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      if (territoryToEdit) {
        setName(territoryToEdit.name || '');
        setCode(territoryToEdit.code || '');
        setDescription(territoryToEdit.description || '');
        setBoundaryNotes(territoryToEdit.boundaryNotes || '');
      } else {
        setName('');
        setCode('');
        setDescription('');
        setBoundaryNotes('');
      }
      setIsConfirmDeleteOpen(false);
    }
  }, [isOpen, territoryToEdit]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (territoryToEdit && onUpdate) {
      onUpdate(territoryToEdit.id, {
        name: name.trim(),
        code: code.trim().toUpperCase() || territoryToEdit.code,
        description: description.trim() || undefined,
        boundaryNotes: boundaryNotes.trim() || undefined,
      });
    } else {
      onSave({
        name: name.trim(),
        code: code.trim().toUpperCase() || undefined,
        description: description.trim() || undefined,
        boundaryNotes: boundaryNotes.trim() || undefined,
      });
    }

    onClose();
  };

  const handleConfirmDelete = () => {
    if (!territoryToEdit || !onDelete) return;
    onDelete(territoryToEdit.id);
    setIsConfirmDeleteOpen(false);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center sm:p-4 bg-[#102C29]/40 backdrop-blur-xs cursor-default"
        onClick={onClose}
      >
        <div
          className="relative w-full sm:max-w-lg bg-[#FCFBF8] border-t sm:border border-[#DCDDD5] rounded-t-[20px] sm:rounded-[18px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom duration-200 cursor-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="territory-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#DCDDD5] bg-[#F5F3ED]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#183A35] flex items-center justify-center text-white shadow-2xs">
                <Map className="w-4 h-4" />
              </div>
              <h2 id="territory-modal-title" className="font-display font-bold text-base text-[#17201E]">
                {territoryToEdit ? 'Edit Territory' : 'New Territory'}
              </h2>
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

          <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-[#17201E] mb-1">
                Territory Name <span className="text-[#B87545]">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter territory name"
                className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-[12px] focus:outline-none focus:border-[#183A35]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17201E] mb-1">
                  Code <span className="text-xs text-[#68716D] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Code"
                  className="w-full h-12 px-3 text-sm bg-white border border-[#DCDDD5] rounded-[12px] focus:outline-none focus:border-[#183A35]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#17201E] mb-1">
                  Boundary / Sector Notes
                </label>
                <input
                  type="text"
                  value={boundaryNotes}
                  onChange={(e) => setBoundaryNotes(e.target.value)}
                  placeholder="Boundaries, streets, or sector landmarks"
                  className="w-full h-12 px-3.5 text-sm bg-white border border-[#DCDDD5] rounded-[12px] focus:outline-none focus:border-[#183A35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17201E] mb-1">
                Description / Housing Type
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a short description or housing context"
                className="w-full p-3 text-sm bg-white border border-[#DCDDD5] rounded-[12px] focus:outline-none focus:border-[#183A35]"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#DCDDD5] gap-3">
              {territoryToEdit && onDelete ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="text-xs font-semibold text-red-700/80 hover:text-red-800 hover:underline py-2"
                >
                  Delete territory
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="h-11 px-6 text-xs font-semibold text-white bg-[#183A35] hover:bg-[#102C29] active:scale-[0.98] rounded-[10px] transition-all shadow-xs"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Safe In-App Confirmation Modal for Territory Delete */}
      <ConfirmDeleteModal
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete territory?"
        description="People assigned here will become unassigned."
      />
    </>
  );
};
