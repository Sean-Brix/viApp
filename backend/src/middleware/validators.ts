import { body, param, query, ValidationChain } from 'express-validator';

// Authentication validators
export const registerValidator: ValidationChain[] = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['ADMIN', 'STUDENT']).withMessage('Role must be ADMIN or STUDENT'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
];

export const loginValidator: ValidationChain[] = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Student validators
export const updateStudentProfileValidator: ValidationChain[] = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('birthdate').optional().isISO8601().withMessage('Invalid birthdate format'),
  body('gender').optional().isIn(['MALE', 'FEMALE']).withMessage('Gender must be MALE or FEMALE'),
  body('gradeLevel').optional().trim().notEmpty().withMessage('Grade level cannot be empty'),
  body('weight').optional().isFloat({ min: 20, max: 200 }).withMessage('Weight must be between 20-200 kg'),
  body('height').optional().isFloat({ min: 100, max: 250 }).withMessage('Height must be between 100-250 cm'),
];

// Vitals validators
export const uploadVitalValidator: ValidationChain[] = [
  body('deviceId').optional().trim().notEmpty().withMessage('Device ID cannot be empty'),
  body('heartRate').optional().isInt({ min: 30, max: 250 }).withMessage('Invalid heart rate'),
  body('spO2').optional().isInt({ min: 50, max: 100 }).withMessage('Invalid SpO2 value'),
  body('temperature').optional().isFloat({ min: 30, max: 45 }).withMessage('Invalid temperature'),
  body('respiratoryRate').optional().isInt({ min: 5, max: 60 }).withMessage('Invalid respiratory rate'),
  body('bloodPressureSystolic').optional().isInt({ min: 50, max: 250 }).withMessage('Invalid systolic BP'),
  body('bloodPressureDiastolic').optional().isInt({ min: 30, max: 150 }).withMessage('Invalid diastolic BP'),
];

// Device validators
export const registerDeviceValidator: ValidationChain[] = [
  body('deviceId').trim().notEmpty().withMessage('Device ID is required'),
  body('deviceName').optional().trim(),
  body('deviceType').optional().trim(),
  body('macAddress').optional().trim(),
];

export const assignDeviceValidator: ValidationChain[] = [
  body('studentId').isUUID().withMessage('Student ID must be a valid UUID'),
];

// Admin validators
export const createStudentValidator: ValidationChain[] = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('birthdate').isISO8601().withMessage('Invalid birthdate format'),
  body('gender').isIn(['MALE', 'FEMALE']).withMessage('Gender must be MALE or FEMALE'),
  body('gradeLevel').trim().notEmpty().withMessage('Grade level is required'),
];

// Query validators
export const paginationValidator: ValidationChain[] = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
];

export const dateRangeValidator: ValidationChain[] = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
];
