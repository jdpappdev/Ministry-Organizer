import React from 'react';
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
    color: 'text-[#183A35]',
    bg: 'bg-[#183A35]/8',
    dot: 'bg-[#183A35]',
    border: 'border-[#183A35]/25',
  },
  needs_attention: {
    label: 'Needs follow-up',
    color: 'text-[#B87545]',
    bg: 'bg-[#B87545]/10',
    dot: 'bg-[#B87545]',
    border: 'border-[#B87545]/25',
  },
  scheduled: {
    label: 'Scheduled',
    color: 'text-[#B99A62]',
    bg: 'bg-[#B99A62]/15',
    dot: 'bg-[#B99A62]',
    border: 'border-[#B99A62]/30',
  },
  inactive: {
    label: 'Inactive',
    color: 'text-[#68716D]',
    bg: 'bg-[#68716D]/10',
    dot: 'bg-[#68716D]',
    border: 'border-[#68716D]/20',
  },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showText = true,
  className = '',
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${config.color} ${className}`}>
      <span
        className={`w-2 h-2 rounded-full ${config.dot} shrink-0`}
        aria-hidden="true"
      />
      {showText && <span>{config.label}</span>}
    </span>
  );
};
