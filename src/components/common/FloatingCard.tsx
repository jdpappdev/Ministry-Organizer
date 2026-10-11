import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface FloatingCardProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  maxWidthClass = 'max-w-md',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-5 pb-20 sm:pb-5 cursor-default"
      role="dialog"
      aria-modal="true"
    >
      {/* Warm paper backdrop */}
      <div
        className="fixed inset-0 bg-[#102C29]/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Paper Card: rounded card floating above the page with visible paper edge & depth shadow */}
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full ${maxWidthClass} mx-auto floating-paper-card rounded-[22px] overflow-hidden max-h-[85vh] flex flex-col animate-float-card`}
      >
        {/* Card Header (if title or icon present) */}
        {(title || icon) && (
          <div className="px-5 py-4 flex items-center justify-between border-b border-[#D6CBB8] bg-[#F6F1E5]">
            <div className="flex items-center gap-2.5 min-w-0">
              {icon && (
                <div className="w-8 h-8 rounded-lg bg-[#1F3D36] text-[#F6F1E5] flex items-center justify-center shrink-0 shadow-2xs">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h3 className="font-display font-bold text-base sm:text-lg text-[#1B2421] tracking-tight truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-[#5F6B66] truncate">{subtitle}</p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-[#5F6B66] hover:text-[#1B2421] hover:bg-[#E9E2D3] rounded-lg transition-colors shrink-0 -mr-1"
              aria-label="Close card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Card Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
