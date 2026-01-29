// Type definitions for ViApp

export interface VitalSign {
  value: number;
  unit: string;
  status: 'normal' | 'high' | 'low';
  trend?: 'up' | 'down' | 'stable';
}

export interface StudentVitals {
  heartRate: VitalSign;
  spO2: VitalSign;
  temperature: VitalSign;
  respiratoryRate: VitalSign;
  bloodPressureSystolic: VitalSign;
  bloodPressureDiastolic: VitalSign;
  lastUpdated: Date;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  gradeLevel: string;
  gender: 'Male' | 'Female';
  status: 'Stable' | 'Needs Attention' | 'Critical';
  medicalHistory: string[];
  vitals: StudentVitals;
  photoUrl?: string;
}

export interface Alert {
  id: string;
  studentId: string;
  studentName: string;
  timestamp: Date;
  vitalSign: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface VitalHistory {
  timestamp: Date;
  value: number;
}

export type Screen = 'home' | 'student-detail' | 'alerts' | 'history' | 'settings';

export type UserType = 'admin' | 'student';

export type StudentScreen = 'dashboard' | 'profile' | 'history' | 'suggestions';