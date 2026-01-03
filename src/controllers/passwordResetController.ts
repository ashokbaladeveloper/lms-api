import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { hashPassword } from '../services/passwordService';
import { sendPasswordResetCode, formatPhoneNumber } from '../services/smsService';
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  AppError,
} from '../types';
import { isValidUserID, isValidVerificationCode, isValidPassword } from '../utils/validators';

/**
 * Controller to handle forgot password request (sends SMS verification code)
 * POST /api/auth/forgot-password
 * Body: { user_id: string }
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id }: ForgotPasswordRequest = req.body;

    // Validate input
    if (!user_id) {
      const error: AppError = new Error('User ID is required');
      error.statusCode = 400;
      throw error;
    }

    // Validate user ID format
    if (!isValidUserID(user_id)) {
      const error: AppError = new Error('Invalid user ID format');
      error.statusCode = 400;
      throw error;
    }

    // Check if user exists
    const userQuery = 'SELECT user_id, mobile_number FROM users WHERE user_id = $1';
    const userResult = await pool.query(userQuery, [user_id]);

    if (userResult.rows.length === 0) {
      // Don't reveal that user doesn't exist (security best practice)
      const response: ForgotPasswordResponse = {
        success: true,
        message: 'If the user exists, a verification code has been sent to the registered mobile number',
      };
      res.status(200).json(response);
      return;
    }

    // Call stored procedure to request password reset
    const resetResult = await pool.query(
      'SELECT * FROM request_password_reset($1)',
      [user_id]
    );

    if (resetResult.rows.length === 0) {
      const error: AppError = new Error('Failed to generate reset code');
      error.statusCode = 500;
      throw error;
    }

    const { code, mobile_number } = resetResult.rows[0];

    // Format phone number for SMS
    const formattedPhoneNumber = formatPhoneNumber(mobile_number);

    // Send SMS with verification code
    try {
      await sendPasswordResetCode(formattedPhoneNumber, code);
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      // Still return success to user (security best practice)
      // Log the error for monitoring
    }

    const response: ForgotPasswordResponse = {
      success: true,
      message: 'Verification code has been sent to your registered mobile number',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to verify SMS code
 * POST /api/auth/verify-code
 * Body: { user_id: string, code: string }
 */
export const verifyCode = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id, code }: VerifyCodeRequest = req.body;

    // Validate input
    if (!user_id || !code) {
      const error: AppError = new Error('User ID and verification code are required');
      error.statusCode = 400;
      throw error;
    }

    // Validate user ID format
    if (!isValidUserID(user_id)) {
      const error: AppError = new Error('Invalid user ID format');
      error.statusCode = 400;
      throw error;
    }

    // Validate code format
    if (!isValidVerificationCode(code)) {
      const error: AppError = new Error('Invalid verification code format. Code must be 6 digits');
      error.statusCode = 400;
      throw error;
    }

    // Call stored procedure to verify code
    const verifyResult = await pool.query(
      'SELECT verify_reset_code($1, $2) as is_valid',
      [user_id, code]
    );

    const isValid = verifyResult.rows[0].is_valid;

    if (!isValid) {
      const error: AppError = new Error('Invalid or expired verification code');
      error.statusCode = 400;
      throw error;
    }

    const response: VerifyCodeResponse = {
      success: true,
      message: 'Verification code is valid',
      verified: true,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to reset password after code verification
 * POST /api/auth/reset-password
 * Body: { user_id: string, code: string, new_password: string }
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id, code, new_password }: ResetPasswordRequest = req.body;

    // Validate input
    if (!user_id || !code || !new_password) {
      const error: AppError = new Error('User ID, verification code, and new password are required');
      error.statusCode = 400;
      throw error;
    }

    // Validate user ID format
    if (!isValidUserID(user_id)) {
      const error: AppError = new Error('Invalid user ID format');
      error.statusCode = 400;
      throw error;
    }

    // Validate code format
    if (!isValidVerificationCode(code)) {
      const error: AppError = new Error('Invalid verification code format. Code must be 6 digits');
      error.statusCode = 400;
      throw error;
    }

    // Validate password strength
    if (!isValidPassword(new_password)) {
      const error: AppError = new Error('Password must be at least 8 characters long');
      error.statusCode = 400;
      throw error;
    }

    // First verify the code
    const verifyResult = await pool.query(
      'SELECT verify_reset_code($1, $2) as is_valid',
      [user_id, code]
    );

    const isCodeValid = verifyResult.rows[0].is_valid;

    if (!isCodeValid) {
      const error: AppError = new Error('Invalid or expired verification code');
      error.statusCode = 400;
      throw error;
    }

    // Hash the new password
    const hashedPassword = await hashPassword(new_password);

    // Call stored procedure to update password
    const updateResult = await pool.query(
      'SELECT update_password($1, $2) as success',
      [user_id, hashedPassword]
    );

    const updateSuccess = updateResult.rows[0].success;

    if (!updateSuccess) {
      const error: AppError = new Error('Failed to update password. User not found');
      error.statusCode = 404;
      throw error;
    }

    const response: ResetPasswordResponse = {
      success: true,
      message: 'Password has been reset successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

