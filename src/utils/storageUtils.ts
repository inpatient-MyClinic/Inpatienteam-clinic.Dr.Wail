/**
 * Safe localStorage utilities to prevent errors and handle edge cases
 */

export class SafeStorage {
  /**
   * Safely get an item from localStorage
   */
  static getItem<T = any>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Safely set an item in localStorage
   */
  static setItem(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Safely remove an item from localStorage
   */
  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all localStorage data safely
   */
  static clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Get all keys from localStorage safely
   */
  static getAllKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  /**
   * Get storage quota information
   */
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const estimate = 5 * 1024 * 1024; // Approximate 5MB limit
      const used = new Blob(Object.values(localStorage)).size;
      const available = estimate - used;
      const percentage = (used / estimate) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}

/**
 * Event-based storage system for cross-component communication
 */
export class StorageEventManager {
  private static listeners = new Map<string, Set<(data: any) => void>>();

  static subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        keyListeners.delete(callback);
        if (keyListeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  static notify(key: string, data: any): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in storage event listener for "${key}":`, error);
        }
      });
    }

    // Also trigger storage event for other windows/tabs
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: JSON.stringify(data),
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('Error dispatching storage event:', error);
    }
  }
}