import { Response, NextFunction, Request } from 'express';
import { validationResult } from 'express-validator';
import { Server } from 'socket.io';
import { VitalService } from '../services/vital.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { emitVitalSignsUpdate, emitAlert } from '../websocket/socket';

const vitalService = new VitalService();

/**
 * ESP32 Device Upload - Public endpoint (NO AUTH)
 * ESP32 sends: { deviceId, heartRate, temperature, spO2, bloodPressureSystolic, bloodPressureDiastolic, batteryLevel }
 */
export const esp32UploadVital = async (req: Request, res: Response, next: NextFunction) => {
  console.log('🚨 ===== ESP32 UPLOAD ENDPOINT HIT =====');
  console.log('🚨 Request body:', req.body);
  console.log('🚨 ====================================');
  
  try {
    const { deviceId, heartRate, temperature, spO2, bloodPressureSystolic, bloodPressureDiastolic, batteryLevel, respiratoryRate } = req.body;

    if (!deviceId) {
      return sendError(res, 'Device ID is required', 400);
    }

    // At least one vital sign must be provided
    if (!heartRate && !temperature && !spO2 && !bloodPressureSystolic) {
      return sendError(res, 'At least one vital sign is required', 400);
    }

    const result = await vitalService.esp32UploadVital({
      deviceId,
      heartRate,
      temperature,
      spO2,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      batteryLevel,
      respiratoryRate
    });

    // Emit real-time update via WebSocket
    const io = req.app.get('io') as Server;
    if (io && result.vital) {
      // Get student info from result
      const studentId = result.vital.studentId;
      
      console.log('📡 Emitting vital signs update for student:', studentId);
      console.log('📡 Vital data:', {
        id: result.vital.id,
        heartRate: result.vital.heartRate,
        temperature: result.vital.temperature,
        spO2: result.vital.spO2,
      });
      
      emitVitalSignsUpdate(io, studentId, {
        id: result.vital.id,
        heartRate: result.vital.heartRate,
        temperature: result.vital.temperature,
        spO2: result.vital.spO2,
        bloodPressureSystolic: result.vital.bloodPressureSystolic,
        bloodPressureDiastolic: result.vital.bloodPressureDiastolic,
        respiratoryRate: result.vital.respiratoryRate,
        recordedAt: result.vital.timestamp,
      });
    } else {
      console.log('⚠️ WebSocket not available or no vital data');
    }

    sendSuccess(res, result, 'Vital data uploaded successfully', 201);
  } catch (error: any) {
    next(error);
  }
};

export const uploadVital = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const result = await vitalService.uploadVital(req.user.userId, req.body);

    // Emit real-time update via WebSocket
    const io = req.app.get('io') as Server;
    if (io && result.vital) {
      emitVitalSignsUpdate(io, result.vital.studentId, {
        id: result.vital.id,
        heartRate: result.vital.heartRate,
        temperature: result.vital.temperature,
        spO2: result.vital.spO2,
        bloodPressureSystolic: result.vital.bloodPressureSystolic,
        bloodPressureDiastolic: result.vital.bloodPressureDiastolic,
        respiratoryRate: result.vital.respiratoryRate,
        recordedAt: result.vital.timestamp,
      });
    }

    sendSuccess(res, result, 'Vital data uploaded successfully', 201);
  } catch (error: any) {
    next(error);
  }
};

export const bulkUploadVitals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { vitals } = req.body;

    if (!Array.isArray(vitals) || vitals.length === 0) {
      return sendError(res, 'Vitals array is required and cannot be empty', 400);
    }

    const result = await vitalService.bulkUploadVitals(req.user.userId, vitals);
    sendSuccess(res, result, 'Bulk upload completed');
  } catch (error: any) {
    next(error);
  }
};
