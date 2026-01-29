import { Router } from 'express';
import * as studentController from '../controllers/student.controller';
import { authenticate, authorize } from '../middleware/auth';
import { updateStudentProfileValidator, dateRangeValidator } from '../middleware/validators';

const router = Router();

// All routes require authentication and student role
router.use(authenticate, authorize('STUDENT'));

/**
 * @route   GET /api/student/profile
 * @desc    Get student profile
 * @access  Private (Student)
 */
router.get('/profile', studentController.getProfile);

/**
 * @route   PUT /api/student/profile
 * @desc    Update student profile
 * @access  Private (Student)
 */
router.put('/profile', updateStudentProfileValidator, studentController.updateProfile);

/**
 * @route   GET /api/student/vitals/latest
 * @desc    Get latest vital signs
 * @access  Private (Student)
 */
router.get('/vitals/latest', studentController.getLatestVitals);

/**
 * @route   GET /api/student/vitals/statistics
 * @desc    Get vitals statistics (day/week/month)
 * @access  Private (Student)
 */
router.get('/vitals/statistics', studentController.getVitalsStatistics);

/**
 * @route   GET /api/student/vitals/history
 * @desc    Get vitals history
 * @access  Private (Student)
 */
router.get('/vitals/history', dateRangeValidator, studentController.getVitalsHistory);

/**
 * @route   GET /api/student/alerts
 * @desc    Get student alerts
 * @access  Private (Student)
 */
router.get('/alerts', studentController.getAlerts);

/**
 * @route   PUT /api/student/alerts/:alertId/acknowledge
 * @desc    Acknowledge an alert
 * @access  Private (Student)
 */
router.put('/alerts/:alertId/acknowledge', studentController.acknowledgeAlert);

/**
 * @route   PUT /api/student/notifications
 * @desc    Update notification settings
 * @access  Private (Student)
 */
router.put('/notifications', studentController.updateNotificationSettings);

/**
 * @route   GET /api/student/medical-history
 * @desc    Get student medical history
 * @access  Private (Student)
 */
router.get('/medical-history', studentController.getMedicalHistory);

/**
 * @route   POST /api/student/medical-history
 * @desc    Add medical history record
 * @access  Private (Student)
 */
router.post('/medical-history', studentController.addMedicalHistory);

/**
 * @route   PUT /api/student/medical-history/:historyId
 * @desc    Update medical history record
 * @access  Private (Student)
 */
router.put('/medical-history/:historyId', studentController.updateMedicalHistory);

/**
 * @route   DELETE /api/student/medical-history/:historyId
 * @desc    Delete medical history record
 * @access  Private (Student)
 */
router.delete('/medical-history/:historyId', studentController.deleteMedicalHistory);

/**
 * @route   GET /api/student/emergency-contacts
 * @desc    Get student emergency contacts
 * @access  Private (Student)
 */
router.get('/emergency-contacts', studentController.getEmergencyContacts);

/**
 * @route   POST /api/student/emergency-contacts
 * @desc    Add emergency contact
 * @access  Private (Student)
 */
router.post('/emergency-contacts', studentController.addEmergencyContact);

/**
 * @route   PUT /api/student/emergency-contacts/:contactId
 * @desc    Update emergency contact
 * @access  Private (Student)
 */
router.put('/emergency-contacts/:contactId', studentController.updateEmergencyContact);

/**
 * @route   DELETE /api/student/emergency-contacts/:contactId
 * @desc    Delete emergency contact
 * @access  Private (Student)
 */
router.delete('/emergency-contacts/:contactId', studentController.deleteEmergencyContact);

export default router;
