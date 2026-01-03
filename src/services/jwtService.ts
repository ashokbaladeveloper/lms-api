import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserType } from '../types';

// Load environment variables
dotenv.config();

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'; // Default 24 hours

// JWT payload interface
export interface JWTPayload {
  user_id: string;
  user_type: UserType;
  iat?: number;
  exp?: number;
}

// Extended Express Request interface for JWT
export interface AuthRequest extends Express.Request {
  user?: JWTPayload;
}

/**
 * Generate JWT token for a user
 * @param user_id - User ID
 * @param user_type - User type (employee or student)
 * @returns JWT token string
 */
export const generateToken = (user_id: string, user_type: UserType): string => {
  const payload: JWTPayload = {
    user_id,
    user_type,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verify and decode JWT token
 * @param token - JWT token string
 * @returns Decoded JWT payload or null if invalid
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value (format: "Bearer <token>")
 * @returns Token string or null
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  // Check if header starts with "Bearer "
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Extract token part
  const token = authHeader.substring(7); // Remove "Bearer " prefix
  return token.trim() || null;
};


