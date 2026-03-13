import { env } from '../../config/env';
import { getSmsProvider } from './providers';
import { createGeSmsProvider } from './providers/ge-sms';
import { createAzSmsProvider } from './providers/az-sms';
import { createAmSmsProvider } from './providers/am-sms';
import type { SmsProvider } from './providers/types';

function detectProvider(phone: string): SmsProvider {
  const d = phone.replace(/\D/g, '');
  if (d.startsWith('994')) return createAzSmsProvider();
  if (d.startsWith('374')) return createAmSmsProvider();
  return createGeSmsProvider();
}

export async function sendSMS(phone: string, message: string): Promise<void> {
  if (env.SMS_PROVIDER === 'mock') {
    process.stdout.write(JSON.stringify({ level: 'info', event: 'sms_mock_sent', to: phone, body: message }) + '\n');
    return;
  }

  const provider = env.SMS_PROVIDER ? getSmsProvider() : detectProvider(phone);
  await provider.send(phone, message);
}

export async function sendOTPSMS(phone: string, code: string): Promise<void> {
  const message = `Your KitKat Promo verification code is: ${code}. Valid for ${env.OTP_EXPIRY_MINUTES} minutes.`;
  await sendSMS(phone, message);
}

export async function sendUniqueIDSMS(phone: string, uniqueId: string): Promise<void> {
  const message = `Welcome to KitKat Promo! Your Unique ID is: ${uniqueId}. Use it to check your rank.`;
  await sendSMS(phone, message);
}
