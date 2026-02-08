import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/response';
import { getThresholds, determineVitalStatus, VitalStatus } from '../utils/vitals';

const prisma = new PrismaClient();

interface VitalData {
  studentId?: string;
  deviceId?: string;
  heartRate?: number;
  spO2?: number;
  temperature?: number;
  respiratoryRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  timestamp?: Date;
  isManualEntry?: boolean;
  notes?: string;
}

interface AlertData {
  studentId: string;
  vitalType: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  value: number;
  threshold: number;
}

export class VitalService {
  /**
   * ESP32 Direct Upload - Device sends data with its deviceId
   * No authentication needed - device identifies itself by deviceId
   */
  async esp32UploadVital(data: {
    deviceId: string;
    heartRate?: number;
    temperature?: number;
    spO2?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    batteryLevel?: number;
    respiratoryRate?: number;
  }) {
    // Find device and associated student
    const device = await prisma.device.findUnique({
      where: { deviceId: data.deviceId },
      include: { student: true },
    });

    if (!device) {
      throw new AppError(`Device with ID ${data.deviceId} not registered`, 404);
    }

    if (!device.studentId || !device.student) {
      throw new AppError(`Device ${data.deviceId} is not assigned to any student`, 400);
    }

    // Update device status and battery
    await prisma.device.update({
      where: { deviceId: data.deviceId },
      data: {
        status: 'ACTIVE',
        lastSyncedAt: new Date(),
        ...(data.batteryLevel !== undefined && { batteryLevel: data.batteryLevel }),
      },
    });

    // Upload vitals using existing logic
    const result = await this.uploadVital(device.student.userId, {
      deviceId: data.deviceId,
      heartRate: data.heartRate,
      temperature: data.temperature,
      spO2: data.spO2,
      bloodPressureSystolic: data.bloodPressureSystolic,
      bloodPressureDiastolic: data.bloodPressureDiastolic,
      respiratoryRate: data.respiratoryRate,
      isManualEntry: false,
    });

    return {
      ...result,
      message: `Data received from device ${data.deviceId} for student ${device.student.firstName} ${device.student.lastName}`,
    };
  }

  async uploadVital(userId: string, data: VitalData) {
    // Get student from userId
    const student = await prisma.student.findUnique({
      where: { userId },
      include: { device: true },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const thresholds = getThresholds();
    const vitalData: any = {
      studentId: student.id,
      deviceId: data.deviceId || student.device?.deviceId,
      timestamp: data.timestamp || new Date(),
      isManualEntry: data.isManualEntry || false,
      notes: data.notes,
    };

    const alerts: AlertData[] = [];

    // Process Heart Rate
    if (data.heartRate !== undefined) {
      const status = determineVitalStatus(
        data.heartRate,
        thresholds.heartRate.high,
        thresholds.heartRate.low
      );
      vitalData.heartRate = data.heartRate;
      vitalData.heartRateStatus = status;
      vitalData.heartRateTrend = 'STABLE'; // TODO: Calculate trend from previous readings

      if (status !== 'NORMAL') {
        alerts.push({
          studentId: student.id,
          vitalType: 'Heart Rate',
          message: `${status === 'HIGH' ? 'Elevated' : 'Low'} heart rate detected (${data.heartRate} bpm). ${status === 'HIGH' ? 'Monitor for tachycardia.' : 'Monitor for bradycardia.'}`,
          severity: status === 'HIGH' && data.heartRate > 120 ? 'HIGH' : 'MEDIUM',
          value: data.heartRate,
          threshold: status === 'HIGH' ? thresholds.heartRate.high : thresholds.heartRate.low,
        });
      }
    }

    // Process SpO2
    if (data.spO2 !== undefined) {
      const status = determineVitalStatus(data.spO2, undefined, thresholds.spO2.low);
      vitalData.spO2 = data.spO2;
      vitalData.spO2Status = status;
      vitalData.spO2Trend = 'STABLE';

      if (status === 'LOW') {
        alerts.push({
          studentId: student.id,
          vitalType: 'SpO₂',
          message: `Low blood oxygen saturation detected (${data.spO2}%). Immediate attention required.`,
          severity: data.spO2 < 90 ? 'HIGH' : 'MEDIUM',
          value: data.spO2,
          threshold: thresholds.spO2.low,
        });
      }
    }

    // Process Temperature
    if (data.temperature !== undefined) {
      const status = determineVitalStatus(
        data.temperature,
        thresholds.temperature.high,
        thresholds.temperature.low
      );
      vitalData.temperature = data.temperature;
      vitalData.temperatureStatus = status;
      vitalData.temperatureTrend = 'STABLE';

      if (status !== 'NORMAL') {
        alerts.push({
          studentId: student.id,
          vitalType: 'Temperature',
          message: `${status === 'HIGH' ? 'High' : 'Low'} temperature detected (${data.temperature}°C). ${status === 'HIGH' ? 'Possible fever.' : 'Possible hypothermia.'}`,
          severity: (status === 'HIGH' && data.temperature > 39) || (status === 'LOW' && data.temperature < 35) ? 'HIGH' : 'MEDIUM',
          value: data.temperature,
          threshold: status === 'HIGH' ? thresholds.temperature.high : thresholds.temperature.low,
        });
      }
    }

    // Process Respiratory Rate
    if (data.respiratoryRate !== undefined) {
      const status = determineVitalStatus(
        data.respiratoryRate,
        thresholds.respiratoryRate.high,
        thresholds.respiratoryRate.low
      );
      vitalData.respiratoryRate = data.respiratoryRate;
      vitalData.respiratoryRateStatus = status;
      vitalData.respiratoryRateTrend = 'STABLE';

      if (status !== 'NORMAL') {
        alerts.push({
          studentId: student.id,
          vitalType: 'Respiratory Rate',
          message: `${status === 'HIGH' ? 'Elevated' : 'Low'} respiratory rate detected (${data.respiratoryRate}/min). Monitor breathing.`,
          severity: 'MEDIUM',
          value: data.respiratoryRate,
          threshold: status === 'HIGH' ? thresholds.respiratoryRate.high : thresholds.respiratoryRate.low,
        });
      }
    }

    // Process Blood Pressure
    if (data.bloodPressureSystolic !== undefined && data.bloodPressureDiastolic !== undefined) {
      const systolicStatus = determineVitalStatus(
        data.bloodPressureSystolic,
        thresholds.bloodPressure.systolic.high,
        thresholds.bloodPressure.systolic.low
      );
      const diastolicStatus = determineVitalStatus(
        data.bloodPressureDiastolic,
        thresholds.bloodPressure.diastolic.high,
        thresholds.bloodPressure.diastolic.low
      );
      
      const bpStatus: VitalStatus =
        systolicStatus === 'HIGH' || diastolicStatus === 'HIGH'
          ? 'HIGH'
          : systolicStatus === 'LOW' || diastolicStatus === 'LOW'
          ? 'LOW'
          : 'NORMAL';

      vitalData.bloodPressureSystolic = data.bloodPressureSystolic;
      vitalData.bloodPressureDiastolic = data.bloodPressureDiastolic;
      vitalData.bloodPressureStatus = bpStatus;
      vitalData.bloodPressureTrend = 'STABLE';

      if (bpStatus !== 'NORMAL') {
        alerts.push({
          studentId: student.id,
          vitalType: 'Blood Pressure',
          message: `${bpStatus === 'HIGH' ? 'High' : 'Low'} blood pressure detected (${data.bloodPressureSystolic}/${data.bloodPressureDiastolic} mmHg). Monitor closely.`,
          severity: bpStatus === 'HIGH' && data.bloodPressureSystolic > 160 ? 'HIGH' : 'MEDIUM',
          value: data.bloodPressureSystolic,
          threshold: bpStatus === 'HIGH' ? thresholds.bloodPressure.systolic.high : thresholds.bloodPressure.systolic.low,
        });
      }
    }

    // Save vital reading
    const vital = await prisma.vital.create({
      data: vitalData,
    });

    // Create alerts for abnormal vitals
    if (alerts.length > 0) {
      await prisma.alert.createMany({
        data: alerts,
      });
    }

    // Auto-resolve specific alerts if their corresponding vitals are now stable
    // Only resolve alerts for vitals that were measured and are now normal
    const vitalTypesToResolve: string[] = [];
    
    if (data.heartRate !== undefined && vitalData.heartRateStatus === 'NORMAL') {
      vitalTypesToResolve.push('Heart Rate');
    }
    if (data.temperature !== undefined && vitalData.temperatureStatus === 'NORMAL') {
      vitalTypesToResolve.push('Temperature');
    }
    if (data.spO2 !== undefined && vitalData.spO2Status === 'NORMAL') {
      vitalTypesToResolve.push('SpO₂');
    }
    if (data.bloodPressureSystolic !== undefined && data.bloodPressureDiastolic !== undefined && vitalData.bloodPressureStatus === 'NORMAL') {
      vitalTypesToResolve.push('Blood Pressure');
    }
    if (data.respiratoryRate !== undefined && vitalData.respiratoryRateStatus === 'NORMAL') {
      vitalTypesToResolve.push('Respiratory Rate');
    }

    // Resolve alerts for vitals that are now normal
    if (vitalTypesToResolve.length > 0) {
      await prisma.alert.updateMany({
        where: {
          studentId: student.id,
          vitalType: { in: vitalTypesToResolve },
          status: { in: ['NEW', 'ACKNOWLEDGED'] },
        },
        data: {
          status: 'RESOLVED',
          resolvedAt: new Date(),
        },
      });
    }

    // Update student status based on ALL active alerts (not just new ones)
    const allActiveAlerts = await prisma.alert.findMany({
      where: {
        studentId: student.id,
        status: { in: ['NEW', 'ACKNOWLEDGED'] },
      },
    });

    if (allActiveAlerts.length > 0) {
      const hasCritical = allActiveAlerts.some((a) => a.severity === 'HIGH');
      const hasWarning = allActiveAlerts.some((a) => a.severity === 'MEDIUM');
      
      await prisma.student.update({
        where: { id: student.id },
        data: {
          status: hasCritical ? 'CRITICAL' : hasWarning ? 'NEEDS_ATTENTION' : 'STABLE',
        },
      });
    } else {
      await prisma.student.update({
        where: { id: student.id },
        data: { status: 'STABLE' },
      });
    }

    // Update device sync time
    if (vitalData.deviceId) {
      await prisma.device.update({
        where: { deviceId: vitalData.deviceId },
        data: { lastSyncedAt: new Date() },
      });
    }

    return {
      vital,
      alertsCreated: alerts.length,
    };
  }

  async bulkUploadVitals(userId: string, vitalsArray: VitalData[]) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const vitalData of vitalsArray) {
      try {
        await this.uploadVital(userId, vitalData);
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(error.message);
      }
    }

    // Log sync
    const student = await prisma.student.findUnique({
      where: { userId },
      include: { device: true },
    });

    if (student?.device) {
      await prisma.syncLog.create({
        data: {
          deviceId: student.device.deviceId,
          recordCount: vitalsArray.length,
          status: results.failed === 0 ? 'SUCCESS' : results.failed === vitalsArray.length ? 'FAILED' : 'PARTIAL',
          error: results.errors.length > 0 ? results.errors.join('; ') : null,
        },
      });
    }

    return results;
  }
}
