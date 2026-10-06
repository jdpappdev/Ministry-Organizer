import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  disabled = false,
  className = '',
  size = 'md',
  ariaLabel,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs rounded-[10px]',
    md: 'h-10 px-3.5 text-xs rounded-[12px]',
    lg: 'h-12 px-3.5 text-sm rounded-[12px]',
  }[size];

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Closed Control Button */}
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full ${sizeClasses} bg-[#FCFBF8] border border-[#DCDDD5] hover:border-[#183A35] focus:border-[#183A35] text-[#17201E] flex items-center justify-between gap-2 font-sans font-medium transition-colors outline-none cursor-pointer disabled:bg-[#F5F3ED] disabled:text-[#68716D] disabled:cursor-not-allowed disabled:border-[#DCDDD5] shadow-2xs ${
          isOpen ? 'border-[#183A35] ring-1 ring-[#183A35]/10' : ''
        }`}
      >
        <span className="truncate text-left font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-[#183A35] shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : 'opacity-70'
          }`}
        />
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-[#FCFBF8] border border-[#DCDDD5] rounded-[14px] shadow-lg p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-[10px] text-xs font-medium flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#183A35] text-white font-semibold'
                    : option.disabled
                    ? 'text-[#68716D] opacity-50 cursor-not-allowed'
                    : 'text-[#17201E] hover:bg-[#F5F3ED] active:bg-[#EBE8DF]'
                }`}
              >
                <div className="truncate min-w-0 flex-1">
                  <div className="truncate">{option.label}</div>
                  {option.sublabel && (
                    <div
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-[#B99A62]' : 'text-[#68716D]'
                      }`}
                    >
                      {option.sublabel}
                    </div>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#B99A62]" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
