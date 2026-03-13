/**
 * Georgia SMS provider (sender.ge).
 * Send: POST /api/send.php
 * Delivery: GET/POST /api/callback.php
 * Status: 0=Pending, 1=Delivered, 2=Undelivered
 */
import { env } from '../../../config/env';
import type { SmsProvider } from './types';

const DEFAULT_API_URL = 'https://sender.ge/api';
const REQUEST_TIMEOUT_MS = 30000;
const MAX_MESSAGE_LENGTH = 1000;
const SMS_RETRY_ATTEMPTS = 3;
const SMS_RETRY_DELAY_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requireConfig(): { apiKey: string; apiUrl: string } {
  const apiKey = env.GE_SMS_API_KEY;
  if (!apiKey) {
    throw new Error('GE_SMS_API_KEY must be set for Georgia SMS (sender.ge)');
  }
  return {
    apiKey,
    apiUrl: env.GE_SMS_API_URL ?? DEFAULT_API_URL,
  };
}

/** Format to 9-digit Georgian mobile. Accepts: +9955xxxxxxxx, 9955xxxxxxxx, 5xxxxxxxx */
function formatPhoneNumber(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('995') && digits.length >= 12) {
    digits = digits.slice(3);
  }
  if (digits.startsWith('0') && digits.length === 10) {
    digits = digits.slice(1);
  }
  return digits;
}

function validatePhoneNumber(phone: string): void {
  const cleaned = formatPhoneNumber(phone);
  if (!/^5[0-9]{8}$/.test(cleaned)) {
    throw new Error('Invalid Georgian mobile number. Use +995 5XX XXX XXX (e.g. +995555123456)');
  }
}

function validateMessage(message: string): void {
  if (!message || message.trim() === '') {
    throw new Error('SMS message content is required');
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`SMS message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
  }
}

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

export function createGeSmsProvider(): SmsProvider {
  const { apiKey, apiUrl } = requireConfig();
  const baseUrl = apiUrl.replace(/\/$/, '');
  const sendUrl = `${baseUrl}/send.php`;

  return {
    async send(phone: string, message: string): Promise<void> {
      validatePhoneNumber(phone);
      validateMessage(message);

      const destination = formatPhoneNumber(phone);
      const params = new URLSearchParams({
        apikey: apiKey,
        smsno: '1',
        destination,
        content: message,
        priority: '1',
      });

      let res!: Response;
      let body!: string;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= SMS_RETRY_ATTEMPTS; attempt++) {
        res = await fetchWithTimeout(sendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });
        body = await res.text();

        if (res.ok) break;

        lastError = new Error(`GE SMS failed ${res.status}: ${body}`);
        const isRetryable = res.status >= 500 && res.status < 600;
        if (!isRetryable || attempt === SMS_RETRY_ATTEMPTS) {
          throw lastError;
        }
        await sleep(SMS_RETRY_DELAY_MS);
      }

      let data: { data?: Array<{ messageId?: string }>; message?: string };
      try {
        data = JSON.parse(body) as typeof data;
      } catch {
        throw new Error(`GE SMS invalid response: ${body}`);
      }

      if (data.message) {
        throw new Error(`GE SMS error: ${data.message}`);
      }

      const messageId = data.data?.[0]?.messageId;
      process.stdout.write(
        JSON.stringify({ level: 'info', event: 'sms_sent', provider: 'ge_sms', messageId, to: phone }) + '\n'
      );
    },
  };
}

export type GeDeliveryStatus = 'pending' | 'delivered' | 'undelivered';

/** Check delivery status. Status: 0=Pending, 1=Delivered, 2=Undelivered. */
export async function checkGeDeliveryStatus(messageId: string): Promise<GeDeliveryStatus> {
  const { apiKey, apiUrl } = requireConfig();
  const baseUrl = apiUrl.replace(/\/$/, '');
  const callbackUrl = `${baseUrl}/callback.php`;

  const params = new URLSearchParams({ apikey: apiKey, messageId });
  const res = await fetchWithTimeout(`${callbackUrl}?${params.toString()}`, { method: 'GET' });
  const body = await res.text();

  if (!res.ok) {
    throw new Error(`GE SMS delivery check failed ${res.status}: ${body}`);
  }

  let data: { data?: Array<{ statusId?: number }>; message?: string };
  try {
    data = JSON.parse(body) as typeof data;
  } catch {
    throw new Error(`GE SMS delivery check invalid response: ${body}`);
  }

  if (data.message) {
    throw new Error(`GE SMS delivery check error: ${data.message}`);
  }

  const statusId = data.data?.[0]?.statusId ?? -1;
  if (statusId === 1) return 'delivered';
  if (statusId === 2) return 'undelivered';
  return 'pending';
}
