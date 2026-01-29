import apiClient from './client';
import type { StudentProfile, Alert, VitalReading } from './student.service';
import { cacheService } from '../cache.service';

export interface Device {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  macAddress: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  batteryLevel?: number;
  lastSyncedAt?: string;
  studentId?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    user: {
      username: string;
      email: string;
    };
  };
}

export interface StudentListItem {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  contactNumber?: string;
  status: 'STABLE' | 'NEEDS_ATTENTION' | 'CRITICAL';
  device?: Device;
  latestVital?: VitalReading;
  activeAlerts: number;
}

class AdminService {
  /**
   * Get all students (with caching)
   */
  async getStudents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    forceRefresh?: boolean;
  }): Promise<{ students: StudentListItem[]; total: number; page: number; totalPages: number }> {
    try {
      // Check cache if no search/filter and not forcing refresh
      if (!params?.search && !params?.status && !params?.forceRefresh) {
        const cached = await cacheService.getStudentList();
        if (cached) {
          return cached;
        }
      }

      const response = await apiClient.get('/admin/students', { params });
      const data = response.data.data;

      // Cache the result if no search/filter
      if (!params?.search && !params?.status) {
        await cacheService.setStudentList(data);
      }

      return data;
    } catch (error: any) {
      // Try to return cached data on network error
      const cached = await cacheService.getStudentList();
      if (cached) {
        return cached;
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch students');
    }
  }

  /**
   * Get student details by ID (with caching)
   */
  async getStudentById(studentId: string, forceRefresh = false): Promise<StudentProfile> {
    try {
      // Check cache
      if (!forceRefresh) {
        const cached = await cacheService.getStudentProfile(studentId);
        if (cached) {
          return cached;
        }
      }

      const response = await apiClient.get(`/admin/student/${studentId}`);
      const data = response.data.data;

      // Cache the result
      await cacheService.setStudentProfile(studentId, data);

      return data;
    } catch (error: any) {
      // Try to return cached data on network error
      const cached = await cacheService.getStudentProfile(studentId);
      if (cached) {
        return cached;
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch student');
    }
  }

  /**
   * Create new student
   */
  async createStudent(data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthdate: string;
    gender: 'MALE' | 'FEMALE';
    gradeLevel: string;
    section?: string;
    weight?: number;
    height?: number;
    contactNumber?: string;
    guardianName?: string;
    guardianContact?: string;
  }): Promise<StudentProfile> {
    try {
      console.log('Creating student with data:', { ...data, password: '***' });
      const response = await apiClient.post('/admin/student/create', data);
      console.log('Student created successfully:', response.data);
      
      // Invalidate student list cache
      await cacheService.invalidateStudentCaches();
      
      return response.data.data;
    } catch (error: any) {
      console.error('Admin service createStudent error:', error);
      console.error('Error code:', error.code);
      console.error('Error config:', error.config?.url);
      
      // Network error (no response from server)
      if (!error.response) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout: Server is taking too long to respond. Please try again.');
        }
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
          throw new Error('Network error: Cannot connect to server. Please check:\n1. Your internet connection\n2. Backend server is running\n3. API URL is correct');
        }
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.');
      }
      
      // Server responded with error
      const errorMessage = error.response?.data?.error?.message 
        || error.response?.data?.message 
        || error.response?.data?.error
        || `Server error (${error.response?.status}): Failed to create student`;
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Update student
   */
  async updateStudent(studentId: string, data: Partial<StudentProfile>): Promise<StudentProfile> {
    try {
      const response = await apiClient.put(`/admin/student/${studentId}`, data);
      
      // Invalidate caches
      await cacheService.invalidateStudentCaches(studentId);
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update student');
    }
  }

  /**
   * Deactivate student
   */
  async deactivateStudent(studentId: string): Promise<{ message: string }> {
    try {
      console.log('API: Deactivating student:', studentId);
      const response = await apiClient.delete(`/admin/student/${studentId}`);
      console.log('API: Deactivate response:', response.data);
      
      // Invalidate caches
      await cacheService.invalidateStudentCaches(studentId);
      
      return response.data;
    } catch (error: any) {
      console.error('API: Deactivate student error:', error);
      console.error('API: Error response:', error.response?.data);
      
      // Network error
      if (!error.response) {
        throw new Error('Network error: Unable to connect to server');
      }
      
      const errorMessage = error.response?.data?.error?.message 
        || error.response?.data?.message 
        || error.response?.data?.error
        || 'Failed to delete student';
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all alerts (with caching)
   */
  async getAlerts(params?: {
    page?: number;
    limit?: number;
    severity?: string;
    studentId?: string;
    acknowledged?: boolean;
    resolved?: boolean;
    forceRefresh?: boolean;
  }): Promise<{ alerts: Alert[]; total: number; page: number; totalPages: number }> {
    try {
      // Check cache if no filters and not forcing refresh
      if (!params?.severity && !params?.studentId && !params?.acknowledged && !params?.resolved && !params?.forceRefresh) {
        const cached = await cacheService.getAlerts();
        if (cached) {
          return cached;
        }
      }

      const response = await apiClient.get('/admin/alerts', { params });
      const data = response.data.data;

      // Cache the result if no filters
      if (!params?.severity && !params?.studentId && !params?.acknowledged && !params?.resolved) {
        await cacheService.setAlerts(data);
      }

      return data;
    } catch (error: any) {
      // Try to return cached data on network error
      const cached = await cacheService.getAlerts();
      if (cached) {
        return cached;
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch alerts');
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string): Promise<Alert> {
    try {
      const response = await apiClient.put(`/admin/alerts/${alertId}/acknowledge`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to acknowledge alert');
    }
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string, notes?: string): Promise<Alert> {
    try {
      const response = await apiClient.put(`/admin/alerts/${alertId}/resolve`, { notes });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resolve alert');
    }
  }

  /**
   * Register new device
   */
  async registerDevice(data: {
    deviceId: string;
    deviceName: string;
    deviceType: string;
    macAddress: string;
  }): Promise<Device> {
    try {
      const response = await apiClient.post('/admin/device/register', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to register device');
    }
  }

  /**
   * Assign device to student
   */
  async assignDevice(deviceId: string, studentId: string): Promise<Device> {
    try {
      const response = await apiClient.put(`/admin/device/${deviceId}/assign`, { studentId });
      
      // Invalidate student list cache
      await cacheService.invalidateStudentCaches();
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to assign device');
    }
  }

  /**
   * Unassign device from student
   */
  async unassignDevice(deviceId: string): Promise<Device> {
    try {
      const response = await apiClient.put(`/admin/device/${deviceId}/unassign`);
      
      // Invalidate student list cache
      await cacheService.invalidateStudentCaches();
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to unassign device');
    }
  }

  /**
   * Get all devices
   */
  async getDevices(params?: {
    page?: number;
    limit?: number;
    status?: string;
    assigned?: boolean;
  }): Promise<{ devices: Device[]; total: number; page: number; totalPages: number }> {
    try {
      const response = await apiClient.get('/admin/devices', { params });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch devices');
    }
  }

  /**
   * Get medical history for a student
   */
  async getMedicalHistory(studentId: string): Promise<MedicalHistoryRecord[]> {
    try {
      const response = await apiClient.get(`/admin/student/${studentId}/medical-history`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch medical history');
    }
  }

  /**
   * Add medical history record
   */
  async addMedicalHistory(studentId: string, data: {
    type: string;
    description: string;
    diagnosedAt?: string;
    notes?: string;
  }): Promise<MedicalHistoryRecord> {
    try {
      const response = await apiClient.post(`/admin/student/${studentId}/medical-history`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add medical history');
    }
  }

  /**
   * Update medical history record
   */
  async updateMedicalHistory(historyId: string, data: {
    type?: string;
    description?: string;
    diagnosedAt?: string;
    notes?: string;
    isActive?: boolean;
  }): Promise<MedicalHistoryRecord> {
    try {
      const response = await apiClient.put(`/admin/medical-history/${historyId}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update medical history');
    }
  }

  /**
   * Delete medical history record
   */
  async deleteMedicalHistory(historyId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/medical-history/${historyId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete medical history');
    }
  }
}

// Type definitions
interface MedicalHistoryRecord {
  id: string;
  studentId: string;
  type: string;
  description: string;
  diagnosedAt: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default new AdminService();
