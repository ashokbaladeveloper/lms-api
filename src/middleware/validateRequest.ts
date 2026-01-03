import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';

/**
 * Middleware to validate request body is JSON and not empty
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if request has a body (for POST/PUT/PATCH requests)
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (!req.body || Object.keys(req.body).length === 0) {
      const error: AppError = new Error('Request body is required');
      error.statusCode = 400;
      return next(error);
    }
  }
  next();
};

/**
 * Middleware to validate Content-Type header for JSON
 */
export const validateContentType = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      const error: AppError = new Error('Content-Type must be application/json');
      error.statusCode = 400;
      return next(error);
    }
  }
  next();
};

