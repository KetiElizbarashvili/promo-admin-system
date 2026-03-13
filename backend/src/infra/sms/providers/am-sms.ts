/**
 * Armenia SMS provider (EasySendSMS compatible).
 * API: POST /v1/rest/sms/send, apikey header, JSON body with from, to, text.
 */
import { env } from '../../../config/env';
import type { SmsProvider } from './types';

const DEFAULT_API_URL = 'https://restapi.easysendsms.app';

function requireConfig(): { apiKey: string; sender: string; apiUrl: string } {
  const apiKey = env.AM_SMS_API_KEY;
  const sender = env.AM_SMS_SENDER;
  if (!apiKey || !sender) {
    throw new Error('AM_SMS_API_KEY and AM_SMS_SENDER must be set for Armenia SMS');
  }
  return {
    apiKey,
    sender,
    apiUrl: env.AM_SMS_API_URL ?? DEFAULT_API_URL,
  };
}

export function createAmSmsProvider(): SmsProvider {
  const { apiKey, sender, apiUrl } = requireConfig();
  const baseUrl = apiUrl.replace(/\/$/, '');
  const sendUrl = `${baseUrl}/v1/rest/sms/send`;

  return {
    async send(phone: string, message: string): Promise<void> {
      const toNumber = phone.replace(/^\+/, '');
      const res = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
        body: JSON.stringify({
          from: sender,
          to: toNumber,
          text: message,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`AM SMS failed ${res.status}: ${errBody}`);
      }
      process.stdout.write(
        JSON.stringify({ level: 'info', event: 'sms_sent', provider: 'am_sms', to: phone }) + '\n'
      );
    },
  };
}
