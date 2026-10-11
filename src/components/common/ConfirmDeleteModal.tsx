import React, { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { FloatingCardModal } from './BottomSheet';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelButtonRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <FloatingCardModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidthClass="max-w-[420px]"
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3.5 pt-1">
          <div className="w-10 h-10 rounded-full bg-[#FAF0EB] border border-[#F3D7C8] flex items-center justify-center text-[#C2571A] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-sm text-[#5F6B66] leading-relaxed pt-1">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E6E0D2]/70">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            className="btn-tactile-secondary px-5 text-sm"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="btn-tactile-destructive px-5 text-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </FloatingCardModal>
  );
};
