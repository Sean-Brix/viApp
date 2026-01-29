import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { StudentService } from '../services/student.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

const studentService = new StudentService();

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const profile = await studentService.getProfile(req.user.userId);
    sendSuccess(res, profile);
  } catch (error: any) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const profile = await studentService.updateProfile(req.user.userId, req.body);
    sendSuccess(res, profile, 'Profile updated successfully');
  } catch (error: any) {
    next(error);
  }
};

export const getLatestVitals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const vitals = await studentService.getLatestVitals(req.user.userId);
    sendSuccess(res, vitals);
  } catch (error: any) {
    next(error);
  }
};

export const getVitalsStatistics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const statistics = await studentService.getVitalsStatistics(req.user.userId);
    sendSuccess(res, statistics);
  } catch (error: any) {
    next(error);
  }
};

export const getVitalsHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { startDate, endDate } = req.query;
    const vitals = await studentService.getVitalsHistory(
      req.user.userId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    sendSuccess(res, vitals);
  } catch (error: any) {
    next(error);
  }
};

export const getAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { status } = req.query;
    const alerts = await studentService.getAlerts(req.user.userId, status as string);
    sendSuccess(res, alerts);
  } catch (error: any) {
    next(error);
  }
};

export const acknowledgeAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { alertId } = req.params;
    const alert = await studentService.acknowledgeAlert(req.user.userId, alertId as string);
    sendSuccess(res, alert, 'Alert acknowledged');
  } catch (error: any) {
    next(error);
  }
};

export const updateNotificationSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const settings = await studentService.updateNotificationSettings(req.user.userId, req.body);
    sendSuccess(res, settings, 'Notification settings updated');
  } catch (error: any) {
    next(error);
  }
};

// Medical History Controllers
export const getMedicalHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const history = await studentService.getMedicalHistory(req.user.userId);
    sendSuccess(res, history);
  } catch (error: any) {
    next(error);
  }
};

export const addMedicalHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const record = await studentService.addMedicalHistory(req.user.userId, req.body);
    sendSuccess(res, record, 'Medical history added successfully');
  } catch (error: any) {
    next(error);
  }
};

export const updateMedicalHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { historyId } = req.params;
    const record = await studentService.updateMedicalHistory(req.user.userId, historyId as string, req.body);
    sendSuccess(res, record, 'Medical history updated successfully');
  } catch (error: any) {
    next(error);
  }
};

export const deleteMedicalHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { historyId } = req.params;
    const result = await studentService.deleteMedicalHistory(req.user.userId, historyId as string);
    sendSuccess(res, result, result.message);
  } catch (error: any) {
    next(error);
  }
};

// Emergency Contact Controllers
export const getEmergencyContacts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const contacts = await studentService.getEmergencyContacts(req.user.userId);
    sendSuccess(res, contacts);
  } catch (error: any) {
    next(error);
  }
};

export const addEmergencyContact = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const contact = await studentService.addEmergencyContact(req.user.userId, req.body);
    sendSuccess(res, contact, 'Emergency contact added successfully');
  } catch (error: any) {
    next(error);
  }
};

export const updateEmergencyContact = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { contactId } = req.params;
    const contact = await studentService.updateEmergencyContact(req.user.userId, contactId as string, req.body);
    sendSuccess(res, contact, 'Emergency contact updated successfully');
  } catch (error: any) {
    next(error);
  }
};

export const deleteEmergencyContact = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const { contactId } = req.params;
    const result = await studentService.deleteEmergencyContact(req.user.userId, contactId as string);
    sendSuccess(res, result, result.message);
  } catch (error: any) {
    next(error);
  }
};
