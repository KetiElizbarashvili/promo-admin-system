import bcrypt from 'bcrypt';
import { randomBytes, randomInt } from 'crypto';

const UNIQUE_ID_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function hashCode(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export async function verifyCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export function generatePassword(): string {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const special = '!@#$%';
  const all = lower + upper + digits + special;

  // Guarantee at least one character from each class
  const chars = [
    lower[randomInt(lower.length)],
    upper[randomInt(upper.length)],
    digits[randomInt(digits.length)],
    special[randomInt(special.length)],
    ...Array.from({ length: 8 }, () => all[randomInt(all.length)]),
  ];

  // Fisher-Yates shuffle using CSPRNG
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

export function generateUsername(firstName: string, lastName: string): string {
  const base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z.]/g, '');
  return `${base}${randomInt(1000)}`;
}

export function generateOTP(): string {
  if (process.env.NODE_ENV === 'development' || process.env.TEST_MODE === 'true') {
    return '111111';
  }
  return randomInt(100000, 1000000).toString();
}

export function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

export function generateUniqueID(): string {
  const bytes = randomBytes(6);
  const id = Array.from(bytes, (b) => UNIQUE_ID_ALPHABET[b % UNIQUE_ID_ALPHABET.length]).join('');
  return `KK-${id}`;
}
