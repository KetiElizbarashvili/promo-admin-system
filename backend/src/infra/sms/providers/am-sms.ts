/**
 * Armenia SMS provider (MOBIPACE).
 * Auth:  POST /v4/Authorize  → { SessionId }
 * Send:  POST /v4/SendSMS    → { StatusCode, Status, ... }
 * Session is cached and refreshed automatically on expiry or auth error.
 */
import { env } from '../../../config/env';
import type { SmsProvider } from './types';

const DEFAULT_API_URL = 'https://endpoint.mobipace.com:444';
const SESSION_TTL_MS = 18 * 60 * 1000; // refresh 2 min before 20-min inactivity expiry
const REQUEST_TIMEOUT_MS = 30_000;

interface MobipaceAuthResponse {
  StatusCode: number;
  Status: string;
  SessionId?: string;
}

interface MobipaceSendResponse {
  StatusCode: number;
  Status: string;
  MessageCount?: number;
}

function requireConfig(): { username: string; password: string; sender: string; baseUrl: string } {
  const username = env.AM_SMS_USERNAME;
  const password = env.AM_SMS_API_KEY;
  const sender = env.AM_SMS_SENDER;
  if (!username || !password || !sender) {
    throw new Error('AM_SMS_USERNAME, AM_SMS_API_KEY (password), and AM_SMS_SENDER must be set for Armenia SMS (MOBIPACE)');
  }
  return {
    username,
    password,
    sender,
    baseUrl: (env.AM_SMS_API_URL ?? DEFAULT_API_URL).replace(/\/$/, ''),
  };
}

function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export function createAmSmsProvider(): SmsProvider {
  const { username, password, sender, baseUrl } = requireConfig();
  const authUrl = `${baseUrl}/v4/Authorize`;
  const sendUrl = `${baseUrl}/v4/SendSMS`;

  let cachedSessionId: string | null = null;
  let sessionExpiresAt = 0;

  async function authorize(): Promise<string> {
    const res = await fetchWithTimeout(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ Username: username, Password: password }),
    });

    const body = await res.text();
    if (!res.ok) {
      throw new Error(`MOBIPACE auth failed ${res.status}: ${body}`);
    }

    let data: MobipaceAuthResponse;
    try {
      data = JSON.parse(body) as MobipaceAuthResponse;
    } catch {
      throw new Error(`MOBIPACE auth invalid response: ${body}`);
    }

    if (!data.SessionId || data.StatusCode !== 101) {
      throw new Error(`MOBIPACE auth error (${data.StatusCode}): ${data.Status}`);
    }

    return data.SessionId;
  }

  async function getSession(forceRefresh = false): Promise<string> {
    if (!forceRefresh && cachedSessionId && Date.now() < sessionExpiresAt) {
      return cachedSessionId;
    }
    cachedSessionId = await authorize();
    sessionExpiresAt = Date.now() + SESSION_TTL_MS;
    return cachedSessionId;
  }

  async function sendWithSession(sessionId: string, recipient: string, message: string): Promise<MobipaceSendResponse> {
    const res = await fetchWithTimeout(sendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        SessionId: sessionId,
        Sender: sender,
        Messages: [{ Recipient: recipient, Body: message }],
      }),
    });

    const body = await res.text();
    if (!res.ok) {
      throw new Error(`MOBIPACE send failed ${res.status}: ${body}`);
    }

    let data: MobipaceSendResponse;
    try {
      data = JSON.parse(body) as MobipaceSendResponse;
    } catch {
      throw new Error(`MOBIPACE send invalid response: ${body}`);
    }

    return data;
  }

  return {
    async send(phone: string, message: string): Promise<void> {
      const recipient = phone.replace(/^\+/, '');

      let sessionId = await getSession();
      let data = await sendWithSession(sessionId, recipient, message);

      // Re-auth once if the session was rejected (StatusCode 401/403 range)
      if (data.StatusCode !== 101) {
        sessionId = await getSession(true);
        data = await sendWithSession(sessionId, recipient, message);
      }

      if (data.StatusCode !== 101) {
        throw new Error(`MOBIPACE error (${data.StatusCode}): ${data.Status}`);
      }

      process.stdout.write(
        JSON.stringify({ level: 'info', event: 'sms_sent', provider: 'am_sms_mobipace', to: phone, messageCount: data.MessageCount }) + '\n'
      );
    },
  };
}
