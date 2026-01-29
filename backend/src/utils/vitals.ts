export interface VitalThresholds {
  temperature: { high: number; low: number };
  spO2: { low: number };
  heartRate: { high: number; low: number };
  respiratoryRate: { high: number; low: number };
  bloodPressure: {
    systolic: { high: number; low: number };
    diastolic: { high: number; low: number };
  };
}

export const getThresholds = (): VitalThresholds => ({
  temperature: {
    high: parseFloat(process.env.TEMP_HIGH_THRESHOLD || '38.0'),
    low: parseFloat(process.env.TEMP_LOW_THRESHOLD || '35.5'),
  },
  spO2: {
    low: parseInt(process.env.SPO2_LOW_THRESHOLD || '95'),
  },
  heartRate: {
    high: parseInt(process.env.HR_HIGH_THRESHOLD || '100'),
    low: parseInt(process.env.HR_LOW_THRESHOLD || '60'),
  },
  respiratoryRate: {
    high: parseInt(process.env.RR_HIGH_THRESHOLD || '20'),
    low: parseInt(process.env.RR_LOW_THRESHOLD || '12'),
  },
  bloodPressure: {
    systolic: {
      high: parseInt(process.env.BP_SYSTOLIC_HIGH || '140'),
      low: parseInt(process.env.BP_SYSTOLIC_LOW || '90'),
    },
    diastolic: {
      high: parseInt(process.env.BP_DIASTOLIC_HIGH || '90'),
      low: parseInt(process.env.BP_DIASTOLIC_LOW || '60'),
    },
  },
});

export type VitalStatus = 'NORMAL' | 'HIGH' | 'LOW';
export type VitalTrend = 'UP' | 'DOWN' | 'STABLE';

export const determineVitalStatus = (
  value: number,
  high?: number,
  low?: number
): VitalStatus => {
  if (high !== undefined && value > high) return 'HIGH';
  if (low !== undefined && value < low) return 'LOW';
  return 'NORMAL';
};

export const calculateBMI = (weight: number, height: number): number => {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
};

export const calculateAge = (birthdate: Date): number => {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};
