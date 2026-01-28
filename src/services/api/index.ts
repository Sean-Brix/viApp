// Export all API services
export { default as authService } from './auth.service';
export { default as studentService } from './student.service';
export { default as adminService } from './admin.service';
export { default as vitalService } from './vital.service';
export { default as apiClient } from './client';

// Export cache service
export { cacheService } from '../cache.service';

// Export utilities
export { 
  clearAuth, 
  saveAuth, 
  getUserData, 
  isAuthenticated,
  STORAGE_KEYS 
} from './client';

// Export types
export type { LoginRequest, RegisterRequest, AuthResponse } from './auth.service';
export type { 
  StudentProfile, 
  VitalReading, 
  Alert, 
  NotificationSettings 
} from './student.service';
export type { 
  Device, 
  StudentListItem 
} from './admin.service';
export type { 
  VitalUploadData, 
  BulkVitalUploadData 
} from './vital.service';
