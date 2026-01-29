import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../config/environment';
import { STORAGE_KEYS } from '../api/client';

type VitalSignsUpdateCallback = (data: any) => void;
type AlertCallback = (data: any) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private vitalSignsCallbacks: Set<VitalSignsUpdateCallback> = new Set();
  private alertCallbacks: Set<AlertCallback> = new Set();
  private isConnecting = false;

  async connect() {
    if (this.socket?.connected || this.isConnecting) {
      console.log('⚡ WebSocket already connected or connecting');
      return;
    }

    this.isConnecting = true;

    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        console.warn('⚠️ No access token found, skipping WebSocket connection');
        this.isConnecting = false;
        return;
      }

      const apiUrl = getApiUrl();
      // Remove /api suffix and convert to WebSocket URL
      const baseUrl = apiUrl.replace('/api', '');
      const wsUrl = baseUrl.replace(/^http/, 'http'); // Keep http/https as-is for Socket.IO

      console.log('🔌 Connecting to WebSocket:', wsUrl);
      console.log('🔑 Token:', token.substring(0, 20) + '...');

      this.socket = io(wsUrl, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'], // Add polling as fallback
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupListeners();
      this.isConnecting = false;
    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      this.isConnecting = false;
    }
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      console.log('✅ Connection status:', this.socket?.connected);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('⚠️ WebSocket connection error:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
    });

    // Listen for vital signs updates
    this.socket.on('vitalSigns:update', (data) => {
      console.log('📊 ===== VITAL SIGNS UPDATE RECEIVED =====');
      console.log('📊 StudentId:', data.studentId);
      console.log('📊 Data:', JSON.stringify(data.data));
      console.log('📊 Timestamp:', data.timestamp);
      console.log('📊 Number of callbacks:', this.vitalSignsCallbacks.size);
      console.log('📊 ========================================');
      this.vitalSignsCallbacks.forEach(callback => {
        console.log('📊 Calling callback...');
        callback(data);
      });
    });

    // Listen for alerts
    this.socket.on('alert:new', (data) => {
      console.log('🚨 Received new alert:', data);
      this.alertCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('error', (error) => {
      console.error('⚠️ WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    const connected = this.socket?.connected || false;
    console.log('🔍 WebSocket connection check:', connected);
    return connected;
  }

  // Get connection state for debugging
  getConnectionState(): string {
    if (!this.socket) return 'NO_SOCKET';
    if (this.socket.connected) return 'CONNECTED';
    if (this.isConnecting) return 'CONNECTING';
    return 'DISCONNECTED';
  }

  // Subscribe to vital signs updates
  onVitalSignsUpdate(callback: VitalSignsUpdateCallback) {
    this.vitalSignsCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.vitalSignsCallbacks.delete(callback);
    };
  }

  // Subscribe to alerts
  onAlert(callback: AlertCallback) {
    this.alertCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.alertCallbacks.delete(callback);
    };
  }

  // Clear all callbacks
  clearCallbacks() {
    this.vitalSignsCallbacks.clear();
    this.alertCallbacks.clear();
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
