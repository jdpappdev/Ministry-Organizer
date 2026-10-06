import React, { useState } from 'react';
import { PersonPlantData, GardenSummary, GrowthStage } from '../../utils/growthUtils';
import { BotanicalPlantGlyph } from './BotanicalPlantGlyph';
import { Sparkles, AlertCircle, Sprout, Filter } from 'lucide-react';

interface BotanicalGardenHeroProps {
  plants: PersonPlantData[];
  summary: GardenSummary;
  onSelectPlant: (plant: PersonPlantData) => void;
}

type GardenFilter = 'all' | 'seed' | 'growing' | 'flower' | 'fruit' | 'needs_care';

export const BotanicalGardenHero: React.FC<BotanicalGardenHeroProps> = ({
  plants,
  summary,
  onSelectPlant,
}) => {
  const [activeFilter, setActiveFilter] = useState<GardenFilter>('all');

  const filteredPlants = plants.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'seed') return p.stage === 'seed';
    if (activeFilter === 'growing') return p.stage === 'sprout' || p.stage === 'bud';
    if (activeFilter === 'flower') return p.stage === 'flower';
    if (activeFilter === 'fruit') return p.stage === 'fruit';
    if (activeFilter === 'needs_care') return p.health !== 'healthy';
    return true;
  });

  const filterTabs: { id: GardenFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All Plants', count: summary.totalPeople },
    { id: 'seed', label: 'Seeds', count: summary.seeds },
    { id: 'growing', label: 'Growing', count: summary.growing },
    { id: 'flower', label: 'Flowering', count: summary.flowering },
    { id: 'fruit', label: 'Fruit-Bearing', count: summary.bearingFruit },
    { id: 'needs_care', label: 'Needs Care', count: summary.needsCareCount },
  ];

  return (
    <div className="bg-[#FCFBF8] border border-[#DCDDD5] rounded-[20px] shadow-xs overflow-hidden space-y-4 p-4 sm:p-6">
      {/* Garden Header Bar & Cartographic Coordinates */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCDDD5]/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#183A35]" />
          <span className="font-display font-bold text-xs uppercase tracking-widest text-[#183A35]">
            LIVING BOTANICAL ARBOR
          </span>
          <span className="text-[10px] font-mono text-[#68716D]">
            · {summary.totalPeople} {summary.totalPeople === 1 ? 'SPECIMEN' : 'SPECIMENS'}
          </span>
        </div>

        <div className="font-mono text-[10px] text-[#68716D] uppercase tracking-wider flex items-center gap-2">
          <span>14°35'N · 120°59'E</span>
        </div>
      </div>

      {/* Filter Tabs (Horizontal Scrollable Strip) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? 'bg-[#183A35] text-white shadow-2xs'
                  : 'bg-[#F5F3ED] text-[#68716D] hover:text-[#17201E] hover:bg-[#EBE8DF]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#DCDDD5]/70 text-[#17201E]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Garden Meadow Canvas Display */}
      <div className="relative min-h-[300px] sm:min-h-[360px] bg-[#F7F5EE] border border-[#DCDDD5]/80 rounded-[16px] p-4 sm:p-6 overflow-hidden flex flex-col justify-between">
        {/* Background Meadow Linework & Soil Texture */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="gardenGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DCDDD5" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gardenGrid)" />
          {/* Subtle topographical contour hills */}
          <path
            d="M 0 240 Q 180 200 360 250 T 720 230 T 1080 260 L 1080 400 L 0 400 Z"
            fill="#EFECE2"
            opacity="0.6"
          />
          <path
            d="M 0 290 Q 240 260 480 300 T 960 280 L 1080 310 L 1080 400 L 0 400 Z"
            fill="#E5E1D5"
            opacity="0.8"
          />
        </svg>

        {/* Plants Grid / Living Botanical Flora */}
        {filteredPlants.length === 0 ? (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-8 space-y-2">
            <Sprout className="w-8 h-8 text-[#68716D]/60 animate-pulse" />
            <p className="font-display font-bold text-sm text-[#183A35]">
              No plants in this category
            </p>
            <p className="text-xs text-[#68716D] max-w-xs">
              Select another filter or continue logging conversations to nurture your garden.
            </p>
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4 my-auto">
            {filteredPlants.map((plant) => {
              const isNeedsCare = plant.health !== 'healthy';

              return (
                <button
                  key={plant.person.id}
                  onClick={() => onSelectPlant(plant)}
                  className="group relative flex flex-col items-center justify-center p-3 bg-[#FCFBF8]/90 hover:bg-white border border-[#DCDDD5] hover:border-[#183A35] rounded-[14px] shadow-2xs hover:shadow-sm transition-all duration-200 text-center active:scale-95"
                >
                  {/* Status Indicator Dot (if needs care) */}
                  {isNeedsCare && (
                    <span
                      className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#B87545] ring-2 ring-[#FCFBF8]"
                      title={plant.healthReason}
                    />
                  )}

                  {/* Botanical Specimen Glyph */}
                  <div className="w-12 h-12 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                    <BotanicalPlantGlyph
                      stage={plant.stage}
                      health={plant.health}
                      size="md"
                    />
                  </div>

                  {/* Person Name */}
                  <span className="font-display font-bold text-xs text-[#17201E] group-hover:text-[#183A35] truncate max-w-[100px] mt-1.5">
                    {plant.person.name}
                  </span>

                  {/* Stage & Visit pill */}
                  <span className="text-[10px] font-mono text-[#68716D] uppercase tracking-wider mt-0.5">
                    {plant.stageLabel} · {plant.visitsCount}v
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Garden Instruction Footer Line */}
        <div className="relative z-10 pt-3 mt-4 border-t border-[#DCDDD5]/60 flex items-center justify-center text-center">
          <span className="text-[11px] font-medium text-[#68716D] text-center max-w-xs sm:max-w-none">
            Tap a specimen to view the person
          </span>
        </div>
      </div>
    </div>
  );
};
