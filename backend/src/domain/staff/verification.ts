import { pool } from '../../config/database';
import { hashCode, verifyCode } from '../shared/crypto';
import { sendOTPEmail } from '../../infra/email/service';
import { env } from '../../config/env';

export async function createEmailVerification(
  email: string,
  code: string
): Promise<number> {
  const codeHash = await hashCode(code);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

  const result = await pool.query(
    `INSERT INTO staff_email_verification (staff_email, code_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [email, codeHash, expiresAt]
  );

  return result.rows[0].id;
}

export async function verifyEmailCode(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const result = await pool.query(
    `SELECT id, code_hash, expires_at, attempts, verified
     FROM staff_email_verification
     WHERE staff_email = $1 AND verified = FALSE
     ORDER BY created_at DESC
     LIMIT 1`,
    [email]
  );

  if (result.rows.length === 0) {
    return { success: false, error: 'No verification found for this email' };
  }

  const record = result.rows[0];

  if (record.verified) {
    return { success: false, error: 'Email already verified' };
  }

  if (new Date() > new Date(record.expires_at)) {
    return { success: false, error: 'Verification code expired' };
  }

  if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
    return { success: false, error: 'Too many attempts. Please request a new code' };
  }

  const isValid = await verifyCode(code, record.code_hash);

  await pool.query(
    `UPDATE staff_email_verification
     SET attempts = attempts + 1, updated_at = NOW()
     WHERE id = $1`,
    [record.id]
  );

  if (!isValid) {
    return { success: false, error: 'Invalid verification code' };
  }

  await pool.query(
    `UPDATE staff_email_verification
     SET verified = TRUE
     WHERE id = $1`,
    [record.id]
  );

  return { success: true };
}

export async function isEmailVerified(email: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM staff_email_verification
     WHERE staff_email = $1 AND verified = TRUE
     ORDER BY created_at DESC
     LIMIT 1`,
    [email]
  );
  return result.rows.length > 0;
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  await sendOTPEmail(email, code);
}
