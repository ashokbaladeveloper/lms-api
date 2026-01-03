import { Router } from 'express';
import { login } from '../controllers/authController';
import {
  forgotPassword,
  verifyCode,
  resetPassword,
} from '../controllers/passwordResetController';
import { validateRequest, validateContentType } from '../middleware/validateRequest';
import { authenticateToken } from '../middleware/authMiddleware';

// Create router instance
const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user with user_id and password
 * @access  Public
 */
router.post('/login', validateContentType, validateRequest, login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset (sends SMS verification code)
 * @access  Public - No token needed (user forgot password)
 */
router.post('/forgot-password', validateContentType, validateRequest, forgotPassword);

/**
 * @route   POST /api/auth/verify-code
 * @desc    Verify SMS verification code
 * @access  Public - No token needed (user forgot password, can't login)
 */
router.post('/verify-code', validateContentType, validateRequest, verifyCode);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password after code verification
 * @access  Public - No token needed (user forgot password, can't login)
 */
router.post('/reset-password', validateContentType, validateRequest, resetPassword);

export default router;

