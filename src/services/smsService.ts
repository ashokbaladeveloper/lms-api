import twilioClient, { twilioConfig } from '../config/twilio';

/**
 * Send SMS message using Twilio
 * @param to - Recipient phone number (E.164 format, e.g., +1234567890)
 * @param message - Message body to send
 * @returns Promise resolving to the message SID if successful
 */
export const sendSMS = async (to: string, message: string): Promise<string> => {
  try {
    // Validate Twilio configuration
    if (!twilioConfig.accountSid || !twilioConfig.authToken || !twilioConfig.phoneNumber) {
      throw new Error('Twilio is not properly configured. Please check your environment variables.');
    }

    // Send SMS via Twilio
    const messageInstance = await twilioClient.messages.create({
      body: message,
      from: twilioConfig.phoneNumber,
      to: to,
    });

    console.log(`SMS sent successfully to ${to}. Message SID: ${messageInstance.sid}`);
    return messageInstance.sid;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error('Failed to send SMS. Please try again later.');
  }
};

/**
 * Send password reset verification code via SMS
 * @param mobileNumber - Recipient mobile number
 * @param code - 6-digit verification code
 * @returns Promise resolving to the message SID if successful
 */
export const sendPasswordResetCode = async (
  mobileNumber: string,
  code: string
): Promise<string> => {
  const message = `Your password reset code is: ${code}. This code will expire in 5 minutes. Do not share this code with anyone.`;
  
  return sendSMS(mobileNumber, message);
};

/**
 * Format phone number to E.164 format (if needed)
 * Note: This is a basic implementation. You may need to adjust based on your requirements
 * @param phoneNumber - Phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // If phone number doesn't start with +, assume it needs country code
  // This is a basic implementation - adjust based on your needs
  if (!phoneNumber.startsWith('+')) {
    // You might want to add logic to detect country code based on phone number length
    // For now, we'll return the digits as-is and let Twilio handle it
    return `+${digits}`;
  }
  
  return phoneNumber;
};

