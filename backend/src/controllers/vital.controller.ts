import { Response, NextFunction, Request } from 'express';
import { validationResult } from 'express-validator';
import { VitalService } from '../services/vital.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

const vitalService = new VitalService();

/**
 * ESP32 Device Upload - Public endpoint (NO AUTH)
 * ESP32 sends: { deviceId, heartRate, temperature, spO2, bloodPressureSystolic, bloodPressureDiastolic, batteryLevel }
 */
export const esp32UploadVital = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { deviceId, heartRate, temperature, spO2, bloodPressureSystolic, bloodPressureDiastolic, batteryLevel } = req.body;

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
      batteryLevel
    });

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
