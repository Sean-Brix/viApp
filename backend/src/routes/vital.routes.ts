import { Router } from 'express';
import * as vitalController from '../controllers/vital.controller';
import { authenticate, authorize } from '../middleware/auth';
import { uploadVitalValidator } from '../middleware/validators';

const router = Router();

/**
 * @route   POST /api/vitals/esp32/upload
 * @desc    ESP32 device upload vital reading (NO AUTH - Public endpoint)
 * @access  Public
 * @body    { deviceId, heartRate, temperature, spO2, bloodPressureSystolic, bloodPressureDiastolic }
 */
router.post('/esp32/upload', vitalController.esp32UploadVital);

/**
 * @route   POST /api/vitals/upload
 * @desc    Upload single vital reading (authenticated - for manual entry)
 * @access  Private (Student)
 */
router.post('/upload', authenticate, authorize('STUDENT'), uploadVitalValidator, vitalController.uploadVital);

/**
 * @route   POST /api/vitals/bulk-upload
 * @desc    Bulk upload vitals (offline sync)
 * @access  Private (Student)
 */
router.post('/bulk-upload', authenticate, authorize('STUDENT'), vitalController.bulkUploadVitals);

export default router;
