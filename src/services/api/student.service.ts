import apiClient from './client';
import { cacheService } from '../cache.service';

export interface StudentProfile {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  contactNumber?: string;
  address?: string;
  guardianName?: string;
  guardianContact?: string;
  medicalHistory?: any;
  emergencyContacts?: any[];
  device?: any;
  user?: any;
}

export interface VitalReading {
  id: string;
  heartRate: number;
  temperature: number;
  spo2: number;
  respiratoryRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  trend: 'STABLE' | 'IMPROVING' | 'DECLINING';
  timestamp: string;
  recordedBy: string;
}

export interface Alert {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  vital?: VitalReading;
}

export interface NotificationSettings {
  id: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  alertThresholds: any;
}

class StudentService {
  /**
   * Get student profile (with caching)
   */
  async getProfile(forceRefresh = false): Promise<StudentProfile> {
    try {
      // Check cache
      if (!forceRefresh) {
        const cached = await cacheService.getStudentProfile('current');
        if (cached) {
          return cached;
        }
      }

      const response = await apiClient.get('/student/profile');
      const data = response.data.data;

      // Cache the result
      await cacheService.setStudentProfile('current', data);

      return data;
    } catch (error: any) {
      // Try to return cached data on network error
      const cached = await cacheService.getStudentProfile('current');
      if (cached) {
        return cached;
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  /**
   * Update student profile
   */
  async updateProfile(data: Partial<StudentProfile>): Promise<StudentProfile> {
    try {
      const response = await apiClient.put('/student/profile', data);
      
      // Invalidate cache
      await cacheService.removeStudentProfile('current');
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  /**
   * Get latest vital readings
   */
  async getLatestVitals(): Promise<VitalReading> {
    try {
      const response = await apiClient.get('/student/vitals/latest');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vitals');
    }
  }

  /**
   * Get vitals history (with caching)
   */
  async getVitalsHistory(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    forceRefresh?: boolean;
  }): Promise<{ vitals: VitalReading[]; total: number; page: number; totalPages: number }> {
    try {
      // Check cache if no date filters and not forcing refresh
      if (!params?.startDate && !params?.endDate && !params?.forceRefresh) {
        const cached = await cacheService.getVitalsHistory('current');
        if (cached) {
          return cached;
        }
      }

      const response = await apiClient.get('/student/vitals/history', { params });
      const data = response.data.data;

      // Cache the result if no date filters
      if (!params?.startDate && !params?.endDate) {
        await cacheService.setVitalsHistory('current', data);
      }

      return data;
    } catch (error: any) {
      // Try to return cached data on network error
      const cached = await cacheService.getVitalsHistory('current');
      if (cached) {
        return cached;
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch vitals history');
    }
  }

  /**
   * Get student alerts
   */
  async getAlerts(params?: {
    page?: number;
    limit?: number;
    severity?: string;
    acknowledged?: boolean;
  }): Promise<{ alerts: Alert[]; total: number; page: number; totalPages: number }> {
    try {
      const response = await apiClient.get('/student/alerts', { params });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch alerts');
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string): Promise<Alert> {
    try {
      const response = await apiClient.put(`/student/alerts/${alertId}/acknowledge`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to acknowledge alert');
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await apiClient.get('/student/notifications');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification settings');
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    try {
      const response = await apiClient.put('/student/notifications', settings);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update notification settings');
    }
  }
}

export default new StudentService();
