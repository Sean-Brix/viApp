import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/response';
import { hashPassword } from '../utils/password';
import { calculateAge, calculateBMI } from '../utils/vitals';

const prisma = new PrismaClient();

export interface CreateStudentData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthdate: string; // Accept as string, will convert to Date
  gender: 'MALE' | 'FEMALE';
  gradeLevel: string;
  section?: string;
  weight?: number;
  height?: number;
  contactNumber?: string;
  guardianName?: string;
  guardianContact?: string;
}

export class AdminService {
  async getAllStudents(page: number = 1, limit: number = 50, status?: string) {
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: {
          ...(status ? { status: status as any } : {}),
          user: {
            isActive: true, // Only show active students
          },
        },
        include: {
          user: {
            select: {
              username: true,
              email: true,
              isActive: true,
            },
          },
          device: true,
          vitals: {
            orderBy: { timestamp: 'desc' },
            take: 1, // Get only the latest vital
          },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.student.count({
        where: {
          ...(status ? { status: status as any } : {}),
          user: {
            isActive: true, // Only count active students
          },
        },
      }),
    ]);

    const studentsWithCalculations = students.map((student) => {
      const age = calculateAge(student.birthdate);
      const bmi = student.weight && student.height ? calculateBMI(student.weight, student.height) : null;
      // Map vitals array to latestVital for easier frontend consumption
      const latestVital = student.vitals && student.vitals.length > 0 ? student.vitals[0] : undefined;
      return { ...student, age, bmi, latestVital };
    });

    return {
      students: studentsWithCalculations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStudentById(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            isActive: true,
            contactNumber: true,
          },
        },
        device: true,
        emergencyContacts: true,
        medicalHistory: {
          where: { isActive: true },
        },
        vitals: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
        alerts: {
          where: { status: { not: 'RESOLVED' } },
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const age = calculateAge(student.birthdate);
    const bmi = student.weight && student.height ? calculateBMI(student.weight, student.height) : null;

    return { ...student, age, bmi };
  }

  async createStudent(data: CreateStudentData) {
    // Check if username or email exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: data.username }, { email: data.email }],
      },
    });

    if (existing) {
      throw new AppError('Username or email already exists', 400);
    }

    const passwordHash = await hashPassword(data.password);

    // Convert birthdate string to Date object and validate
    const birthdateObj = new Date(data.birthdate);
    if (isNaN(birthdateObj.getTime())) {
      throw new AppError('Invalid birthdate format. Expected YYYY-MM-DD', 400);
    }

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        role: 'STUDENT',
        contactNumber: data.contactNumber,
        student: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            birthdate: birthdateObj,
            gender: data.gender,
            gradeLevel: data.gradeLevel,
            section: data.section,
            weight: data.weight,
            height: data.height,
          },
        },
      },
      include: {
        student: true,
      },
    });

    // Create emergency contact if guardian info provided
    if (data.guardianName && data.guardianContact && user.student) {
      await prisma.emergencyContact.create({
        data: {
          studentId: user.student.id,
          name: data.guardianName,
          relationship: 'Guardian',
          phoneNumber: data.guardianContact,
          isPrimary: true,
        },
      });
    }

    return user.student;
  }

  async updateStudent(studentId: string, data: any) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Separate user fields from student fields
    const userFields: any = {};
    const studentFields: any = {};

    // User fields
    if (data.email !== undefined) userFields.email = data.email;
    if (data.username !== undefined) userFields.username = data.username;
    if (data.isActive !== undefined) userFields.isActive = data.isActive;
    if (data.contactNumber !== undefined) userFields.contactNumber = data.contactNumber;

    // Student fields
    if (data.firstName !== undefined) studentFields.firstName = data.firstName;
    if (data.lastName !== undefined) studentFields.lastName = data.lastName;
    if (data.birthdate !== undefined) studentFields.birthdate = new Date(data.birthdate);
    if (data.gender !== undefined) studentFields.gender = data.gender;
    if (data.gradeLevel !== undefined) studentFields.gradeLevel = data.gradeLevel;
    if (data.section !== undefined) studentFields.section = data.section;
    if (data.photoUrl !== undefined) studentFields.photoUrl = data.photoUrl;
    if (data.height !== undefined) studentFields.height = data.height;
    if (data.weight !== undefined) studentFields.weight = data.weight;

    // Update user if there are user fields
    if (Object.keys(userFields).length > 0) {
      await prisma.user.update({
        where: { id: student.userId },
        data: userFields,
      });
    }

    // Update student if there are student fields
    if (Object.keys(studentFields).length > 0) {
      await prisma.student.update({
        where: { id: studentId },
        data: studentFields,
      });
    }

    // Return updated student with user data
    const updated = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    return updated;
  }

  async deactivateStudent(studentId: string) {
    console.log('Deactivating student:', studentId);
    
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) {
      console.error('Student not found:', studentId);
      throw new AppError('Student not found', 404);
    }

    console.log('Deactivating user:', student.userId);
    await prisma.user.update({
      where: { id: student.userId },
      data: { isActive: false },
    });

    console.log('Student deactivated successfully');
    return { message: 'Student account deactivated successfully' };
  }

  async getAllAlerts(page: number = 1, limit: number = 50, severity?: string, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (severity) where.severity = severity;
    if (status) where.status = status;

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gradeLevel: true,
              emergencyContacts: {
                where: { isPrimary: true },
                select: {
                  phoneNumber: true,
                  name: true,
                },
              },
              user: {
                select: {
                  contactNumber: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.alert.count({ where }),
    ]);

    return {
      alerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async acknowledgeAlert(alertId: string, adminUserId: string) {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    const updated = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
        acknowledgedBy: adminUserId,
      },
    });

    return updated;
  }

  async resolveAlert(alertId: string, notes?: string) {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    const updated = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        notes,
      },
    });

    return updated;
  }

  async registerDevice(deviceData: { 
    deviceId: string; 
    deviceName?: string; 
    deviceType?: string;
    macAddress?: string;
  }) {
    const existing = await prisma.device.findFirst({
      where: {
        OR: [
          { deviceId: deviceData.deviceId },
          ...(deviceData.macAddress ? [{ macAddress: deviceData.macAddress }] : [])
        ],
      },
    });

    if (existing) {
      throw new AppError('Device ID or MAC address already registered', 400);
    }

    const device = await prisma.device.create({
      data: {
        deviceId: deviceData.deviceId,
        deviceName: deviceData.deviceName || `Device ${deviceData.deviceId}`,
        deviceType: deviceData.deviceType || 'ESP32',
        macAddress: deviceData.macAddress,
        status: 'INACTIVE',
      },
    });

    return device;
  }

  async assignDevice(deviceId: string, studentId: string) {
    const device = await prisma.device.findUnique({
      where: { deviceId },
    });

    if (!device) {
      throw new AppError('Device not found', 404);
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { device: true },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    if (student.device) {
      throw new AppError('Student already has a device assigned', 400);
    }

    const updated = await prisma.device.update({
      where: { deviceId },
      data: {
        studentId,
        status: 'ACTIVE',
      },
    });

    return updated;
  }

  async unassignDevice(deviceId: string) {
    const device = await prisma.device.findUnique({
      where: { deviceId },
    });

    if (!device) {
      throw new AppError('Device not found', 404);
    }

    const updated = await prisma.device.update({
      where: { deviceId },
      data: {
        studentId: null,
        status: 'INACTIVE',
      },
    });

    return updated;
  }

  async getAllDevices() {
    const devices = await prisma.device.findMany({
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            gradeLevel: true,
          },
        },
      },
      orderBy: { registeredAt: 'desc' },
    });

    return {
      devices,
      total: devices.length,
      page: 1,
      totalPages: 1,
    };
  }

  // Medical History Management
  async getMedicalHistory(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const history = await prisma.medicalHistory.findMany({
      where: { 
        studentId,
        isActive: true 
      },
      orderBy: { diagnosedAt: 'desc' },
    });

    return history;
  }

  async addMedicalHistory(studentId: string, data: {
    type: string;
    description: string;
    diagnosedAt?: string;
    notes?: string;
  }) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const record = await prisma.medicalHistory.create({
      data: {
        studentId,
        type: data.type,
        description: data.description,
        diagnosedAt: data.diagnosedAt ? new Date(data.diagnosedAt) : null,
        notes: data.notes,
      },
    });

    return record;
  }

  async updateMedicalHistory(historyId: string, data: {
    type?: string;
    description?: string;
    diagnosedAt?: string;
    notes?: string;
    isActive?: boolean;
  }) {
    const history = await prisma.medicalHistory.findUnique({
      where: { id: historyId },
    });

    if (!history) {
      throw new AppError('Medical history record not found', 404);
    }

    const updated = await prisma.medicalHistory.update({
      where: { id: historyId },
      data: {
        ...(data.type && { type: data.type }),
        ...(data.description && { description: data.description }),
        ...(data.diagnosedAt && { diagnosedAt: new Date(data.diagnosedAt) }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return updated;
  }

  async deleteMedicalHistory(historyId: string) {
    const history = await prisma.medicalHistory.findUnique({
      where: { id: historyId },
    });

    if (!history) {
      throw new AppError('Medical history record not found', 404);
    }

    // Soft delete by setting isActive to false
    await prisma.medicalHistory.update({
      where: { id: historyId },
      data: { isActive: false },
    });

    return { message: 'Medical history deleted successfully' };
  }
}
