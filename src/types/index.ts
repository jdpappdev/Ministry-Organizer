export type StatusType = 'active' | 'needs_attention' | 'scheduled' | 'inactive';

export type GenderType = 'male' | 'female' | 'other' | 'unspecified';

export interface PersonLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Person {
  id: string;
  name: string;
  gender: GenderType;
  age?: number;
  address: string;
  location?: PersonLocation | null;
  phone?: string;
  background?: string;
  remarks?: string;
  territoryId: string;
  status: StatusType;
  lastVisitAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  personId: string;
  visitDate: string; // YYYY-MM-DD
  date: string; // Backwards-compatible alias for visitDate
  topic: string;
  conversationDetails?: string;
  conversation: string; // Backwards-compatible alias for conversationDetails
  nextTopic?: string;
  nextFollowUpDate?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Territory {
  id: string;
  code?: string;
  name: string;
  description?: string;
  boundaryNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ScheduleType = 'return_visit' | 'bible_study' | 'initial_call' | 'general_followup';

export interface ScheduleItem {
  id: string;
  personId: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: ScheduleType;
  topicProposed?: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'visit_logged' | 'person_added' | 'schedule_created' | 'territory_created';
  title: string;
  description: string;
  personId?: string;
  personName?: string;
  territoryId?: string;
  territoryName?: string;
  timestamp: string;
}

export type NavigationTab = 'home' | 'people' | 'territories' | 'schedule' | 'growth' | 'activity';
