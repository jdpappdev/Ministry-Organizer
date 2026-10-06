import React, { useState, useMemo } from 'react';
import { Person, Visit, Territory } from '../../types';
import {
  deriveGardenPlants,
  deriveGardenSummary,
  deriveGardenMilestones,
  PersonPlantData,
} from '../../utils/growthUtils';
import { BotanicalPlantGlyph } from './BotanicalPlantGlyph';
import { BotanicalGardenHero } from './BotanicalGardenHero';
import { PlantPreviewSheet } from './PlantPreviewSheet';
import {
  Sprout,
  Plus,
  ChevronRight,
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface GrowthViewProps {
  people: Person[];
  visits: Visit[];
  territories: Territory[];
  onSelectPerson: (personId: string) => void;
  onOpenAddPerson: () => void;
  onRecordVisit?: (personId: string) => void;
}

export const GrowthView: React.FC<GrowthViewProps> = ({
  people,
  visits,
  territories,
  onSelectPerson,
  onOpenAddPerson,
  onRecordVisit,
}) => {
  // Selected plant for preview bottom sheet
  const [selectedPlant, setSelectedPlant] = useState<PersonPlantData | null>(null);

  // Derive all garden plant data
  const plants = useMemo(() => deriveGardenPlants(people, visits), [people, visits]);
  const summary = useMemo(() => deriveGardenSummary(plants), [plants]);
  const milestones = useMemo(() => deriveGardenMilestones(plants), [plants]);

  // Territory lookup map for selected plant preview
  const territoryMap = useMemo(() => {
    const map = new Map<string, Territory>();
    territories.forEach((t) => map.set(t.id, t));
    return map;
  }, [territories]);

  // Plants that need attention / care
  const needsCarePlants = useMemo(
    () => plants.filter((p) => p.health !== 'healthy'),
    [plants]
  );

  // EMPTY STATE (0 people in journal)
  if (people.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="space-y-1.5 border-b border-[#DCDDD5] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#B87545]">
              CULTIVATION & FIELD CARE
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#17201E] tracking-tight">
            Your Garden
          </h1>
          <p className="text-xs text-[#68716D]">
            Every connection takes root somewhere.
          </p>
        </div>

        {/* Botanical Empty State Hero */}
        <div className="bg-[#FCFBF8] border border-[#DCDDD5] rounded-[20px] p-8 sm:p-12 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#F5F3ED] border border-[#DCDDD5] flex items-center justify-center mx-auto text-[#183A35] shadow-2xs">
            <Sprout className="w-8 h-8 stroke-[1.8]" />
          </div>

          <div className="space-y-2 max-w-sm mx-auto">
            <h2 className="font-display font-bold text-lg text-[#183A35]">
              Your garden is waiting
            </h2>
            <p className="text-xs text-[#68716D] leading-relaxed">
              Add your first person and your first seed will take root here. Each visit nurtures their growth into sprouts, buds, flowers, and fruit.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenAddPerson}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold text-white bg-[#183A35] hover:bg-[#102C29] active:scale-[0.98] rounded-[12px] transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Person</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 animate-in fade-in duration-200">
      {/* 1. EDITORIAL HEADER */}
      <div className="space-y-3 border-b border-[#DCDDD5] pb-5">
        <div>
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#B87545]">
            CULTIVATION & FIELD CARE
          </span>
        </div>

        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#17201E] tracking-tight">
            Your Garden
          </h1>
          <p className="text-xs text-[#68716D] mt-1">
            Every connection takes root somewhere.
          </p>
        </div>

        {/* Compact Editorial Stats Summary */}
        <div className="pt-2 flex flex-wrap items-baseline gap-x-5 gap-y-2 text-xs text-[#17201E]">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-lg text-[#183A35] tabular-nums">
              {summary.totalPeople}
            </span>
            <span className="text-[#68716D] font-medium">total people</span>
          </div>

          <span className="text-[#DCDDD5] hidden sm:inline">·</span>

          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-lg text-[#183A35] tabular-nums">
              {summary.growing}
            </span>
            <span className="text-[#68716D] font-medium">growing</span>
          </div>

          <span className="text-[#DCDDD5] hidden sm:inline">·</span>

          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-lg text-[#B99A62] tabular-nums">
              {summary.flowering}
            </span>
            <span className="text-[#68716D] font-medium">flowering</span>
          </div>

          <span className="text-[#DCDDD5] hidden sm:inline">·</span>

          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-lg text-[#B87545] tabular-nums">
              {summary.bearingFruit}
            </span>
            <span className="text-[#68716D] font-medium">bearing fruit</span>
          </div>

          {summary.needsCareCount > 0 && (
            <>
              <span className="text-[#DCDDD5] hidden sm:inline">·</span>
              <div className="flex items-baseline gap-1.5 text-[#B87545]">
                <span className="font-display font-bold text-lg tabular-nums">
                  {summary.needsCareCount}
                </span>
                <span className="font-semibold underline underline-offset-2">
                  need care
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. THE MAIN BOTANICAL GARDEN HERO */}
      <BotanicalGardenHero
        plants={plants}
        summary={summary}
        onSelectPlant={(plant) => setSelectedPlant(plant)}
      />

      {/* 3. NEEDS CARE SECTION (when applicable) */}
      {needsCarePlants.length > 0 && (
        <section className="space-y-3 pt-2" aria-labelledby="needs-care-heading">
          <div className="flex items-center justify-between border-b border-[#DCDDD5] pb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#B87545]" />
              <h2 id="needs-care-heading" className="font-display font-bold text-base text-[#17201E] uppercase tracking-tight">
                Needs Care · {needsCarePlants.length}
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#68716D]">
              ATTENTION REQUIRED
            </span>
          </div>

          <div className="divide-y divide-[#DCDDD5]/60 border-y border-[#DCDDD5] bg-[#FCFBF8] rounded-[16px] overflow-hidden">
            {needsCarePlants.map((plant) => (
              <button
                key={plant.person.id}
                onClick={() => onSelectPerson(plant.person.id)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 hover:bg-[#F5F3ED] transition-colors text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-[10px] bg-[#F5F3ED] border border-[#DCDDD5] flex items-center justify-center shrink-0">
                    <BotanicalPlantGlyph stage={plant.stage} health={plant.health} size="sm" />
                  </div>

                  <div className="min-w-0">
                    <div className="font-display font-bold text-sm text-[#17201E] group-hover:text-[#183A35] truncate">
                      {plant.person.name}
                    </div>
                    <div className="text-xs text-[#B87545] font-medium flex items-center gap-1.5 mt-0.5">
                      <span>{plant.stageLabel}</span>
                      <span>·</span>
                      <span>{plant.healthReason}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#68716D] group-hover:text-[#183A35] shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 4. DERIVED BOTANICAL MILESTONES */}
      <section className="space-y-3 pt-2" aria-labelledby="milestones-heading">
        <div className="flex items-center justify-between border-b border-[#DCDDD5] pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#183A35]" />
            <h2 id="milestones-heading" className="font-display font-bold text-base text-[#17201E] uppercase tracking-tight">
              Garden Milestones
            </h2>
          </div>
          <span className="text-xs text-[#68716D]">
            {milestones.filter((m) => m.isEarned).length} of {milestones.length} earned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestones.map((milestone) => {
            return (
              <div
                key={milestone.id}
                className={`p-3.5 rounded-[14px] border transition-colors flex items-start gap-3 ${
                  milestone.isEarned
                    ? 'bg-[#FCFBF8] border-[#183A35]/30 shadow-2xs'
                    : 'bg-[#F5F3ED]/60 border-[#DCDDD5] opacity-65'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    milestone.isEarned
                      ? 'bg-[#183A35] text-white shadow-2xs'
                      : 'bg-[#DCDDD5]/60 text-[#68716D]'
                  }`}
                >
                  {milestone.isEarned ? (
                    <CheckCircle2 className="w-4 h-4 text-[#B99A62]" />
                  ) : (
                    <Sprout className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-display font-bold text-xs ${
                      milestone.isEarned ? 'text-[#183A35]' : 'text-[#68716D]'
                    }`}>
                      {milestone.title}
                    </h3>
                    <span className="font-mono text-[10px] text-[#68716D]">
                      {milestone.earnedProgress}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#68716D] leading-snug">
                    {milestone.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Selected Plant Preview Bottom Sheet */}
      <PlantPreviewSheet
        plantData={selectedPlant}
        territory={selectedPlant ? territoryMap.get(selectedPlant.person.territoryId) : undefined}
        isOpen={Boolean(selectedPlant)}
        onClose={() => setSelectedPlant(null)}
        onViewProfile={(personId) => {
          setSelectedPlant(null);
          onSelectPerson(personId);
        }}
        onRecordVisit={onRecordVisit ? (pId) => {
          setSelectedPlant(null);
          onRecordVisit(pId);
        } : undefined}
      />
    </div>
  );
};
