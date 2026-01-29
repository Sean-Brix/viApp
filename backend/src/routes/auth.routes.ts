import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { registerValidator, loginValidator } from '../middleware/validators';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (Admin or Student)
 * @access  Public
 */
router.post('/register', registerValidator, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidator, authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate refresh tokens)
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

export default router;
