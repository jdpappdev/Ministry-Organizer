import React from 'react';
import { parseLocalDateKey } from '../../utils/dateUtils';

interface EditorialDateProps {
  dateString: string; // ISO or YYYY-MM-DD
  format?: 'stacked' | 'horizontal' | 'compact' | 'column';
  showYear?: boolean;
  className?: string;
}

const MONTH_NAMES = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

export const EditorialDate: React.FC<EditorialDateProps> = ({
  dateString,
  format = 'stacked',
  showYear = true,
  className = '',
}) => {
  const date = parseLocalDateKey(dateString);
  const isValid = !isNaN(date.getTime());

  if (!isValid) {
    return <span className={`text-xs text-[#68716D] ${className}`}>—</span>;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();

  if (format === 'column') {
    return (
      <div className={`flex flex-col items-center justify-center min-w-[42px] shrink-0 select-none text-center ${className}`}>
        <span className="font-display text-lg font-bold leading-none text-[#183A35] tabular-nums tracking-tight">
          {day}
        </span>
        <span className="text-[10px] font-mono font-bold tracking-widest text-[#B87545] uppercase mt-0.5 leading-none">
          {month}
        </span>
      </div>
    );
  }

  if (format === 'horizontal') {
    return (
      <span className={`inline-flex items-baseline gap-1.5 font-display tabular-nums tracking-tight text-[#17201E] ${className}`}>
        <span className="font-bold text-base text-[#183A35]">{day}</span>
        <span className="text-xs uppercase tracking-widest text-[#B87545] font-semibold">{month}</span>
        {showYear && <span className="text-xs text-[#68716D] font-normal">{year}</span>}
      </span>
    );
  }

  if (format === 'compact') {
    return (
      <span className={`inline-flex items-baseline gap-1 text-xs tabular-nums text-[#68716D] ${className}`}>
        <span className="font-display font-bold text-[#183A35]">{day}</span>
        <span className="text-[10px] font-mono font-semibold tracking-wider text-[#B87545] uppercase">{month}</span>
      </span>
    );
  }

  // Default 'stacked' signature editorial anchor with 12px soft radius
  return (
    <div
      className={`inline-flex flex-col items-center justify-center p-2 rounded-[12px] bg-[#FCFBF8] border border-[#DCDDD5] select-none text-center min-w-[48px] shrink-0 ${className}`}
      aria-label={`${month} ${day}, ${year}`}
    >
      <span className="font-display text-xl font-bold leading-none text-[#183A35] tabular-nums tracking-tight">
        {day}
      </span>
      <span className="text-[10px] font-mono font-bold tracking-widest text-[#B87545] uppercase mt-0.5 leading-tight">
        {month}
      </span>
      {showYear && (
        <span className="text-[9px] font-medium text-[#68716D] tabular-nums mt-0.5 leading-tight">
          {year}
        </span>
      )}
    </div>
  );
};
