import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JWTPayload } from '../services/jwtService';
import { AppError } from '../types';

// Extended Express Request interface with user
export interface AuthRequest extends Request {
  user?: JWTPayload;
}

/**
 * Middleware to authenticate JWT token
 * Verifies the token from Authorization header and attaches user info to request
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      const error: AppError = new Error('Access token is required');
      error.statusCode = 401;
      return next(error);
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      const error: AppError = new Error('Invalid or expired token');
      error.statusCode = 401;
      return next(error);
    }

    // Attach user information to request object
    req.user = decoded;

    // Continue to next middleware
    next();
  } catch (error) {
    const appError: AppError = new Error('Authentication failed');
    appError.statusCode = 401;
    next(appError);
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is valid, but doesn't fail if token is missing
 * Useful for endpoints that work both with and without authentication
 */
export const optionalAuthenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }

    // Always continue, regardless of token presence
    next();
  } catch (error) {
    // Ignore errors in optional authentication
    next();
  }
};


