import React from 'react';
import { GrowthStage, PlantHealth } from '../../utils/growthUtils';

interface BotanicalPlantGlyphProps {
  stage: GrowthStage;
  health: PlantHealth;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export const BotanicalPlantGlyph: React.FC<BotanicalPlantGlyphProps> = ({
  stage,
  health,
  size = 'md',
  className = '',
}) => {
  const isNeglected = health === 'wilting' || health === 'fading';
  const isNeedsCare = health === 'needs_care';

  // Dimension scaling
  const dimMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    hero: 'w-20 h-20',
  };

  const primaryColor = isNeglected
    ? '#8D877B'
    : isNeedsCare
    ? '#B87545'
    : '#183A35';

  const accentColor = isNeglected
    ? '#ABA599'
    : isNeedsCare
    ? '#D99B6A'
    : '#B99A62';

  const leafColor = isNeglected
    ? '#969B94'
    : isNeedsCare
    ? '#7D8C7C'
    : '#416353';

  if (stage === 'seed') {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${dimMap[size]} ${className} transition-transform duration-300`}
        aria-label="Seed stage plant"
      >
        {/* Soil mound baseline */}
        <path
          d="M10 38C16 36 32 36 38 38"
          stroke="#DCDDD5"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        {/* Seed pod */}
        <ellipse
          cx="24"
          cy="32"
          rx="6"
          ry="8"
          transform="rotate(15 24 32)"
          fill={accentColor}
          fillOpacity="0.25"
          stroke={primaryColor}
          strokeWidth="2"
        />
        {/* Seed seam / embryonic ridge */}
        <path
          d="M23 26C24 29 25 35 24 38"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Tiny emerging shoot point */}
        <circle cx="21" cy="24" r="1.5" fill={primaryColor} />
      </svg>
    );
  }

  if (stage === 'sprout') {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${dimMap[size]} ${className} transition-transform duration-300`}
        aria-label="Sprout stage plant"
      >
        {/* Soil line */}
        <path
          d="M12 40C18 39 30 39 36 40"
          stroke="#DCDDD5"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Slender main shoot */}
        <path
          d="M24 40C24 32 23 24 25 18"
          stroke={primaryColor}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Left tender cotyledon */}
        <path
          d="M24 28C19 28 15 22 17 18C21 17 23 23 24 28Z"
          fill={leafColor}
          fillOpacity="0.35"
          stroke={primaryColor}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {/* Right tender leaf */}
        <path
          d="M25 24C30 24 34 18 32 14C28 13 26 19 25 24Z"
          fill={leafColor}
          fillOpacity="0.45"
          stroke={primaryColor}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {/* Tiny top leaf tip */}
        <circle cx="25" cy="17" r="1.25" fill={accentColor} />
      </svg>
    );
  }

  if (stage === 'bud') {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${dimMap[size]} ${className} transition-transform duration-300`}
        aria-label="Bud stage plant"
      >
        {/* Soil baseline */}
        <path
          d="M12 42C18 41 30 41 36 42"
          stroke="#DCDDD5"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Main curved stem */}
        <path
          d="M24 42C23 34 25 26 24 16"
          stroke={primaryColor}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Lower branch & leaf left */}
        <path
          d="M23 32C17 32 13 25 16 20C20 19 23 26 23 32Z"
          fill={leafColor}
          fillOpacity="0.35"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Lower branch & leaf right */}
        <path
          d="M24 27C30 27 34 20 32 15C28 14 25 21 24 27Z"
          fill={leafColor}
          fillOpacity="0.35"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Swollen Calyx / Sepals */}
        <path
          d="M21 18C21 14 27 14 27 18C27 21 21 21 21 18Z"
          fill={leafColor}
          stroke={primaryColor}
          strokeWidth="1.5"
        />
        {/* Emergent Bud Petal top */}
        <path
          d="M22 15C22 10 24 7 24 7C24 7 26 10 26 15Z"
          fill={accentColor}
          stroke={primaryColor}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (stage === 'flower') {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${dimMap[size]} ${className} transition-transform duration-300`}
        aria-label="Flower stage plant"
      >
        {/* Sturdy central stem */}
        <path
          d="M24 44C24 35 23 26 24 20"
          stroke={primaryColor}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Lateral foliage left */}
        <path
          d="M24 33C17 33 13 25 16 20C21 19 23 27 24 33Z"
          fill={leafColor}
          fillOpacity="0.4"
          stroke={primaryColor}
          strokeWidth="1.5"
        />
        {/* Lateral foliage right */}
        <path
          d="M24 28C31 28 35 20 32 15C27 14 25 22 24 28Z"
          fill={leafColor}
          fillOpacity="0.4"
          stroke={primaryColor}
          strokeWidth="1.5"
        />
        {/* Blossom Petals (Botanical 5-petal rosette) */}
        {/* Top Petal */}
        <path
          d="M24 18C21 12 21 6 24 4C27 6 27 12 24 18Z"
          fill="#FCFBF8"
          stroke={primaryColor}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {/* Top Left Petal */}
        <path
          d="M22 17C16 14 12 17 11 20C13 23 18 21 22 17Z"
          fill={accentColor}
          fillOpacity="0.25"
          stroke={primaryColor}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {/* Top Right Petal */}
        <path
          d="M26 17C32 14 36 17 37 20C35 23 30 21 26 17Z"
          fill={accentColor}
          fillOpacity="0.25"
          stroke={primaryColor}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {/* Bottom Left Petal */}
        <path
          d="M21 20C17 24 19 29 22 30C24 28 23 23 21 20Z"
          fill="#FCFBF8"
          stroke={primaryColor}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {/* Bottom Right Petal */}
        <path
          d="M27 20C31 24 29 29 26 30C24 28 25 23 27 20Z"
          fill="#FCFBF8"
          stroke={primaryColor}
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        {/* Flower Center Stamen & Core */}
        <circle cx="24" cy="18" r="3.5" fill={accentColor} stroke={primaryColor} strokeWidth="1.5" />
        <circle cx="24" cy="18" r="1.25" fill={primaryColor} />
      </svg>
    );
  }

  // Fruit stage (5+ visits)
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${dimMap[size]} ${className} transition-transform duration-300`}
      aria-label="Fruit stage plant"
    >
      {/* Mature trunk stem */}
      <path
        d="M24 44C23 34 25 24 24 16"
        stroke={primaryColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Mature spreading branches */}
      <path
        d="M24 25C18 21 14 24 11 20"
        stroke={primaryColor}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M24 21C30 18 34 21 37 17"
        stroke={primaryColor}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Lush canopy leafage left */}
      <path
        d="M16 20C11 18 8 10 13 8C18 7 20 15 16 20Z"
        fill={leafColor}
        fillOpacity="0.45"
        stroke={primaryColor}
        strokeWidth="1.5"
      />
      {/* Lush canopy leafage right */}
      <path
        d="M32 17C37 15 40 7 35 5C30 4 28 12 32 17Z"
        fill={leafColor}
        fillOpacity="0.45"
        stroke={primaryColor}
        strokeWidth="1.5"
      />
      {/* Crown leafage top */}
      <path
        d="M24 15C20 10 21 4 24 3C27 4 28 10 24 15Z"
        fill={leafColor}
        fillOpacity="0.55"
        stroke={primaryColor}
        strokeWidth="1.5"
      />
      {/* Fruit Cluster 1 (Left Pomegranate / Fig / Citrus) */}
      <circle
        cx="14"
        cy="25"
        r="4.25"
        fill="#B87545"
        fillOpacity={isNeglected ? '0.5' : '1'}
        stroke={primaryColor}
        strokeWidth="1.5"
      />
      <path d="M13 22C14 21 15 21 16 22" stroke="#FCFBF8" strokeWidth="1" strokeLinecap="round" />

      {/* Fruit Cluster 2 (Right Rich Berry/Fruit) */}
      <circle
        cx="34"
        cy="22"
        r="4.25"
        fill="#B99A62"
        fillOpacity={isNeglected ? '0.5' : '1'}
        stroke={primaryColor}
        strokeWidth="1.5"
      />
      <path d="M33 19C34 18 35 18 36 19" stroke="#FCFBF8" strokeWidth="1" strokeLinecap="round" />

      {/* Fruit Cluster 3 (Central Ripe Fruit) */}
      <circle
        cx="24"
        cy="15"
        r="4"
        fill="#B87545"
        fillOpacity={isNeglected ? '0.5' : '1'}
        stroke={primaryColor}
        strokeWidth="1.5"
      />
      <circle cx="24" cy="15" r="1.25" fill="#FCFBF8" />
    </svg>
  );
};
