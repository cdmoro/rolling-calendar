import type { LocalStorageKey } from '../types/app';

export const ls = {
  getItem<T = string>(key: LocalStorageKey): T | null {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as T;
    }
  },
  getItemOr<T>(key: LocalStorageKey, defaultValue: T): T {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    try {
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  },
  setItem<T>(key: LocalStorageKey, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  removeItem(key: LocalStorageKey) {
    localStorage.removeItem(key);
  }
};
