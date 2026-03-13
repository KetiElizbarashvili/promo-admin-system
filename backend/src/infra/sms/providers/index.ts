import { env } from '../../../config/env';
import type { SmsProvider } from './types';
import { createAzSmsProvider } from './az-sms';
import { createGeSmsProvider } from './ge-sms';
import { createAmSmsProvider } from './am-sms';

let cachedProvider: SmsProvider | null = null;

function createProvider(): SmsProvider {
  const provider = env.SMS_PROVIDER ?? 'ge_sms';
  switch (provider) {
    case 'az_sms':
      return createAzSmsProvider();
    case 'ge_sms':
      return createGeSmsProvider();
    case 'am_sms':
      return createAmSmsProvider();
    default:
      throw new Error(`Unknown SMS_PROVIDER: ${provider}. Use ge_sms, az_sms, or am_sms`);
  }
}

export function getSmsProvider(): SmsProvider {
  if (!cachedProvider) {
    cachedProvider = createProvider();
  }
  return cachedProvider;
}
