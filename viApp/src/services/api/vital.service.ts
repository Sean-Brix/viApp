import apiClient from './client';
import type { VitalReading } from './student.service';

export interface VitalUploadData {
  heartRate: number;
  temperature: number;
  spo2: number;
  respiratoryRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  deviceId: string;
  timestamp?: string;
}

export interface BulkVitalUploadData {
  vitals: VitalUploadData[];
}

class VitalService {
  /**
   * Upload single vital reading
   */
  async uploadVital(data: VitalUploadData): Promise<VitalReading> {
    try {
      const response = await apiClient.post('/vitals/upload', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload vital reading');
    }
  }

  /**
   * Bulk upload vital readings (for offline sync)
   */
  async bulkUploadVitals(data: BulkVitalUploadData): Promise<{
    success: number;
    failed: number;
    results: Array<{ success: boolean; data?: VitalReading; error?: string }>;
  }> {
    try {
      const response = await apiClient.post('/vitals/bulk-upload', data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to bulk upload vitals');
    }
  }
}

export default new VitalService();
