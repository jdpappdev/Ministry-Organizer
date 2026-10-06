/**
 * IndexedDB Local Storage Layer for Ministry Organizer.
 * Fully offline, device-centric persistent database.
 * 
 * Schema:
 * - people: source of truth for contacts/people
 * - territories: source of truth for territories
 * - visits: source of truth for field visits (follow-ups/schedule are derived dynamically from visits)
 * - settings: source of truth for user preferences (e.g. displayName)
 */

import { Person, Visit, Territory } from '../types';
import { UserPreferences } from './store';

const DB_NAME = 'MinistryOrganizerDB';
const DB_VERSION = 2;

export const STORES = {
  PEOPLE: 'people',
  TERRITORIES: 'territories',
  VISITS: 'visits',
  SETTINGS: 'settings',
} as const;

export interface SettingsRecord {
  key: string;
  value: any;
}

class IndexedDBDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORES.PEOPLE)) {
          db.createObjectStore(STORES.PEOPLE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.TERRITORIES)) {
          db.createObjectStore(STORES.TERRITORIES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.VISITS)) {
          db.createObjectStore(STORES.VISITS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        // Clean up legacy 'schedule' object store if present from v1
        if (db.objectStoreNames.contains('schedule')) {
          db.deleteObjectStore('schedule');
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  public async getAll<T>(storeName: string): Promise<T[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();

        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error(`Error reading store "${storeName}":`, err);
      return [];
    }
  }

  public async get<T>(storeName: string, key: string): Promise<T | undefined> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);

        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error(`Error reading key "${key}" from "${storeName}":`, err);
      return undefined;
    }
  }

  public async put<T>(storeName: string, value: T): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.put(value);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error(`Error writing to store "${storeName}":`, err);
    }
  }

  public async delete(storeName: string, key: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(key);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error(`Error deleting key "${key}" from "${storeName}":`, err);
    }
  }

  public async clearStore(storeName: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.clear();

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error(`Error clearing store "${storeName}":`, err);
    }
  }

  public async saveAll<T>(storeName: string, items: T[]): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        for (const item of items) {
          store.put(item);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.error(`Error saving all to store "${storeName}":`, err);
    }
  }
}

export const idbDatabase = new IndexedDBDatabase();
