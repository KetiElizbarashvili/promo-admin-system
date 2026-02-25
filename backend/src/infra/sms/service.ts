import { env } from '../../config/env';

function getTwilioClient() {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const twilio = require('twilio');
  return twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
}

export async function sendSMS(phone: string, message: string): Promise<void> {
  if (process.env.NODE_ENV === 'development' || process.env.TEST_MODE === 'true') {
    process.stdout.write(JSON.stringify({ level: 'info', event: 'sms_mock', to: phone, body: message }) + '\n');
    return;
  }

  if (env.SMS_PROVIDER === 'twilio') {
    if (!env.TWILIO_PHONE_NUMBER) {
      throw new Error('TWILIO_PHONE_NUMBER must be set');
    }
    const client = getTwilioClient();
    const toNumber = phone.startsWith('+') ? phone : `+${phone}`;
    const result = await client.messages.create({
      body: message,
      from: env.TWILIO_PHONE_NUMBER,
      to: toNumber,
    });
    process.stdout.write(JSON.stringify({ level: 'info', event: 'sms_sent', sid: result.sid, to: phone }) + '\n');
  } else {
    void phone;
    void message;
    process.stdout.write(JSON.stringify({ level: 'info', event: 'sms_mock_sent' }) + '\n');
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
