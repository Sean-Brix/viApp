import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './api/client';
import vitalService from './api/vital.service';
import adminService from './api/admin.service';
import studentService from './api/student.service';
import type { VitalUploadData } from './api/vital.service';

export type QueueItemType = 
  | 'VITAL_UPLOAD'
  | 'PROFILE_UPDATE'
  | 'ALERT_ACKNOWLEDGE'
  | 'DEVICE_REGISTER'
  | 'STUDENT_CREATE'
  | 'STUDENT_UPDATE';

export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CONFLICT';

export interface QueueItem {
  id: string;
  type: QueueItemType;
  data: any;
  timestamp: string;
  retries: number;
  status: SyncStatus;
  error?: string;
  conflictResolution?: 'SERVER_WINS' | 'CLIENT_WINS' | 'MANUAL';
}

export interface SyncHistory {
  id: string;
  timestamp: string;
  itemsProcessed: number;
  itemsSucceeded: number;
  itemsFailed: number;
  duration: number;
}

class EnhancedOfflineQueueService {
  private readonly MAX_RETRIES = 3;
  private isProcessing = false;
  private listeners: Set<(status: { isProcessing: boolean; queueLength: number }) => void> = new Set();

  /**
   * Add listener for sync status changes
   */
  addListener(callback: (status: { isProcessing: boolean; queueLength: number }) => void): void {
    this.listeners.add(callback);
  }

  /**
   * Remove listener
   */
  removeListener(callback: (status: { isProcessing: boolean; queueLength: number }) => void): void {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(queueLength: number): void {
    const status = { isProcessing: this.isProcessing, queueLength };
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Add item to offline queue
   */
  async addToQueue(type: QueueItemType, data: any): Promise<string> {
    try {
      const queue = await this.getQueue();
      
      const item: QueueItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: new Date().toISOString(),
        retries: 0,
        status: 'PENDING',
      };

      queue.push(item);
      await this.saveQueue(queue);
      
      console.log('Added to offline queue:', item.id, type);
      this.notifyListeners(queue.length);

      return item.id;
    } catch (error) {
      console.error('Failed to add to queue:', error);
      throw error;
    }
  }

  /**
   * Process offline queue with conflict resolution
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('Queue is already being processed');
      return;
    }

    this.isProcessing = true;
    this.notifyListeners((await this.getQueue()).length);

    const startTime = Date.now();
    let successCount = 0;
    let failedCount = 0;

    try {
      const queue = await this.getQueue();
      
      if (queue.length === 0) {
        console.log('Queue is empty');
        return;
      }

      console.log(`Processing ${queue.length} items in queue`);

      // Process items sequentially to handle dependencies
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        
        try {
          // Update status to SYNCING
          item.status = 'SYNCING';
          await this.saveQueue(queue);
          this.notifyListeners(queue.length);

          await this.processQueueItem(item);
          
          // Mark as SYNCED
          item.status = 'SYNCED';
          successCount++;
        } catch (error: any) {
          item.retries++;
          
          // Check if it's a conflict error
          if (error.status === 409 || error.message?.includes('conflict')) {
            item.status = 'CONFLICT';
            item.error = error.message;
            console.warn(`Conflict detected for item ${item.id}:`, error.message);
            
            // Apply conflict resolution strategy
            await this.resolveConflict(item);
          } else if (item.retries >= this.MAX_RETRIES) {
            item.status = 'FAILED';
            item.error = error.message;
            failedCount++;
          } else {
            item.status = 'PENDING';
            failedCount++;
          }
          
          console.error(`Failed to process item ${item.id} (retry ${item.retries}/${this.MAX_RETRIES}):`, error);
        }
      }

      // Remove successfully synced items
      const remainingQueue = queue.filter(item => 
        item.status !== 'SYNCED' && item.retries < this.MAX_RETRIES
      );

      await this.saveQueue(remainingQueue);
      this.notifyListeners(remainingQueue.length);

      // Save sync history
      const duration = Date.now() - startTime;
      await this.saveSyncHistory({
        id: `sync-${Date.now()}`,
        timestamp: new Date().toISOString(),
        itemsProcessed: queue.length,
        itemsSucceeded: successCount,
        itemsFailed: failedCount,
        duration,
      });
      
      console.log(
        `Sync completed: ${successCount} succeeded, ${failedCount} failed, ` +
        `${remainingQueue.length} remaining (${duration}ms)`
      );
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      this.isProcessing = false;
      this.notifyListeners((await this.getQueue()).length);
    }
  }

  /**
   * Process a single queue item
   */
  private async processQueueItem(item: QueueItem): Promise<void> {
    switch (item.type) {
      case 'VITAL_UPLOAD':
        await vitalService.uploadVital(item.data as VitalUploadData);
        break;
        
      case 'PROFILE_UPDATE':
        await studentService.updateProfile(item.data);
        break;
        
      case 'ALERT_ACKNOWLEDGE':
        await adminService.acknowledgeAlert(item.data.alertId);
        break;
        
      case 'DEVICE_REGISTER':
        await adminService.registerDevice(item.data);
        break;
        
      case 'STUDENT_CREATE':
        await adminService.createStudent(item.data);
        break;
        
      case 'STUDENT_UPDATE':
        await adminService.updateStudent(item.data.studentId, item.data.updates);
        break;
        
      default:
        throw new Error(`Unknown queue item type: ${item.type}`);
    }
    
    console.log(`Successfully processed ${item.type}:`, item.id);
  }

  /**
   * Resolve conflict based on strategy
   */
  private async resolveConflict(item: QueueItem): Promise<void> {
    const strategy = item.conflictResolution || 'SERVER_WINS';
    
    switch (strategy) {
      case 'SERVER_WINS':
        // Discard local changes, mark as synced
        item.status = 'SYNCED';
        console.log(`Conflict resolved (SERVER_WINS) for item ${item.id}`);
        break;
        
      case 'CLIENT_WINS':
        // Force update with local changes (this may require special API endpoint)
        item.status = 'PENDING';
        item.retries = 0; // Reset retries to try again
        console.log(`Conflict resolved (CLIENT_WINS) for item ${item.id}, will retry`);
        break;
        
      case 'MANUAL':
        // Keep in CONFLICT state for manual resolution
        console.log(`Conflict marked for manual resolution: ${item.id}`);
        break;
    }
  }

  /**
   * Get queue from storage
   */
  async getQueue(): Promise<QueueItem[]> {
    try {
      const queueJson = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('Failed to get queue:', error);
      return [];
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(queue: QueueItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save queue:', error);
      throw error;
    }
  }

  /**
   * Get queue status for UI display
   */
  async getQueueStatus(): Promise<{
    total: number;
    pending: number;
    syncing: number;
    failed: number;
    conflicts: number;
  }> {
    const queue = await this.getQueue();
    
    return {
      total: queue.length,
      pending: queue.filter(i => i.status === 'PENDING').length,
      syncing: queue.filter(i => i.status === 'SYNCING').length,
      failed: queue.filter(i => i.status === 'FAILED').length,
      conflicts: queue.filter(i => i.status === 'CONFLICT').length,
    };
  }

  /**
   * Clear all synced items from queue
   */
  async clearSyncedItems(): Promise<void> {
    const queue = await this.getQueue();
    const filteredQueue = queue.filter(item => item.status !== 'SYNCED');
    await this.saveQueue(filteredQueue);
    this.notifyListeners(filteredQueue.length);
  }

  /**
   * Clear entire queue
   */
  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    this.notifyListeners(0);
  }

  /**
   * Get sync history
   */
  async getSyncHistory(limit = 10): Promise<SyncHistory[]> {
    try {
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_HISTORY);
      const history: SyncHistory[] = historyJson ? JSON.parse(historyJson) : [];
      return history.slice(0, limit);
    } catch (error) {
      console.error('Failed to get sync history:', error);
      return [];
    }
  }

  /**
   * Save sync history
   */
  private async saveSyncHistory(entry: SyncHistory): Promise<void> {
    try {
      const history = await this.getSyncHistory(50);
      history.unshift(entry);
      
      // Keep only last 50 entries
      const trimmedHistory = history.slice(0, 50);
      
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_HISTORY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Failed to save sync history:', error);
    }
  }

  /**
   * Retry a failed item
   */
  async retryItem(itemId: string): Promise<void> {
    const queue = await this.getQueue();
    const item = queue.find(i => i.id === itemId);
    
    if (item) {
      item.retries = 0;
      item.status = 'PENDING';
      item.error = undefined;
      await this.saveQueue(queue);
      this.notifyListeners(queue.length);
    }
  }

  /**
   * Remove an item from queue
   */
  async removeItem(itemId: string): Promise<void> {
    const queue = await this.getQueue();
    const filteredQueue = queue.filter(i => i.id !== itemId);
    await this.saveQueue(filteredQueue);
    this.notifyListeners(filteredQueue.length);
  }

  /**
   * Set conflict resolution strategy for an item
   */
  async setConflictResolution(
    itemId: string,
    strategy: 'SERVER_WINS' | 'CLIENT_WINS' | 'MANUAL'
  ): Promise<void> {
    const queue = await this.getQueue();
    const item = queue.find(i => i.id === itemId);
    
    if (item) {
      item.conflictResolution = strategy;
      await this.saveQueue(queue);
      this.notifyListeners(queue.length);
    }
  }
}

// Export singleton instance
export const offlineQueueService = new EnhancedOfflineQueueService();

// Export old instance for backwards compatibility
export default offlineQueueService;
