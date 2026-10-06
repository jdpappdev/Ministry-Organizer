import { useState, useEffect, useCallback } from 'react';
import { Person, PersonLocation, Visit, Territory, ActivityItem } from '../types';
import { getLocalDateKey } from '../utils/dateUtils';
import { idbDatabase, STORES } from './db';
import {
  INITIAL_PEOPLE,
  INITIAL_VISITS,
  INITIAL_TERRITORIES,
  INITIAL_ACTIVITIES,
} from './mockData';

const STORAGE_KEYS = {
  PEOPLE: 'ministry_org_people_v2',
  VISITS: 'ministry_org_visits_v2',
  TERRITORIES: 'ministry_org_territories_v2',
  ACTIVITIES: 'ministry_org_activities_v2',
  USER_PREFERENCES: 'ministry_org_user_prefs_v1',
};

export interface UserPreferences {
  displayName: string;
}

// Safe JSON parser with fallback
function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed reading storage key "${key}":`, err);
    return fallback;
  }
}

function saveStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed saving storage key "${key}":`, err);
  }
}

// Pub/sub event dispatcher for cross-component reactive updates
type StoreListener = () => void;
const listeners = new Set<StoreListener>();

function notifyChange() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in store listener:', e);
    }
  });
}

export interface ActiveFollowUp {
  personId: string;
  personName: string;
  territoryId?: string;
  territoryName?: string;
  territoryCode?: string;
  date: string; // YYYY-MM-DD
  topic: string;
  visitId: string;
  visitDate: string;
}

export interface NewPersonInput {
  name: string;
  gender: Person['gender'];
  age?: number;
  address: string;
  location?: Person['location'];
  phone?: string;
  background?: string;
  remarks?: string;
  territoryId: string;
  status: Person['status'];
}

export interface NewVisitInput {
  personId: string;
  visitDate?: string;
  date?: string; // backwards compatibility alias
  topic: string;
  conversationDetails?: string;
  conversation?: string; // backwards compatibility alias
  nextTopic?: string;
  nextFollowUpDate?: string;
  remarks?: string;
}

export interface NewTerritoryInput {
  name: string;
  description?: string;
  code?: string;
  boundaryNotes?: string;
}

// Core Data Access Layer
class DataRepository {
  private people: Person[] = [];
  private visits: Visit[] = [];
  private territories: Territory[] = [];
  private activities: ActivityItem[] = [];
  private userPreferences: UserPreferences = { displayName: '' };
  private initialized = false;

  public init() {
    if (this.initialized) return;
    this.initialized = true;

    // Clean up any legacy schedule keys from localStorage
    try {
      localStorage.removeItem('ministry_org_schedule_v2');
      localStorage.removeItem('ministry_org_schedule_v1');
    } catch (_) {}

    // Synchronous fallback load from localStorage for immediate render
    this.people = loadStored(STORAGE_KEYS.PEOPLE, INITIAL_PEOPLE);
    this.visits = loadStored(STORAGE_KEYS.VISITS, INITIAL_VISITS);
    this.territories = loadStored(STORAGE_KEYS.TERRITORIES, INITIAL_TERRITORIES);
    this.activities = loadStored(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
    this.userPreferences = loadStored(STORAGE_KEYS.USER_PREFERENCES, { displayName: '' });

    // Asynchronously hydrate from IndexedDB
    this.hydrateFromIndexedDB();
  }

  private async hydrateFromIndexedDB() {
    try {
      const [idbPeople, idbVisits, idbTerritories, idbSettings] = await Promise.all([
        idbDatabase.getAll<Person>(STORES.PEOPLE),
        idbDatabase.getAll<Visit>(STORES.VISITS),
        idbDatabase.getAll<Territory>(STORES.TERRITORIES),
        idbDatabase.getAll<any>(STORES.SETTINGS),
      ]);

      if (idbPeople.length > 0 || idbVisits.length > 0 || idbTerritories.length > 0) {
        this.people = idbPeople;
        this.visits = idbVisits;
        this.territories = idbTerritories;
        saveStored(STORAGE_KEYS.PEOPLE, this.people);
        saveStored(STORAGE_KEYS.VISITS, this.visits);
        saveStored(STORAGE_KEYS.TERRITORIES, this.territories);
      } else {
        await Promise.all([
          idbDatabase.saveAll(STORES.PEOPLE, this.people),
          idbDatabase.saveAll(STORES.VISITS, this.visits),
          idbDatabase.saveAll(STORES.TERRITORIES, this.territories),
        ]);
      }

      const prefsRecord = idbSettings.find((s) => s.key === 'userPreferences');
      if (prefsRecord && prefsRecord.value) {
        this.userPreferences = prefsRecord.value;
        saveStored(STORAGE_KEYS.USER_PREFERENCES, this.userPreferences);
      } else if (this.userPreferences.displayName) {
        await idbDatabase.put(STORES.SETTINGS, { key: 'userPreferences', value: this.userPreferences });
      }

      notifyChange();
    } catch (err) {
      console.error('IndexedDB hydration error:', err);
    }
  }

  // Derive lastVisitAt from normalized visits
  private computeLastVisitAt(personId: string): string | null {
    const personVisits = this.visits
      .filter((v) => v.personId === personId)
      .sort((a, b) => new Date(b.visitDate || b.date).getTime() - new Date(a.visitDate || a.date).getTime());
    return personVisits[0] ? (personVisits[0].visitDate || personVisits[0].date) : null;
  }

  // PEOPLE
  public getPeople(): Person[] {
    this.init();
    return this.people.map((p) => ({
      ...p,
      lastVisitAt: this.computeLastVisitAt(p.id),
    }));
  }

  public getPerson(id: string): Person | undefined {
    this.init();
    const p = this.people.find((person) => person.id === id);
    if (!p) return undefined;
    return {
      ...p,
      lastVisitAt: this.computeLastVisitAt(p.id),
    };
  }

  public addPerson(personInput: NewPersonInput, initialVisit?: Omit<NewVisitInput, 'personId'>): Person {
    this.init();
    const id = `person-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const address = personInput.address.trim();

    const newPerson: Person = {
      ...personInput,
      id,
      name: personInput.name.trim(),
      address,
      location: personInput.location || undefined,
      phone: personInput.phone?.trim() || undefined,
      background: personInput.background?.trim() || undefined,
      remarks: personInput.remarks?.trim() || undefined,
      lastVisitAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.people.unshift(newPerson);
    saveStored(STORAGE_KEYS.PEOPLE, this.people);
    idbDatabase.put(STORES.PEOPLE, newPerson);

    if (initialVisit) {
      this.addVisit({
        ...initialVisit,
        personId: newPerson.id,
      });
    }

    notifyChange();
    return this.getPerson(newPerson.id) || newPerson;
  }

  public updatePerson(id: string, updates: Partial<Person>): Person | undefined {
    this.init();
    const idx = this.people.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;

    const current = this.people[idx];
    const newAddress = updates.address !== undefined ? updates.address.trim() : current.address;
    const newLocation = updates.location !== undefined ? (updates.location || undefined) : current.location;

    this.people[idx] = {
      ...current,
      ...updates,
      address: newAddress,
      location: newLocation,
      updatedAt: new Date().toISOString(),
    };
    saveStored(STORAGE_KEYS.PEOPLE, this.people);
    idbDatabase.put(STORES.PEOPLE, this.people[idx]);

    notifyChange();
    return this.getPerson(id);
  }

  public deletePerson(id: string): boolean {
    this.init();
    const prevLen = this.people.length;
    this.people = this.people.filter((p) => p.id !== id);
    if (this.people.length !== prevLen) {
      saveStored(STORAGE_KEYS.PEOPLE, this.people);
      idbDatabase.delete(STORES.PEOPLE, id);

      // Clean up orphaned visits
      this.visits = this.visits.filter((v) => v.personId !== id);
      saveStored(STORAGE_KEYS.VISITS, this.visits);
      idbDatabase.saveAll(STORES.VISITS, this.visits);

      notifyChange();
      return true;
    }
    return false;
  }

  // VISITS (Source of truth for visits and derived follow-ups/schedule)
  public getVisits(personId?: string): Visit[] {
    this.init();
    const items = personId ? this.visits.filter((v) => v.personId === personId) : [...this.visits];
    return items.sort(
      (a, b) => new Date(b.visitDate || b.date).getTime() - new Date(a.visitDate || a.date).getTime()
    );
  }

  public getVisit(id: string): Visit | undefined {
    this.init();
    return this.visits.find((v) => v.id === id);
  }

  public addVisit(input: NewVisitInput): Visit {
    this.init();
    const id = `visit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    const visitDate = input.visitDate || input.date || getLocalDateKey();
    const details = input.conversationDetails ?? input.conversation ?? '';

    const newVisit: Visit = {
      id,
      personId: input.personId,
      visitDate,
      date: visitDate,
      topic: input.topic.trim(),
      conversationDetails: details.trim(),
      conversation: details.trim(),
      nextTopic: input.nextTopic?.trim() || undefined,
      nextFollowUpDate: input.nextFollowUpDate?.trim() || undefined,
      remarks: input.remarks?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    this.visits.unshift(newVisit);
    saveStored(STORAGE_KEYS.VISITS, this.visits);
    idbDatabase.put(STORES.VISITS, newVisit);

    const person = this.people.find((p) => p.id === input.personId);
    if (person) {
      const newStatus = input.nextTopic ? 'needs_attention' : 'active';
      this.updatePerson(person.id, {
        status: newStatus,
        lastVisitAt: visitDate,
        updatedAt: now,
      });
    }

    notifyChange();
    return newVisit;
  }

  public updateVisit(id: string, updates: Partial<Visit>): Visit | undefined {
    this.init();
    const idx = this.visits.findIndex((v) => v.id === id);
    if (idx === -1) return undefined;

    const existing = this.visits[idx];
    const vDate = updates.visitDate || updates.date || existing.visitDate;
    const vDetails = updates.conversationDetails ?? updates.conversation ?? existing.conversationDetails ?? existing.conversation ?? '';

    this.visits[idx] = {
      ...existing,
      ...updates,
      visitDate: vDate,
      date: vDate,
      conversationDetails: vDetails,
      conversation: vDetails,
      updatedAt: new Date().toISOString(),
    };
    saveStored(STORAGE_KEYS.VISITS, this.visits);
    idbDatabase.put(STORES.VISITS, this.visits[idx]);

    const person = this.people.find((p) => p.id === existing.personId);
    if (person) {
      this.updatePerson(person.id, {
        lastVisitAt: this.computeLastVisitAt(person.id),
      });
    }

    notifyChange();
    return this.visits[idx];
  }

  public deleteVisit(id: string): boolean {
    this.init();
    const target = this.visits.find((v) => v.id === id);
    if (!target) return false;

    this.visits = this.visits.filter((v) => v.id !== id);
    saveStored(STORAGE_KEYS.VISITS, this.visits);
    idbDatabase.delete(STORES.VISITS, id);

    const person = this.people.find((p) => p.id === target.personId);
    if (person) {
      this.updatePerson(person.id, {
        lastVisitAt: this.computeLastVisitAt(person.id),
      });
    }

    notifyChange();
    return true;
  }

  // TERRITORIES
  public getTerritories(): Territory[] {
    this.init();
    return [...this.territories].sort((a, b) =>
      (a.code || a.name).localeCompare(b.code || b.name, undefined, { numeric: true })
    );
  }

  public getTerritory(id: string): Territory | undefined {
    this.init();
    return this.territories.find((t) => t.id === id);
  }

  public addTerritory(input: NewTerritoryInput): Territory {
    this.init();
    const id = `terr-${Date.now()}`;
    const code = input.code?.trim() || String(this.territories.length + 1).padStart(2, '0');
    const now = new Date().toISOString();

    const newTerr: Territory = {
      ...input,
      id,
      code,
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      boundaryNotes: input.boundaryNotes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    this.territories.push(newTerr);
    saveStored(STORAGE_KEYS.TERRITORIES, this.territories);
    idbDatabase.put(STORES.TERRITORIES, newTerr);

    notifyChange();
    return newTerr;
  }

  public updateTerritory(id: string, updates: Partial<Territory>): Territory | undefined {
    this.init();
    const idx = this.territories.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;

    this.territories[idx] = {
      ...this.territories[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveStored(STORAGE_KEYS.TERRITORIES, this.territories);
    idbDatabase.put(STORES.TERRITORIES, this.territories[idx]);

    notifyChange();
    return this.territories[idx];
  }

  public deleteTerritory(id: string): boolean {
    this.init();
    const prevLen = this.territories.length;
    this.territories = this.territories.filter((t) => t.id !== id);
    if (this.territories.length !== prevLen) {
      saveStored(STORAGE_KEYS.TERRITORIES, this.territories);
      idbDatabase.delete(STORES.TERRITORIES, id);

      let peopleUpdated = false;
      this.people = this.people.map((p) => {
        if (p.territoryId === id) {
          peopleUpdated = true;
          return {
            ...p,
            territoryId: '',
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      });

      if (peopleUpdated) {
        saveStored(STORAGE_KEYS.PEOPLE, this.people);
        idbDatabase.saveAll(STORES.PEOPLE, this.people);
      }

      notifyChange();
      return true;
    }
    return false;
  }

  // DERIVED ACTIVE FOLLOW-UPS FROM LATEST VISITS
  // This is the single source of truth for all schedule and follow-up data.
  public getActiveFollowUps(): {
    overdue: ActiveFollowUp[];
    today: ActiveFollowUp[];
    upcoming: ActiveFollowUp[];
    all: ActiveFollowUp[];
  } {
    this.init();
    const todayStr = getLocalDateKey();
    const followUps: ActiveFollowUp[] = [];

    for (const person of this.people) {
      const personVisits = this.visits
        .filter((v) => v.personId === person.id)
        .sort((a, b) => new Date(b.visitDate || b.date).getTime() - new Date(a.visitDate || a.date).getTime());

      const latestVisit = personVisits[0];
      if (latestVisit && latestVisit.nextFollowUpDate && latestVisit.nextFollowUpDate.trim()) {
        const terr = this.getTerritory(person.territoryId);
        followUps.push({
          personId: person.id,
          personName: person.name,
          territoryId: person.territoryId,
          territoryName: terr?.name,
          territoryCode: terr?.code,
          date: latestVisit.nextFollowUpDate.trim(),
          topic: latestVisit.nextTopic?.trim() || latestVisit.topic || 'Follow-up discussion',
          visitId: latestVisit.id,
          visitDate: latestVisit.visitDate || latestVisit.date,
        });
      }
    }

    const overdue = followUps
      .filter((f) => f.date < todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    const today = followUps
      .filter((f) => f.date === todayStr);

    const upcoming = followUps
      .filter((f) => f.date > todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));

    const all = [...overdue, ...today, ...upcoming];

    return { overdue, today, upcoming, all };
  }

  // ACTIVITIES
  public getActivities(limit = 20): ActivityItem[] {
    this.init();
    return [...this.activities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // GLOBAL SEARCH
  public search(query: string) {
    this.init();
    const q = query.trim().toLowerCase();
    if (!q) return { people: [], visits: [], territories: [] };

    const matchedPeople = this.people.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.background?.toLowerCase().includes(q) ||
        p.remarks?.toLowerCase().includes(q)
    );

    const matchedVisits = this.visits.filter(
      (v) =>
        v.topic.toLowerCase().includes(q) ||
        v.conversation.toLowerCase().includes(q) ||
        v.nextTopic?.toLowerCase().includes(q) ||
        v.remarks?.toLowerCase().includes(q)
    );

    const matchedTerritories = this.territories.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.code?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
    );

    return {
      people: matchedPeople,
      visits: matchedVisits,
      territories: matchedTerritories,
    };
  }

  // USER PREFERENCES
  public getUserPreferences(): UserPreferences {
    this.init();
    return { ...this.userPreferences };
  }

  public setUserDisplayName(name: string): void {
    this.init();
    this.userPreferences = {
      ...this.userPreferences,
      displayName: name.trim(),
    };
    saveStored(STORAGE_KEYS.USER_PREFERENCES, this.userPreferences);
    idbDatabase.put(STORES.SETTINGS, { key: 'userPreferences', value: this.userPreferences });
    notifyChange();
  }

  // RESET TO CLEAN STATE
  public resetToDefault() {
    this.people = [];
    this.visits = [];
    this.territories = [];
    this.activities = [];
    saveStored(STORAGE_KEYS.PEOPLE, this.people);
    saveStored(STORAGE_KEYS.VISITS, this.visits);
    saveStored(STORAGE_KEYS.TERRITORIES, this.territories);
    saveStored(STORAGE_KEYS.ACTIVITIES, this.activities);
    idbDatabase.clearStore(STORES.PEOPLE);
    idbDatabase.clearStore(STORES.VISITS);
    idbDatabase.clearStore(STORES.TERRITORIES);
    notifyChange();
  }
}

export const repository = new DataRepository();

// Custom hook to consume the data repository reactively in React components
export function useMinistryData() {
  const [, setTick] = useState(0);

  useEffect(() => {
    repository.init();
    const handleUpdate = () => setTick((prev) => prev + 1);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const getPeople = useCallback(() => repository.getPeople(), []);
  const getPerson = useCallback((id: string) => repository.getPerson(id), []);
  const addPerson = useCallback(
    (input: NewPersonInput, initialVisit?: Omit<NewVisitInput, 'personId'>) =>
      repository.addPerson(input, initialVisit),
    []
  );
  const updatePerson = useCallback(
    (id: string, updates: Partial<Person>) => repository.updatePerson(id, updates),
    []
  );
  const deletePerson = useCallback((id: string) => repository.deletePerson(id), []);

  const getVisits = useCallback((personId?: string) => repository.getVisits(personId), []);
  const getVisit = useCallback((id: string) => repository.getVisit(id), []);
  const addVisit = useCallback((input: NewVisitInput) => repository.addVisit(input), []);
  const updateVisit = useCallback(
    (id: string, updates: Partial<Visit>) => repository.updateVisit(id, updates),
    []
  );
  const deleteVisit = useCallback((id: string) => repository.deleteVisit(id), []);

  const getTerritories = useCallback(() => repository.getTerritories(), []);
  const getTerritory = useCallback((id: string) => repository.getTerritory(id), []);
  const addTerritory = useCallback((input: NewTerritoryInput) => repository.addTerritory(input), []);
  const updateTerritory = useCallback(
    (id: string, updates: Partial<Territory>) => repository.updateTerritory(id, updates),
    []
  );

  const deleteTerritory = useCallback((id: string) => repository.deleteTerritory(id), []);

  const getActiveFollowUps = useCallback(() => repository.getActiveFollowUps(), []);

  const getUserPreferences = useCallback(() => repository.getUserPreferences(), []);
  const setUserDisplayName = useCallback((name: string) => repository.setUserDisplayName(name), []);

  const getActivities = useCallback((limit?: number) => repository.getActivities(limit), []);
  const search = useCallback((query: string) => repository.search(query), []);
  const resetToDefault = useCallback(() => repository.resetToDefault(), []);

  return {
    people: getPeople(),
    visits: getVisits(),
    territories: getTerritories(),
    activeFollowUps: getActiveFollowUps(),
    activities: getActivities(),
    userPreferences: getUserPreferences(),
    userName: getUserPreferences().displayName,
    setUserDisplayName,
    getPerson,
    getTerritory,
    getVisitsForPerson: getVisits,
    getVisit,
    getActiveFollowUps,
    addPerson,
    updatePerson,
    deletePerson,
    addVisit,
    updateVisit,
    deleteVisit,
    addTerritory,
    updateTerritory,
    deleteTerritory,
    search,
    resetToDefault,
  };
}
