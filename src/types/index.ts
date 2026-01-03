// User type enum
export type UserType = 'employee' | 'student';

// User interface
export interface User {
  user_id: string;
  user_type: UserType;
  mobile_number: string;
  created_at?: Date;
  updated_at?: Date;
}

// Login request interface
export interface LoginRequest {
  user_id: string;
  password: string;
}

// Login response interface
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    user_id: string;
    user_type: UserType;
    mobile_number: string;
  };
  token: string; // JWT token (always included after login)
}

// Forgot password request interface
export interface ForgotPasswordRequest {
  user_id: string;
}

// Forgot password response interface
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

// Verify code request interface
export interface VerifyCodeRequest {
  user_id: string;
  code: string;
}

// Verify code response interface
export interface VerifyCodeResponse {
  success: boolean;
  message: string;
  verified?: boolean;
}

// Reset password request interface
export interface ResetPasswordRequest {
  user_id: string;
  code: string;
  new_password: string;
}

// Reset password response interface
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Custom error interface
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Database result types
export interface DatabaseUser {
  user_id: string;
  user_type: UserType;
  mobile_number: string;
}

export interface PasswordResetCode {
  code: string;
  expires_at: Date;
  mobile_number: string;
}

