import { Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AdminService } from '../services/admin.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

const adminService = new AdminService();

export const getAllStudents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, status } = req.query;
    const result = await adminService.getAllStudents(
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 50,
      status as string
    );
    sendSuccess(res, result);
  } catch (error: any) {
    next(error);
  }
};

export const getStudentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const student = await adminService.getStudentById(id as string);
    sendSuccess(res, student);
  } catch (error: any) {
    next(error);
  }
};

export const createStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    const student = await adminService.createStudent(req.body);
    sendSuccess(res, student, 'Student created successfully', 201);
  } catch (error: any) {
    next(error);
  }
};

export const updateStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const student = await adminService.updateStudent(id as string, req.body);
    sendSuccess(res, student, 'Student updated successfully');
  } catch (error: any) {
    next(error);
  }
};

export const deactivateStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await adminService.deactivateStudent(id as string);
    sendSuccess(res, result);
  } catch (error: any) {
    next(error);
  }
};

export const getAllAlerts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, severity, status } = req.query;
    const result = await adminService.getAllAlerts(
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 50,
      severity as string,
      status as string
    );
    sendSuccess(res, result);
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
    const alert = await adminService.acknowledgeAlert(alertId as string, req.user.userId);
    sendSuccess(res, alert, 'Alert acknowledged');
  } catch (error: any) {
    next(error);
  }
};

export const resolveAlert = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { alertId } = req.params;
    const { notes } = req.body;
    const alert = await adminService.resolveAlert(alertId as string, notes);
    sendSuccess(res, alert, 'Alert resolved');
  } catch (error: any) {
    next(error);
  }
};

export const registerDevice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    const device = await adminService.registerDevice(req.body);
    sendSuccess(res, device, 'Device registered successfully', 201);
  } catch (error: any) {
    next(error);
  }
};

export const assignDevice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    const { deviceId } = req.params;
    const { studentId } = req.body;
    const device = await adminService.assignDevice(deviceId as string, studentId);
    sendSuccess(res, device, 'Device assigned successfully');
  } catch (error: any) {
    next(error);
  }
};

export const unassignDevice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { deviceId } = req.params;
    const device = await adminService.unassignDevice(deviceId as string);
    sendSuccess(res, device, 'Device unassigned successfully');
  } catch (error: any) {
    next(error);
  }
};

export const getAllDevices = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const devices = await adminService.getAllDevices();
    sendSuccess(res, devices);
  } catch (error: any) {
    next(error);
  }
};

// Medical History Controllers
export const getMedicalHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const history = await adminService.getMedicalHistory(id as string);
    sendSuccess(res, history);
  } catch (error: any) {
    next(error);
  }
};

export const addMedicalHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const record = await adminService.addMedicalHistory(id as string, req.body);
    sendSuccess(res, record, 'Medical history added successfully', 201);
  } catch (error: any) {
    next(error);
  }
};

export const updateMedicalHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { historyId } = req.params;
    const record = await adminService.updateMedicalHistory(historyId as string, req.body);
    sendSuccess(res, record, 'Medical history updated successfully');
  } catch (error: any) {
    next(error);
  }
};

export const deleteMedicalHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { historyId } = req.params;
    await adminService.deleteMedicalHistory(historyId as string);
    sendSuccess(res, null, 'Medical history deleted successfully');
  } catch (error: any) {
    next(error);
  }
};
