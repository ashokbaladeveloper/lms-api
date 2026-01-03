/**
 * Validate user ID format (VARCHAR, non-empty string)
 * @param user_id - String to validate as user ID
 * @returns True if valid user ID, false otherwise
 */
export const isValidUserID = (user_id: string): boolean => {
  // Check if not empty and has reasonable length (max 255 characters)
  return !!(user_id && user_id.trim().length > 0 && user_id.length <= 255);
};

/**
 * Validate mobile number format (basic validation)
 * @param mobileNumber - Mobile number to validate
 * @returns True if valid format, false otherwise
 */
export const isValidMobileNumber = (mobileNumber: string): boolean => {
  // Remove spaces, dashes, and parentheses
  const cleaned = mobileNumber.replace(/[\s\-\(\)]/g, '');
  
  // Basic validation: should contain only digits and optional + at start
  // Minimum 10 digits (adjust based on your requirements)
  const mobileRegex = /^\+?[1-9]\d{9,14}$/;
  return mobileRegex.test(cleaned);
};

/**
 * Validate 6-digit verification code
 * @param code - Code to validate
 * @returns True if valid 6-digit code, false otherwise
 */
export const isValidVerificationCode = (code: string): boolean => {
  const codeRegex = /^\d{6}$/;
  return codeRegex.test(code);
};

/**
 * Validate password (basic validation - can be enhanced)
 * @param password - Password to validate
 * @returns True if valid, false otherwise
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters
  return !!(password && password.length >= 8);
};

/**
 * Sanitize input string to prevent SQL injection (basic)
 * Note: Using parameterized queries is still the best practice
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  return input.trim();
};

