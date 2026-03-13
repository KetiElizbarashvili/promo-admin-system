/**
 * Azerbaijan SMS provider (LSIM - apps.lsim.az).
 * Send: POST /quicksms/v1/smssender, JSON body.
 * Key:  md5( md5(password) + login + text + msisdn + sender )
 */
import { createHash } from 'node:crypto';
import { env } from '../../../config/env';
import type { SmsProvider } from './types';

const DEFAULT_API_URL = 'https://apps.lsim.az/quicksms/v1';
const REQUEST_TIMEOUT_MS = 30_000;

interface LsimResponse {
  successMessage: string | null;
  errorMessage: string | null;
  obj: number | null;
  errorCode: number;
}

function md5(value: string): string {
  return createHash('md5').update(value).digest('hex');
}

function buildKey(password: string, login: string, text: string, msisdn: string, sender: string): string {
  return md5(md5(password) + login + text + msisdn + sender);
}

function requireConfig(): { login: string; password: string; sender: string; baseUrl: string } {
  const login = env.AZ_SMS_LOGIN;
  const password = env.AZ_SMS_API_KEY;
  const sender = env.AZ_SMS_SENDER;
  if (!login || !password || !sender) {
    throw new Error('AZ_SMS_LOGIN, AZ_SMS_API_KEY (password), and AZ_SMS_SENDER must be set for Azerbaijan SMS (LSIM)');
  }
  return {
    login,
    password,
    sender,
    baseUrl: (env.AZ_SMS_API_URL ?? DEFAULT_API_URL).replace(/\/$/, ''),
  };
}

export function createAzSmsProvider(): SmsProvider {
  const { login, password, sender, baseUrl } = requireConfig();
  const sendUrl = `${baseUrl}/smssender`;

  return {
    async send(phone: string, message: string): Promise<void> {
      const msisdn = phone.replace(/^\+/, '');
      const key = buildKey(password, login, message, msisdn, sender);

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      let res: Response;
      let body: string;
      try {
        res = await fetch(sendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ login, key, msisdn, text: message, sender, unicode: false }),
          signal: controller.signal,
        });
        body = await res.text();
      } finally {
        clearTimeout(timer);
      }

      if (!res.ok) {
        throw new Error(`AZ SMS HTTP error ${res.status}: ${body}`);
      }

      let data: LsimResponse;
      try {
        data = JSON.parse(body) as LsimResponse;
      } catch {
        throw new Error(`AZ SMS invalid response: ${body}`);
      }

      if (data.errorCode !== 0) {
        const detail = data.errorMessage ?? `errorCode ${data.errorCode}`;
        throw new Error(`AZ SMS error: ${detail}`);
      }

      process.stdout.write(
        JSON.stringify({ level: 'info', event: 'sms_sent', provider: 'az_sms_lsim', transactionId: data.obj, to: phone }) + '\n'
      );
    },
  };
}
