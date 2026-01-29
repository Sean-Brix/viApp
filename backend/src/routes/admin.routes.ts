import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';
import {
  createStudentValidator,
  registerDeviceValidator,
  assignDeviceValidator,
  paginationValidator,
} from '../middleware/validators';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate, authorize('ADMIN'));

// Student Management
/**
 * @route   GET /api/admin/students
 * @desc    Get all students
 * @access  Private (Admin)
 */
router.get('/students', paginationValidator, adminController.getAllStudents);

/**
 * @route   GET /api/admin/student/:id
 * @desc    Get student by ID
 * @access  Private (Admin)
 */
router.get('/student/:id', adminController.getStudentById);

/**
 * @route   POST /api/admin/student/create
 * @desc    Create new student account
 * @access  Private (Admin)
 */
router.post('/student/create', createStudentValidator, adminController.createStudent);

/**
 * @route   PUT /api/admin/student/:id
 * @desc    Update student details
 * @access  Private (Admin)
 */
router.put('/student/:id', adminController.updateStudent);

/**
 * @route   DELETE /api/admin/student/:id
 * @desc    Deactivate student account
 * @access  Private (Admin)
 */
router.delete('/student/:id', adminController.deactivateStudent);

// Alert Management
/**
 * @route   GET /api/admin/alerts
 * @desc    Get all alerts
 * @access  Private (Admin)
 */
router.get('/alerts', paginationValidator, adminController.getAllAlerts);

/**
 * @route   PUT /api/admin/alerts/:alertId/acknowledge
 * @desc    Acknowledge an alert
 * @access  Private (Admin)
 */
router.put('/alerts/:alertId/acknowledge', adminController.acknowledgeAlert);

/**
 * @route   PUT /api/admin/alerts/:alertId/resolve
 * @desc    Resolve an alert
 * @access  Private (Admin)
 */
router.put('/alerts/:alertId/resolve', adminController.resolveAlert);

// Device Management
/**
 * @route   POST /api/admin/device/register
 * @desc    Register new ViBand device
 * @access  Private (Admin)
 */
router.post('/device/register', registerDeviceValidator, adminController.registerDevice);

/**
 * @route   PUT /api/admin/device/:deviceId/assign
 * @desc    Assign device to student
 * @access  Private (Admin)
 */
router.put('/device/:deviceId/assign', assignDeviceValidator, adminController.assignDevice);

/**
 * @route   PUT /api/admin/device/:deviceId/unassign
 * @desc    Unassign device from student
 * @access  Private (Admin)
 */
router.put('/device/:deviceId/unassign', adminController.unassignDevice);

/**
 * @route   GET /api/admin/devices
 * @desc    Get all devices
 * @access  Private (Admin)
 */
router.get('/devices', adminController.getAllDevices);

export default router;
