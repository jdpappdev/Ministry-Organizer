import React from 'react';

interface TopoPatternProps {
  className?: string;
  opacity?: number;
}

export const TopographicPattern: React.FC<TopoPatternProps> = ({
  className = '',
  opacity = 0.08,
}) => {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 w-full h-full overflow-hidden ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="topo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#183A35" />
          <stop offset="100%" stopColor="#B87545" />
        </linearGradient>
      </defs>
      <path
        d="M -100 120 C 150 160, 220 40, 450 90 C 680 140, 750 30, 950 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="4 3"
      />
      <path
        d="M -100 160 C 160 210, 240 80, 460 130 C 690 180, 770 70, 950 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M -100 200 C 170 250, 250 120, 480 170 C 700 220, 780 110, 950 160"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M -100 240 C 180 290, 270 160, 490 210 C 720 260, 800 150, 950 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="6 4"
      />
      <path
        d="M -100 280 C 190 330, 280 200, 510 250 C 730 300, 810 190, 950 240"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
};
