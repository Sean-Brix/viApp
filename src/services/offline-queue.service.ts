import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './api/client';
import vitalService from './api/vital.service';
import type { VitalUploadData } from './api/vital.service';

interface QueueItem {
  id: string;
  type: 'VITAL_UPLOAD';
  data: VitalUploadData;
  timestamp: string;
  retries: number;
}

class OfflineQueueService {
  private readonly MAX_RETRIES = 3;
  private isProcessing = false;

  /**
   * Add item to offline queue
   */
  async addToQueue(type: 'VITAL_UPLOAD', data: VitalUploadData): Promise<void> {
    try {
      const queue = await this.getQueue();
      
      const item: QueueItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: new Date().toISOString(),
        retries: 0,
      };

      queue.push(item);
      await this.saveQueue(queue);
      
      console.log('Added to offline queue:', item.id);
    } catch (error) {
      console.error('Failed to add to queue:', error);
    }
  }

  /**
   * Process offline queue
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('Queue is already being processed');
      return;
    }

    this.isProcessing = true;

    try {
      const queue = await this.getQueue();
      
      if (queue.length === 0) {
        console.log('Queue is empty');
        return;
      }

      console.log(`Processing ${queue.length} items in queue`);

      const results = await Promise.allSettled(
        queue.map(item => this.processQueueItem(item))
      );

      // Filter out successfully processed items
      const remainingQueue = queue.filter((item, index) => {
        const result = results[index];
        return result.status === 'rejected' && item.retries < this.MAX_RETRIES;
      });

      await this.saveQueue(remainingQueue);
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      console.log(`Processed ${successCount} items successfully, ${remainingQueue.length} remaining`);
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single queue item
   */
  private async processQueueItem(item: QueueItem): Promise<void> {
    try {
      if (item.type === 'VITAL_UPLOAD') {
        await vitalService.uploadVital(item.data);
        console.log('Successfully uploaded vital:', item.id);
      }
    } catch (error) {
      item.retries++;
      console.error(`Failed to process item ${item.id} (retry ${item.retries}/${this.MAX_RETRIES}):`, error);
      throw error;
    }
  }

  /**
   * Get queue from storage
   */
  private async getQueue(): Promise<QueueItem[]> {
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
    }
  }

  /**
   * Clear entire queue
   */
  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    console.log('Queue cleared');
  }

  /**
   * Get queue size
   */
  async getQueueSize(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }
}

export default new OfflineQueueService();
