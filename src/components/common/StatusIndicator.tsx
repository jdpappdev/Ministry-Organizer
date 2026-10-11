import React from 'react';
import { AlertCircle, CheckCircle2, Clock, Minus } from 'lucide-react';
import { StatusType } from '../../types';

interface StatusIndicatorProps {
  status: StatusType;
  showText?: boolean;
  className?: string;
}

export const STATUS_CONFIG: Record<
  StatusType,
  { label: string; color: string; bg: string; dot: string; border: string }
> = {
  active: {
    label: 'Recently visited',
    color: 'text-[#1F3D36]',
    bg: 'bg-[#E9F0EC]',
    dot: 'bg-[#1F3D36]',
    border: 'border-[#D0DFD6]',
  },
  needs_attention: {
    label: 'Needs follow-up',
    color: 'text-[#C2571A]',
    bg: 'bg-[#FAF0EB]',
    dot: 'bg-[#C2571A]',
    border: 'border-[#F3D7C8]',
  },
  scheduled: {
    label: 'Scheduled',
    color: 'text-[#446355]',
    bg: 'bg-[#F0F4F1]',
    dot: 'bg-[#446355]',
    border: 'border-[#D5E1D9]',
  },
  inactive: {
    label: 'Inactive',
    color: 'text-[#5F6B66]',
    bg: 'bg-[#F5F1E8]',
    dot: 'bg-[#5F6B66]',
    border: 'border-[#E6E0D2]',
  },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showText = true,
  className = '',
}) => {
  const isOverdue = status === 'needs_attention';

  if (isOverdue) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF0EB] text-[#C2571A] border border-[#F3D7C8] ${className}`}
      >
        <AlertCircle className="w-3 h-3 shrink-0 text-[#C2571A]" />
        {showText && <span>Needs follow-up</span>}
      </span>
    );
  }

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.color} border ${config.border} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`}
        aria-hidden="true"
      />
      {showText && <span>{config.label}</span>}
    </span>
  );
};
