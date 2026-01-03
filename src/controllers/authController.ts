import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { comparePassword } from '../services/passwordService';
import { generateToken } from '../services/jwtService';
import { LoginRequest, LoginResponse, AppError } from '../types';
import { isValidUserID } from '../utils/validators';

/**
 * Controller to handle user login
 * POST /api/auth/login
 * Body: { user_id: string, password: string }
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id, password }: LoginRequest = req.body;

    // Validate input
    if (!user_id || !password) {
      const error: AppError = new Error('User ID and password are required');
      error.statusCode = 400;
      throw error;
    }

    // Validate user ID format
    if (!isValidUserID(user_id)) {
      const error: AppError = new Error('Invalid user ID format');
      error.statusCode = 400;
      throw error;
    }

    // Get user from database using stored procedure
    const userResult = await pool.query('SELECT * FROM validate_login($1)', [user_id]);

    if (userResult.rows.length === 0) {
      const error: AppError = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const user = userResult.rows[0];
    const storedPasswordHash = user.password_hash;

    // Compare password using bcrypt
    const isPasswordValid = await comparePassword(password, storedPasswordHash);

    if (!isPasswordValid) {
      const error: AppError = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT token
    const token = generateToken(user.user_id, user.user_type);

    // Login successful - prepare response
    const response: LoginResponse = {
      success: true,
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        user_type: user.user_type,
        mobile_number: user.mobile_number,
      },
      token: token,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

