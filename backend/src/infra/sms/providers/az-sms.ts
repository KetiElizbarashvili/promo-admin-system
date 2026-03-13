/**
 * Azerbaijan SMS provider (D7 Networks compatible).
 * D7 API: POST /messages/v1/send, Bearer token, JSON body with messages array.
 */
import { env } from '../../../config/env';
import type { SmsProvider } from './types';

const DEFAULT_API_URL = 'https://api.d7networks.com';

function requireConfig(): { apiKey: string; sender: string; apiUrl: string } {
  const apiKey = env.AZ_SMS_API_KEY;
  const sender = env.AZ_SMS_SENDER;
  if (!apiKey || !sender) {
    throw new Error('AZ_SMS_API_KEY and AZ_SMS_SENDER must be set for Azerbaijan SMS');
  }
  return {
    apiKey,
    sender,
    apiUrl: env.AZ_SMS_API_URL ?? DEFAULT_API_URL,
  };
}

export function createAzSmsProvider(): SmsProvider {
  const { apiKey, sender, apiUrl } = requireConfig();
  const baseUrl = apiUrl.replace(/\/$/, '');
  const sendUrl = `${baseUrl}/messages/v1/send`;

  return {
    async send(phone: string, message: string): Promise<void> {
      const toNumber = phone.startsWith('+') ? phone : `+${phone}`;
      const res = await fetch(sendUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              originator: sender,
              recipients: [toNumber],
              content: message,
              msg_type: 'text',
              data_coding: 'text',
            },
          ],
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`AZ SMS failed ${res.status}: ${errBody}`);
      }
      const data = (await res.json()) as { request_id?: string };
      process.stdout.write(
        JSON.stringify({ level: 'info', event: 'sms_sent', provider: 'az_sms', request_id: data.request_id, to: phone }) + '\n'
      );
    },
  };
}
