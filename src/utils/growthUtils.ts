/**
 * Growth & Botanical Garden calculation utilities.
 * Pure derived calculations from people[] and visits[].
 * No persistent storage or new entities.
 */

import { Person, Visit } from '../types';
import { getLocalDateKey, parseLocalDateKey } from './dateUtils';

export type GrowthStage = 'seed' | 'sprout' | 'bud' | 'flower' | 'fruit';
export type PlantHealth = 'healthy' | 'needs_care' | 'wilting' | 'fading';

export interface PersonPlantData {
  person: Person;
  visitsCount: number;
  latestVisit?: Visit;
  stage: GrowthStage;
  stageLabel: string;
  stageDescription: string;
  health: PlantHealth;
  healthLabel: string;
  healthReason: string;
  lastVisitDate?: string;
  nextFollowUpDate?: string;
}

export interface GardenSummary {
  totalPeople: number;
  seeds: number;
  sprouts: number;
  buds: number;
  flowers: number;
  fruits: number;
  growing: number; // sprouts + buds
  flowering: number; // flowers
  bearingFruit: number; // fruits
  needsCareCount: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'seed' | 'sprout' | 'flower' | 'fruit' | 'garden';
  isEarned: boolean;
  earnedProgress?: string;
}

/**
 * Calculates the growth stage strictly from total visit count:
 * - Seed: 0 visits
 * - Sprout: 1 visit
 * - Bud: 2 visits
 * - Flower: 3–4 visits
 * - Fruit: 5+ visits
 */
export function getGrowthStage(visitCount: number): {
  stage: GrowthStage;
  label: string;
  description: string;
} {
  if (visitCount === 0) {
    return {
      stage: 'seed',
      label: 'Seed',
      description: 'Taking root in the journal',
    };
  }
  if (visitCount === 1) {
    return {
      stage: 'sprout',
      label: 'Sprout',
      description: 'First conversation planted',
    };
  }
  if (visitCount === 2) {
    return {
      stage: 'bud',
      label: 'Bud',
      description: 'Follow-up interest budding',
    };
  }
  if (visitCount >= 3 && visitCount <= 4) {
    return {
      stage: 'flower',
      label: 'Flower',
      description: 'Ongoing blooming relationship',
    };
  }
  return {
    stage: 'fruit',
    label: 'Fruit',
    description: 'Deep, fruitful bond established',
  };
}

/**
 * Calculates current plant health based on the person's latest visit and active follow-up.
 * Does NOT affect historical visit count or growth stage.
 */
export function getPlantHealth(
  person: Person,
  latestVisit?: Visit,
  todayStr: string = getLocalDateKey()
): {
  health: PlantHealth;
  healthLabel: string;
  reason: string;
} {
  const todayDate = parseLocalDateKey(todayStr);

  // 1. If person has an active follow-up date scheduled
  if (latestVisit?.nextFollowUpDate && latestVisit.nextFollowUpDate.trim()) {
    const followUpStr = latestVisit.nextFollowUpDate.trim();
    if (followUpStr > todayStr) {
      return {
        health: 'healthy',
        healthLabel: 'Nurtured',
        reason: 'Follow-up scheduled ahead',
      };
    }
    if (followUpStr === todayStr) {
      return {
        health: 'needs_care',
        healthLabel: 'Due Today',
        reason: 'Follow-up scheduled for today',
      };
    }

    // Overdue calculation
    const followUpDate = parseLocalDateKey(followUpStr);
    const diffMs = todayDate.getTime() - followUpDate.getTime();
    const daysOverdue = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    if (daysOverdue <= 7) {
      return {
        health: 'needs_care',
        healthLabel: 'Needs Care',
        reason: `Follow-up missed ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} ago`,
      };
    }
    if (daysOverdue <= 21) {
      return {
        health: 'wilting',
        healthLabel: 'Wilting',
        reason: `Follow-up overdue for ${daysOverdue} days`,
      };
    }
    return {
      health: 'fading',
      healthLabel: 'Fading',
      reason: `Prolonged delay (${daysOverdue} days overdue)`,
    };
  }

  // 2. If person has visit history but no explicit nextFollowUpDate set
  if (latestVisit) {
    const vDateStr = latestVisit.visitDate || latestVisit.date;
    if (vDateStr) {
      const vDate = parseLocalDateKey(vDateStr);
      const diffMs = todayDate.getTime() - vDate.getTime();
      const daysSinceVisit = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

      if (daysSinceVisit <= 30) {
        return {
          health: 'healthy',
          healthLabel: 'Healthy',
          reason: 'Recently contacted',
        };
      }
      if (daysSinceVisit <= 60) {
        return {
          health: 'needs_care',
          healthLabel: 'Needs Care',
          reason: `No visit for ${daysSinceVisit} days`,
        };
      }
      return {
        health: 'fading',
        healthLabel: 'Fading',
        reason: `No contact in over 2 months`,
      };
    }
  }

  // 3. If person is a Seed (0 visits)
  if (person.createdAt) {
    const createdDate = new Date(person.createdAt);
    const diffMs = todayDate.getTime() - createdDate.getTime();
    const daysSinceCreated = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

    if (daysSinceCreated <= 14) {
      return {
        health: 'healthy',
        healthLabel: 'Healthy Seed',
        reason: 'Fresh seed planted',
      };
    }
    if (daysSinceCreated <= 30) {
      return {
        health: 'needs_care',
        healthLabel: 'Awaiting Care',
        reason: `Awaiting initial visit (${daysSinceCreated}d)`,
      };
    }
    return {
      health: 'fading',
      healthLabel: 'Fading Seed',
      reason: 'Awaiting first contact for over a month',
    };
  }

  return {
    health: 'healthy',
    healthLabel: 'Healthy',
    reason: 'Active in garden',
  };
}

/**
 * Derives comprehensive plant data for every person.
 */
export function deriveGardenPlants(
  people: Person[],
  visits: Visit[],
  todayStr: string = getLocalDateKey()
): PersonPlantData[] {
  const visitsByPerson = new Map<string, Visit[]>();

  visits.forEach((v) => {
    const existing = visitsByPerson.get(v.personId) || [];
    existing.push(v);
    visitsByPerson.set(v.personId, existing);
  });

  return people.map((person) => {
    const personVisits = (visitsByPerson.get(person.id) || []).sort(
      (a, b) =>
        new Date(b.visitDate || b.date).getTime() - new Date(a.visitDate || a.date).getTime()
    );

    const latestVisit = personVisits[0];
    const visitsCount = personVisits.length;
    const stageInfo = getGrowthStage(visitsCount);
    const healthInfo = getPlantHealth(person, latestVisit, todayStr);

    return {
      person,
      visitsCount,
      latestVisit,
      stage: stageInfo.stage,
      stageLabel: stageInfo.label,
      stageDescription: stageInfo.description,
      health: healthInfo.health,
      healthLabel: healthInfo.healthLabel,
      healthReason: healthInfo.reason,
      lastVisitDate: latestVisit ? (latestVisit.visitDate || latestVisit.date) : undefined,
      nextFollowUpDate: latestVisit?.nextFollowUpDate?.trim() || undefined,
    };
  });
}

/**
 * Derives garden summary statistics.
 */
export function deriveGardenSummary(plants: PersonPlantData[]): GardenSummary {
  let seeds = 0;
  let sprouts = 0;
  let buds = 0;
  let flowers = 0;
  let fruits = 0;
  let needsCareCount = 0;

  for (const plant of plants) {
    if (plant.stage === 'seed') seeds++;
    else if (plant.stage === 'sprout') sprouts++;
    else if (plant.stage === 'bud') buds++;
    else if (plant.stage === 'flower') flowers++;
    else if (plant.stage === 'fruit') fruits++;

    if (plant.health !== 'healthy') {
      needsCareCount++;
    }
  }

  return {
    totalPeople: plants.length,
    seeds,
    sprouts,
    buds,
    flowers,
    fruits,
    growing: sprouts + buds,
    flowering: flowers,
    bearingFruit: fruits,
    needsCareCount,
  };
}

/**
 * Derives milestone achievements purely from application state.
 */
export function deriveGardenMilestones(
  plants: PersonPlantData[]
): Milestone[] {
  const total = plants.length;
  const withVisits = plants.filter((p) => p.visitsCount >= 1).length;
  const returnVisits = plants.filter((p) => p.visitsCount >= 2).length;
  const flowers = plants.filter((p) => p.visitsCount >= 3).length;
  const fruits = plants.filter((p) => p.visitsCount >= 5).length;

  return [
    {
      id: 'first-plant',
      title: 'First Plant',
      description: 'Added your first person to the journal.',
      category: 'seed',
      isEarned: total >= 1,
      earnedProgress: total >= 1 ? 'Earned' : '0/1 person',
    },
    {
      id: 'first-return',
      title: 'First Return',
      description: 'Completed your first return visit.',
      category: 'sprout',
      isEarned: returnVisits >= 1,
      earnedProgress: returnVisits >= 1 ? 'Earned' : '0/1 return visit',
    },
    {
      id: 'first-bloom',
      title: 'First Bloom',
      description: 'A relationship reached Flower stage (3+ visits).',
      category: 'flower',
      isEarned: flowers >= 1,
      earnedProgress: flowers >= 1 ? 'Earned' : `${Math.min(flowers, 1)}/1 bloom`,
    },
    {
      id: 'first-fruit',
      title: 'First Fruit',
      description: 'A relationship reached Fruit stage (5+ visits).',
      category: 'fruit',
      isEarned: fruits >= 1,
      earnedProgress: fruits >= 1 ? 'Earned' : `${Math.min(fruits, 1)}/1 fruit`,
    },
    {
      id: 'growing-garden',
      title: 'Growing Garden',
      description: '10 people with active visit history.',
      category: 'garden',
      isEarned: withVisits >= 10,
      earnedProgress: `${Math.min(withVisits, 10)}/10 people`,
    },
    {
      id: 'many-blooms',
      title: 'Many Blooms',
      description: '10 relationships reached Flower.',
      category: 'flower',
      isEarned: flowers >= 10,
      earnedProgress: `${Math.min(flowers, 10)}/10 flowers`,
    },
    {
      id: 'orchard',
      title: 'Orchard',
      description: '5 relationships reached Fruit.',
      category: 'fruit',
      isEarned: fruits >= 5,
      earnedProgress: `${Math.min(fruits, 5)}/5 fruit-bearing`,
    },
    {
      id: 'deep-roots',
      title: 'Deep Roots',
      description: 'Multiple long-term relationships are growing.',
      category: 'garden',
      isEarned: flowers >= 3,
      earnedProgress: `${Math.min(flowers, 3)}/3 rooted`,
    },
  ];
}
