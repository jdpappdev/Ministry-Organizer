import React, { useState, useEffect } from 'react';
import { Map, Compass, Edit2, Trash2 } from 'lucide-react';
import { Territory } from '../../types';
import { NewTerritoryInput } from '../../data/store';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { FloatingCard } from '../common/FloatingCard';

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
      <FloatingCard
        isOpen={isOpen}
        onClose={onClose}
        title={territoryToEdit ? 'Edit Territory' : 'New Territory'}
        subtitle="Geographic field sector"
        icon={<Map className="w-4 h-4 text-[#C9A978]" />}
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1B2421] mb-1">
              Territory Name <span className="text-[#C2571A]">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter territory name"
              className="w-full h-11 px-3.5 text-sm bg-white border border-[#D6CBB8] rounded-[10px] focus:outline-none focus:border-[#1F3D36] text-[#1B2421]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1B2421] mb-1">
                Code <span className="text-xs text-[#5F6B66] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Code"
                className="w-full h-11 px-3 text-sm bg-white border border-[#D6CBB8] rounded-[10px] focus:outline-none focus:border-[#1F3D36] text-[#1B2421]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#1B2421] mb-1">
                Boundary / Sector Notes
              </label>
              <input
                type="text"
                value={boundaryNotes}
                onChange={(e) => setBoundaryNotes(e.target.value)}
                placeholder="Boundaries, streets, or landmarks"
                className="w-full h-11 px-3.5 text-sm bg-white border border-[#D6CBB8] rounded-[10px] focus:outline-none focus:border-[#1F3D36] text-[#1B2421]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1B2421] mb-1">
              Description / Housing Type
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add short description or housing context"
              className="w-full p-3 text-sm bg-white border border-[#D6CBB8] rounded-[10px] focus:outline-none focus:border-[#1F3D36] text-[#1B2421]"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#D6CBB8] gap-3">
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
              className="h-10 px-5 text-xs font-semibold text-[#F6F1E5] bg-[#1F3D36] hover:bg-[#102C29] active:scale-[0.98] rounded-[8px] transition-all shadow-xs paper-button"
            >
              Save
            </button>
          </div>
        </form>
      </FloatingCard>

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
