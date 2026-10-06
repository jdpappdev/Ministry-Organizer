import React from 'react';

interface InitialsAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({
  name,
  size = 'md',
  className = '',
}) => {
  // Extract up to 2 uppercase initials
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || '')
    .join('');

  // Deterministic subtle palette rooted in Soft Sage, Warm Paper, and Deep Forest
  const charCodeSum = name.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const colorIndex = charCodeSum % 3;

  const colorStyles = [
    'bg-[#DDE7E1]/60 text-[#183A35] border-[#DCDDD5]',
    'bg-[#F5F3ED] text-[#183A35] border-[#DCDDD5]',
    'bg-[#FCFBF8] text-[#B87545] border-[#DCDDD5]',
  ][colorIndex];

  // 12-14px soft editorial radius as per design spec
  const sizeStyles = {
    sm: 'w-7 h-7 text-[10px] font-bold rounded-[8px]',
    md: 'w-10 h-10 text-xs font-bold rounded-[12px]',
    lg: 'w-12 h-12 text-sm font-bold rounded-[14px]',
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center font-display tracking-tight border select-none shrink-0 ${sizeStyles} ${colorStyles} ${className}`}
      aria-hidden="true"
    >
      {initials || '·'}
    </div>
  );
};
