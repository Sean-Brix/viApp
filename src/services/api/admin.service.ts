import apiClient from './client';
import type { StudentProfile, Alert, VitalReading } from './student.service';
import { cacheService } from '../cache.service';

export interface Device {
  id: string;
  deviceId: string;
  serialNumber: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  batteryLevel?: number;
  lastSync?: string;
  assignedTo?: string;
  student?: StudentProfile;
}

export interface StudentListItem {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  contactNumber?: string;
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
    dateOfBirth: string;
    gender: string;
    contactNumber?: string;
    address?: string;
    guardianName?: string;
    guardianContact?: string;
  }): Promise<StudentProfile> {
    try {
      const response = await apiClient.post('/admin/student/create', data);
      
      // Invalidate student list cache
      await cacheService.invalidateStudentCaches();
      
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create student');
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
      const response = await apiClient.delete(`/admin/student/${studentId}`);
      
      // Invalidate caches
      await cacheService.invalidateStudentCaches(studentId);
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to deactivate student');
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
    serialNumber: string;
    model?: string;
    manufacturer?: string;
  }): Promise<Device> {
    try {
      const response = await apiClient.post('/admin/device/register', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to register device');
    }
  }

  /**
   * Assign device to student
   */
  async assignDevice(deviceId: string, studentId: string): Promise<Device> {
    try {
      const response = await apiClient.put(`/admin/device/${deviceId}/assign`, { studentId });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to assign device');
    }
  }

  /**
   * Unassign device from student
   */
  async unassignDevice(deviceId: string): Promise<Device> {
    try {
      const response = await apiClient.put(`/admin/device/${deviceId}/unassign`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to unassign device');
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
}

export default new AdminService();
