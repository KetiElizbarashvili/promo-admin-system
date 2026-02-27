import {
  setOTP,
  getOTP,
  deleteOTP,
  incrementAttempts,
  getAttempts,
} from '../../infra/redis/client';
import { hashCode, verifyCode, generateOTP, generateSessionId } from '../shared/crypto';
import { sendOTPEmail } from '../../infra/email/service';
import { sendOTPSMS } from '../../infra/sms/service';
import { env } from '../../config/env';

export interface VerificationSession {
  phone: string;
  email: string;
  phoneVerified: boolean;
  emailVerified: boolean;
}

export async function startVerification(
  phone: string,
  email: string
): Promise<string> {
  const sessionId = `verify:${generateSessionId()}`;
  
  await setOTP(
    `session:${sessionId}`,
    JSON.stringify({ phone, email, phoneVerified: false, emailVerified: false }),
    env.OTP_EXPIRY_MINUTES * 60
  );

  return sessionId;
}

export async function getVerificationSession(sessionId: string): Promise<VerificationSession | null> {
  const data = await getOTP(`session:${sessionId}`);
  if (!data) {
    return null;
  }
  return JSON.parse(data);
}

export async function sendPhoneOTP(sessionId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getVerificationSession(sessionId);
  if (!session) {
    return { success: false, error: 'Session expired or not found' };
  }

  const attemptsKey = `attempts:phone:${session.phone}`;
  const attempts = await getAttempts(attemptsKey);

  if (attempts >= env.OTP_MAX_ATTEMPTS) {
    return { success: false, error: 'Too many attempts. Please try again later' };
  }

  const code = generateOTP();
  const codeHash = await hashCode(code);

  await setOTP(`otp:phone:${session.phone}`, codeHash, env.OTP_EXPIRY_MINUTES * 60);
  await sendOTPSMS(session.phone, code);

  return { success: true };
}

export async function verifyPhoneOTP(
  sessionId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getVerificationSession(sessionId);
  if (!session) {
    return { success: false, error: 'Session expired or not found' };
  }

  const attemptsKey = `attempts:phone:${session.phone}`;
  const attempts = await incrementAttempts(attemptsKey, env.OTP_EXPIRY_MINUTES * 60);

  if (attempts > env.OTP_MAX_ATTEMPTS) {
    return { success: false, error: 'Too many attempts. Please try again later' };
  }

  const storedHash = await getOTP(`otp:phone:${session.phone}`);
  if (!storedHash) {
    return { success: false, error: 'Code expired or not found' };
  }

  const isValid = await verifyCode(code, storedHash);
  if (!isValid) {
    return { success: false, error: 'Invalid code' };
  }

  // Update session
  session.phoneVerified = true;
  await setOTP(
    `session:${sessionId}`,
    JSON.stringify(session),
    env.OTP_EXPIRY_MINUTES * 60
  );

  await deleteOTP(`otp:phone:${session.phone}`);
  await deleteOTP(attemptsKey);

  return { success: true };
}

export async function sendEmailOTP(sessionId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getVerificationSession(sessionId);
  if (!session) {
    return { success: false, error: 'Session expired or not found' };
  }

  const attemptsKey = `attempts:email:${session.email}`;
  const attempts = await getAttempts(attemptsKey);

  if (attempts >= env.OTP_MAX_ATTEMPTS) {
    return { success: false, error: 'Too many attempts. Please try again later' };
  }

  const code = generateOTP();
  const codeHash = await hashCode(code);

  await setOTP(`otp:email:${session.email}`, codeHash, env.OTP_EXPIRY_MINUTES * 60);
  await sendOTPEmail(session.email, code);

  return { success: true };
}

export async function verifyEmailOTP(
  sessionId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getVerificationSession(sessionId);
  if (!session) {
    return { success: false, error: 'Session expired or not found' };
  }

  const attemptsKey = `attempts:email:${session.email}`;
  const attempts = await incrementAttempts(attemptsKey, env.OTP_EXPIRY_MINUTES * 60);

  if (attempts > env.OTP_MAX_ATTEMPTS) {
    return { success: false, error: 'Too many attempts. Please try again later' };
  }

  const storedHash = await getOTP(`otp:email:${session.email}`);
  if (!storedHash) {
    return { success: false, error: 'Code expired or not found' };
  }

  const isValid = await verifyCode(code, storedHash);
  if (!isValid) {
    return { success: false, error: 'Invalid code' };
  }

  // Update session
  session.emailVerified = true;
  await setOTP(
    `session:${sessionId}`,
    JSON.stringify(session),
    env.OTP_EXPIRY_MINUTES * 60
  );

  await deleteOTP(`otp:email:${session.email}`);
  await deleteOTP(attemptsKey);

  return { success: true };
}

export async function isVerificationComplete(sessionId: string): Promise<boolean> {
  const session = await getVerificationSession(sessionId);
  return session ? session.phoneVerified && session.emailVerified : false;
}

export async function isPhoneVerificationComplete(sessionId: string): Promise<boolean> {
  const session = await getVerificationSession(sessionId);
  return session ? session.phoneVerified : false;
}
