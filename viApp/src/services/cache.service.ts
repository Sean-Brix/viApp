import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache keys
const CACHE_KEYS = {
  STUDENT_LIST: 'cache_student_list',
  STUDENT_PROFILE: 'cache_student_profile',
  VITALS_HISTORY: 'cache_vitals_history',
  ALERTS: 'cache_alerts',
  DEVICES: 'cache_devices',
  NOTIFICATION_SETTINGS: 'cache_notification_settings',
};

// Cache TTL (Time To Live) in milliseconds
const CACHE_TTL = {
  STUDENT_LIST: 5 * 60 * 1000, // 5 minutes
  STUDENT_PROFILE: 10 * 60 * 1000, // 10 minutes
  VITALS_HISTORY: 15 * 60 * 1000, // 15 minutes
  ALERTS: 2 * 60 * 1000, // 2 minutes (more frequent for critical data)
  DEVICES: 10 * 60 * 1000, // 10 minutes
  NOTIFICATION_SETTINGS: 30 * 60 * 1000, // 30 minutes
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  /**
   * Set cache with TTL
   */
  async set<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error(`Failed to set cache for ${key}:`, error);
    }
  }

  /**
   * Get cache if not expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(value);
      const now = Date.now();

      // Check if cache is expired
      if (now - entry.timestamp > entry.ttl) {
        await this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error(`Failed to get cache for ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove specific cache
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove cache for ${key}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  /**
   * Cache student list
   */
  async setStudentList(data: any[]): Promise<void> {
    await this.set(CACHE_KEYS.STUDENT_LIST, data, CACHE_TTL.STUDENT_LIST);
  }

  async getStudentList(): Promise<any[] | null> {
    return this.get<any[]>(CACHE_KEYS.STUDENT_LIST);
  }

  /**
   * Cache student profile (by studentId)
   */
  async setStudentProfile(studentId: string, data: any): Promise<void> {
    const key = `${CACHE_KEYS.STUDENT_PROFILE}_${studentId}`;
    await this.set(key, data, CACHE_TTL.STUDENT_PROFILE);
  }

  async getStudentProfile(studentId: string): Promise<any | null> {
    const key = `${CACHE_KEYS.STUDENT_PROFILE}_${studentId}`;
    return this.get<any>(key);
  }

  async removeStudentProfile(studentId: string): Promise<void> {
    const key = `${CACHE_KEYS.STUDENT_PROFILE}_${studentId}`;
    await this.remove(key);
  }

  /**
   * Cache vitals history (by studentId)
   */
  async setVitalsHistory(studentId: string, data: any[]): Promise<void> {
    const key = `${CACHE_KEYS.VITALS_HISTORY}_${studentId}`;
    await this.set(key, data, CACHE_TTL.VITALS_HISTORY);
  }

  async getVitalsHistory(studentId: string): Promise<any[] | null> {
    const key = `${CACHE_KEYS.VITALS_HISTORY}_${studentId}`;
    return this.get<any[]>(key);
  }

  async removeVitalsHistory(studentId: string): Promise<void> {
    const key = `${CACHE_KEYS.VITALS_HISTORY}_${studentId}`;
    await this.remove(key);
  }

  /**
   * Cache alerts
   */
  async setAlerts(data: any[]): Promise<void> {
    await this.set(CACHE_KEYS.ALERTS, data, CACHE_TTL.ALERTS);
  }

  async getAlerts(): Promise<any[] | null> {
    return this.get<any[]>(CACHE_KEYS.ALERTS);
  }

  /**
   * Cache devices
   */
  async setDevices(data: any[]): Promise<void> {
    await this.set(CACHE_KEYS.DEVICES, data, CACHE_TTL.DEVICES);
  }

  async getDevices(): Promise<any[] | null> {
    return this.get<any[]>(CACHE_KEYS.DEVICES);
  }

  /**
   * Cache notification settings
   */
  async setNotificationSettings(data: any): Promise<void> {
    await this.set(CACHE_KEYS.NOTIFICATION_SETTINGS, data, CACHE_TTL.NOTIFICATION_SETTINGS);
  }

  async getNotificationSettings(): Promise<any | null> {
    return this.get<any>(CACHE_KEYS.NOTIFICATION_SETTINGS);
  }

  /**
   * Invalidate specific caches after updates
   */
  async invalidateStudentCaches(studentId?: string): Promise<void> {
    await this.remove(CACHE_KEYS.STUDENT_LIST);
    if (studentId) {
      await this.removeStudentProfile(studentId);
      await this.removeVitalsHistory(studentId);
    }
  }

  async invalidateAlertCaches(): Promise<void> {
    await this.remove(CACHE_KEYS.ALERTS);
  }

  async invalidateDeviceCaches(): Promise<void> {
    await this.remove(CACHE_KEYS.DEVICES);
  }

  /**
   * Get cache info for debugging
   */
  async getCacheInfo(): Promise<Record<string, any>> {
    const info: Record<string, any> = {};
    
    for (const [name, key] of Object.entries(CACHE_KEYS)) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        try {
          const entry: CacheEntry<any> = JSON.parse(value);
          const age = Date.now() - entry.timestamp;
          const remaining = entry.ttl - age;
          info[name] = {
            exists: true,
            ageMs: age,
            remainingMs: Math.max(0, remaining),
            expired: remaining <= 0,
          };
        } catch {
          info[name] = { exists: true, error: 'Failed to parse' };
        }
      } else {
        info[name] = { exists: false };
      }
    }
    
    return info;
  }
}

export const cacheService = new CacheService();
