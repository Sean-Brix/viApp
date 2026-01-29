import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/response';
import { calculateAge, calculateBMI } from '../utils/vitals';

const prisma = new PrismaClient();

export class StudentService {
  async getProfile(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        device: true,
        emergencyContacts: true,
        medicalHistory: {
          where: { isActive: true },
        },
        notificationSettings: true,
      },
    });

    if (!student) {
      throw new AppError('Student profile not found', 404);
    }

    const age = calculateAge(student.birthdate);
    const bmi = student.weight && student.height ? calculateBMI(student.weight, student.height) : null;

    return {
      ...student,
      age,
      bmi,
    };
  }

  async updateProfile(userId: string, data: any) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new AppError('Student profile not found', 404);
    }

    // Update User contactNumber if provided
    if (data.contactNumber !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { contactNumber: data.contactNumber },
      });
    }

    const updated = await prisma.student.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        birthdate: data.birthdate,
        gender: data.gender,
        gradeLevel: data.gradeLevel,
        section: data.section,
        weight: data.weight,
        height: data.height,
        photoUrl: data.photoUrl,
      },
    });

    const age = calculateAge(updated.birthdate);
    const bmi = updated.weight && updated.height ? calculateBMI(updated.weight, updated.height) : null;

    return {
      ...updated,
      age,
      bmi,
    };
  }

  async getLatestVitals(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const latestVital = await prisma.vital.findFirst({
      where: { studentId: student.id },
      orderBy: { timestamp: 'desc' },
    });

    return latestVital;
  }

  async getVitalsStatistics(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get vitals for different periods
    const [dayVitals, weekVitals, monthVitals] = await Promise.all([
      prisma.vital.findMany({
        where: { studentId: student.id, timestamp: { gte: oneDayAgo } },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.vital.findMany({
        where: { studentId: student.id, timestamp: { gte: oneWeekAgo } },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.vital.findMany({
        where: { studentId: student.id, timestamp: { gte: oneMonthAgo } },
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    const calculateStats = (vitals: any[]) => {
      if (vitals.length === 0) {
        return { count: 0, avg: null, min: null, max: null, status: null };
      }

      const heartRates = vitals.map(v => v.heartRate).filter(v => v != null);
      const temps = vitals.map(v => v.temperature).filter(v => v != null);
      const spo2s = vitals.map(v => v.bloodOxygen).filter(v => v != null);
      const bpSys = vitals.map(v => v.bloodPressureSystolic).filter(v => v != null);
      const bpDia = vitals.map(v => v.bloodPressureDiastolic).filter(v => v != null);

      const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
      const min = (arr: number[]) => arr.length ? Math.min(...arr) : null;
      const max = (arr: number[]) => arr.length ? Math.max(...arr) : null;

      return {
        count: vitals.length,
        heartRate: {
          avg: avg(heartRates),
          min: min(heartRates),
          max: max(heartRates),
        },
        temperature: {
          avg: avg(temps),
          min: min(temps),
          max: max(temps),
        },
        spo2: {
          avg: avg(spo2s),
          min: min(spo2s),
          max: max(spo2s),
        },
        bloodPressure: {
          systolic: { avg: avg(bpSys), min: min(bpSys), max: max(bpSys) },
          diastolic: { avg: avg(bpDia), min: min(bpDia), max: max(bpDia) },
        },
      };
    };

    return {
      day: calculateStats(dayVitals),
      week: calculateStats(weekVitals),
      month: calculateStats(monthVitals),
    };
  }

  async getVitalsHistory(userId: string, startDate?: Date, endDate?: Date) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const vitals = await prisma.vital.findMany({
      where: {
        studentId: student.id,
        ...(startDate && endDate && {
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      orderBy: { timestamp: 'desc' },
      take: 500, // Limit to last 500 readings
    });

    // Return paginated structure for frontend compatibility
    return {
      vitals,
      total: vitals.length,
      page: 1,
      totalPages: 1,
    };
  }

  async getAlerts(userId: string, status?: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const alerts = await prisma.alert.findMany({
      where: {
        studentId: student.id,
        ...(status && { status: status as any }),
      },
      orderBy: { timestamp: 'desc' },
    });

    // Return paginated structure for frontend compatibility
    return {
      alerts,
      total: alerts.length,
      page: 1,
      totalPages: 1,
    };
  }

  async acknowledgeAlert(userId: string, alertId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const alert = await prisma.alert.findFirst({
      where: {
        id: alertId,
        studentId: student.id,
      },
    });

    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    const updated = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
      },
    });

    return updated;
  }

  async updateNotificationSettings(userId: string, settings: any) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Map incoming fields to database schema fields
    const updateData: any = {};
    if (settings.pushNotifications !== undefined) {
      updateData.enablePushNotifications = settings.pushNotifications;
    }
    if (settings.emailNotifications !== undefined) {
      updateData.enableEmailNotifications = settings.emailNotifications;
    }
    if (settings.alertsEnabled !== undefined) {
      updateData.alertsEnabled = settings.alertsEnabled;
    }
    if (settings.criticalAlertsOnly !== undefined) {
      updateData.criticalAlertsOnly = settings.criticalAlertsOnly;
    }

    const updated = await prisma.notificationSettings.upsert({
      where: { studentId: student.id },
      update: updateData,
      create: {
        studentId: student.id,
        ...updateData,
      },
    });

    return updated;
  }
}
