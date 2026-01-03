import twilio from 'twilio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Twilio configuration interface
interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

// Get Twilio configuration from environment variables
const twilioConfig: TwilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
};

// Validate Twilio configuration
if (!twilioConfig.accountSid || !twilioConfig.authToken || !twilioConfig.phoneNumber) {
  console.warn('Warning: Twilio configuration is incomplete. SMS functionality may not work.');
}

// Initialize Twilio client
const twilioClient = twilio(twilioConfig.accountSid, twilioConfig.authToken);

// Export Twilio client and configuration
export { twilioClient, twilioConfig };
export default twilioClient;

