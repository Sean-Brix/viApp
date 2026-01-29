// Mock data for ViApp
import { Student, Alert, VitalHistory } from './types';

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Maria Santos',
    age: 17,
    gradeLevel: 'Grade 11',
    gender: 'Female',
    status: 'Stable',
    medicalHistory: ['Asthma'],
    vitals: {
      heartRate: { value: 72, unit: 'bpm', status: 'normal', trend: 'stable' },
      spO2: { value: 98, unit: '%', status: 'normal', trend: 'stable' },
      temperature: { value: 36.8, unit: '°C', status: 'normal', trend: 'stable' },
      respiratoryRate: { value: 16, unit: '/min', status: 'normal', trend: 'stable' },
      bloodPressureSystolic: { value: 118, unit: 'mmHg', status: 'normal', trend: 'stable' },
      bloodPressureDiastolic: { value: 78, unit: 'mmHg', status: 'normal', trend: 'stable' },
      lastUpdated: new Date(Date.now() - 30000)
    }
  },
  {
    id: '2',
    name: 'John Reyes',
    age: 16,
    gradeLevel: 'Grade 10',
    gender: 'Male',
    status: 'Needs Attention',
    medicalHistory: ['Hypertension'],
    vitals: {
      heartRate: { value: 88, unit: 'bpm', status: 'high', trend: 'up' },
      spO2: { value: 96, unit: '%', status: 'normal', trend: 'stable' },
      temperature: { value: 37.2, unit: '°C', status: 'normal', trend: 'stable' },
      respiratoryRate: { value: 18, unit: '/min', status: 'normal', trend: 'stable' },
      bloodPressureSystolic: { value: 142, unit: 'mmHg', status: 'high', trend: 'up' },
      bloodPressureDiastolic: { value: 88, unit: 'mmHg', status: 'high', trend: 'stable' },
      lastUpdated: new Date(Date.now() - 15000)
    }
  },
  {
    id: '3',
    name: 'Ana Cruz',
    age: 18,
    gradeLevel: 'Grade 12',
    gender: 'Female',
    status: 'Stable',
    medicalHistory: [],
    vitals: {
      heartRate: { value: 68, unit: 'bpm', status: 'normal', trend: 'stable' },
      spO2: { value: 99, unit: '%', status: 'normal', trend: 'stable' },
      temperature: { value: 36.6, unit: '°C', status: 'normal', trend: 'stable' },
      respiratoryRate: { value: 14, unit: '/min', status: 'normal', trend: 'stable' },
      bloodPressureSystolic: { value: 115, unit: 'mmHg', status: 'normal', trend: 'stable' },
      bloodPressureDiastolic: { value: 75, unit: 'mmHg', status: 'normal', trend: 'stable' },
      lastUpdated: new Date(Date.now() - 45000)
    }
  },
  {
    id: '4',
    name: 'Carlos Diaz',
    age: 17,
    gradeLevel: 'Grade 11',
    gender: 'Male',
    status: 'Critical',
    medicalHistory: ['Diabetes'],
    vitals: {
      heartRate: { value: 105, unit: 'bpm', status: 'high', trend: 'up' },
      spO2: { value: 94, unit: '%', status: 'low', trend: 'down' },
      temperature: { value: 38.4, unit: '°C', status: 'high', trend: 'up' },
      respiratoryRate: { value: 22, unit: '/min', status: 'high', trend: 'up' },
      bloodPressureSystolic: { value: 155, unit: 'mmHg', status: 'high', trend: 'up' },
      bloodPressureDiastolic: { value: 95, unit: 'mmHg', status: 'high', trend: 'up' },
      lastUpdated: new Date(Date.now() - 5000)
    }
  },
  {
    id: '5',
    name: 'Sofia Lopez',
    age: 16,
    gradeLevel: 'Grade 10',
    gender: 'Female',
    status: 'Stable',
    medicalHistory: [],
    vitals: {
      heartRate: { value: 74, unit: 'bpm', status: 'normal', trend: 'stable' },
      spO2: { value: 98, unit: '%', status: 'normal', trend: 'stable' },
      temperature: { value: 36.9, unit: '°C', status: 'normal', trend: 'stable' },
      respiratoryRate: { value: 15, unit: '/min', status: 'normal', trend: 'stable' },
      bloodPressureSystolic: { value: 120, unit: 'mmHg', status: 'normal', trend: 'stable' },
      bloodPressureDiastolic: { value: 80, unit: 'mmHg', status: 'normal', trend: 'stable' },
      lastUpdated: new Date(Date.now() - 60000)
    }
  }
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    studentId: '4',
    studentName: 'Carlos Diaz',
    timestamp: new Date(Date.now() - 5000),
    vitalSign: 'Temperature',
    message: 'High temperature detected (38.4°C). Please recheck manually.',
    severity: 'high'
  },
  {
    id: '2',
    studentId: '4',
    studentName: 'Carlos Diaz',
    timestamp: new Date(Date.now() - 5000),
    vitalSign: 'SpO₂',
    message: 'Low blood oxygen saturation (94%). Monitor closely.',
    severity: 'high'
  },
  {
    id: '3',
    studentId: '2',
    studentName: 'John Reyes',
    timestamp: new Date(Date.now() - 15000),
    vitalSign: 'Blood Pressure',
    message: 'High BP detected (142/88). Please recheck manually.',
    severity: 'medium'
  },
  {
    id: '4',
    studentId: '2',
    studentName: 'John Reyes',
    timestamp: new Date(Date.now() - 900000),
    vitalSign: 'Heart Rate',
    message: 'Elevated heart rate (88 bpm). Continue monitoring.',
    severity: 'low'
  }
];

// Generate mock vital history data
export const generateVitalHistory = (baseValue: number, variance: number, days: number = 7): VitalHistory[] => {
  const history: VitalHistory[] = [];
  const now = new Date();
  const pointsPerDay = 24; // One reading per hour
  
  for (let i = days * pointsPerDay; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const randomVariance = (Math.random() - 0.5) * variance;
    const value = baseValue + randomVariance;
    history.push({ timestamp, value });
  }
  
  return history;
};
