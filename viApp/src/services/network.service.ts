import NetInfo from '@react-native-community/netinfo';
import offlineQueueService from './offline-queue.service';

type NetworkStatusCallback = (isConnected: boolean) => void;

class NetworkService {
  private listeners: Set<NetworkStatusCallback> = new Set();
  private isConnected: boolean = true;
  private unsubscribe: (() => void) | null = null;

  /**
   * Initialize network monitoring
   */
  init() {
    this.unsubscribe = NetInfo.addEventListener(state => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected ?? false;

      // Notify all listeners
      this.listeners.forEach(callback => callback(this.isConnected));

      // If connection restored, process offline queue
      if (!wasConnected && this.isConnected) {
        console.log('Network connection restored, processing offline queue...');
        offlineQueueService.processQueue().catch(error => {
          console.error('Failed to process offline queue:', error);
        });
      }

      console.log('Network status:', this.isConnected ? 'Connected' : 'Disconnected');
    });
  }

  /**
   * Clean up network monitoring
   */
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
  }

  /**
   * Add network status listener
   */
  addListener(callback: NetworkStatusCallback) {
    this.listeners.add(callback);
    // Immediately call with current status
    callback(this.isConnected);
  }

  /**
   * Remove network status listener
   */
  removeListener(callback: NetworkStatusCallback) {
    this.listeners.delete(callback);
  }

  /**
   * Get current network status
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Check network status (async)
   */
  async checkConnection(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isConnected = state.isConnected ?? false;
    return this.isConnected;
  }
}

export default new NetworkService();
