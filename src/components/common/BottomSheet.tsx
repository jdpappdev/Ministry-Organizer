import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export interface FloatingCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  maxWidthClass?: string;
  noPadding?: boolean;
}

export const FloatingCardModal: React.FC<FloatingCardModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  headerRight,
  maxWidthClass = 'max-w-[480px]',
  noPadding = false,
}) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-5 select-none"
      role="dialog"
      aria-modal="true"
    >
      {/* Dark warm green-brown backdrop: rgba(27,36,33,.45) */}
      <div
        className="fixed inset-0 bg-[#1B2421]/45 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Card Container with Ghost Card */}
      <div
        className={`relative z-10 w-full ${maxWidthClass} my-auto animate-floating-card`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ghost Card: offset 10px down, 16px narrower (inset-x-2 = 8px each side), 60% opacity, level 1 shadow */}
        <div
          className="absolute top-[10px] inset-x-2 h-full rounded-[28px] bg-white border border-[#E6E0D2] shadow-[0_1px_2px_rgba(27,36,33,0.06),0_6px_16px_rgba(27,36,33,0.08)] opacity-60 pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Main Floating Card: 16px margin, 28px radius, Level 2 shadow */}
        <div className="relative z-10 w-full bg-white border border-[#E6E0D2] rounded-[28px] shadow-[0_2px_4px_rgba(27,36,33,0.10),0_24px_56px_rgba(27,36,33,0.22)] overflow-hidden flex flex-col max-h-[calc(100vh-32px)]">
          {/* Header inside floating card: 22px serif bold, 12px circular close button top-right */}
          {(title || subtitle || headerRight) && (
            <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-3 border-b border-[#E6E0D2]/70 bg-white shrink-0">
              <div className="min-w-0 flex-1">
                {title && (
                  <h2 className="font-display font-bold text-[22px] text-[#1B2421] leading-tight tracking-tight">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-xs text-[#5F6B66] mt-1 line-clamp-1">{subtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {headerRight}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-11 h-11 -mr-2 -mt-1 flex items-center justify-center text-[#5F6B66] hover:text-[#1B2421] transition-colors rounded-full shrink-0 group cursor-pointer"
                  aria-label="Close dialog"
                >
                  <span className="w-7 h-7 rounded-full bg-[#F5F1E8] border border-[#E6E0D2] group-hover:bg-[#ECE7DC] flex items-center justify-center transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Content scrolls internally if tall, with subtle top/bottom fade divider */}
          <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Top fade divider */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-3 bg-gradient-to-b from-white to-transparent z-10" />

            <div
              className={`overflow-y-auto flex-1 ${
                noPadding ? '' : 'px-6 py-5 space-y-4'
              }`}
            >
              {children}
            </div>

            {/* Bottom fade divider */}
            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-3 bg-gradient-to-t from-white to-transparent z-10" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Backwards-compatibility alias for all components importing BottomSheet
export const BottomSheet = FloatingCardModal;
export default FloatingCardModal;
