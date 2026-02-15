import { env } from '../../config/env';

// Placeholder for SMS service - integrate with your provider (Twilio, AWS SNS, etc.)
export async function sendSMS(phone: string, message: string): Promise<void> {
  if (env.SMS_PROVIDER === 'twilio') {
    // Twilio integration example:
    // const twilio = require('twilio');
    // const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: message,
    //   from: env.TWILIO_PHONE_NUMBER,
    //   to: phone,
    // });
    console.log(`SMS to ${phone}: ${message}`);
    // TODO: Implement actual SMS provider
  } else {
    console.log(`[SMS Mock] to ${phone}: ${message}`);
  }
}

export async function sendOTPSMS(phone: string, code: string): Promise<void> {
  const message = `Your KitKat Promo verification code is: ${code}. Valid for ${env.OTP_EXPIRY_MINUTES} minutes.`;
  await sendSMS(phone, message);
}

export async function sendUniqueIDSMS(phone: string, uniqueId: string): Promise<void> {
  const message = `Welcome to KitKat Promo! Your Unique ID is: ${uniqueId}. Use it to check your rank.`;
  await sendSMS(phone, message);
}
