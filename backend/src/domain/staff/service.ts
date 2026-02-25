import { pool, withTransaction } from '../../config/database';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { hashPassword, verifyPassword } from '../shared/crypto';
import { revokeUserTokens } from '../../infra/redis/client';

export interface StaffUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: 'SUPER_ADMIN' | 'STAFF';
  status: 'ACTIVE' | 'DISABLED';
  createdAt: Date;
}

export async function authenticateStaff(
  username: string,
  password: string
): Promise<{ token: string; user: StaffUser } | null> {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, username, password_hash, role, status
     FROM staff_users WHERE username = $1`,
    [username]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];

  if (user.status !== 'ACTIVE') {
    throw new Error('Account is disabled');
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  );

  return {
    token,
    user: {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      createdAt: user.created_at,
    },
  };
}

export async function getStaffById(id: number): Promise<StaffUser | null> {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, username, role, status, created_at
     FROM staff_users WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    username: row.username,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getAllStaff(): Promise<StaffUser[]> {
  const result = await pool.query(
    `SELECT id, first_name, last_name, email, username, role, status, created_at
     FROM staff_users ORDER BY created_at DESC`
  );

  return result.rows.map(row => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    username: row.username,
    role: row.role,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function createStaff(
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  password: string,
  role: 'SUPER_ADMIN' | 'STAFF',
  createdBy: number
): Promise<StaffUser> {
  return withTransaction(async (client) => {
    const passwordHash = await hashPassword(password);

    const result = await client.query(
      `INSERT INTO staff_users (first_name, last_name, email, username, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, first_name, last_name, email, username, role, status, created_at`,
      [firstName, lastName, email, username, passwordHash, role]
    );

    await client.query(
      `INSERT INTO transaction_log (type, staff_user_id, note)
       VALUES ($1, $2, $3)`,
      ['STAFF_CREATE', createdBy, `Created staff: ${username} (${email})`]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      username: row.username,
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
    };
  });
}

export async function resetStaffPassword(
  staffId: number,
  newPassword: string,
  resetBy: number
): Promise<void> {
  await withTransaction(async (client) => {
    const passwordHash = await hashPassword(newPassword);

    await client.query(
      `UPDATE staff_users SET password_hash = $1, updated_at = NOW()
       WHERE id = $2`,
      [passwordHash, staffId]
    );

    await client.query(
      `INSERT INTO transaction_log (type, staff_user_id, note)
       VALUES ($1, $2, $3)`,
      ['RESET_PASSWORD', resetBy, `Reset password for staff ID: ${staffId}`]
    );
  });

  // Invalidate all active sessions for the staff member whose password was reset
  await revokeUserTokens(staffId);
}

export async function setStaffStatus(
  staffId: number,
  status: 'ACTIVE' | 'DISABLED',
  changedBy: number
): Promise<StaffUser | null> {
  return withTransaction(async (client) => {
    const result = await client.query(
      `UPDATE staff_users SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, first_name, last_name, email, username, role, status, created_at`,
      [status, staffId]
    );

    if (result.rows.length === 0) return null;

    await client.query(
      `INSERT INTO transaction_log (type, staff_user_id, note)
       VALUES ($1, $2, $3)`,
      [
        status === 'DISABLED' ? 'STAFF_DEACTIVATE' : 'STAFF_ACTIVATE',
        changedBy,
        `${status === 'DISABLED' ? 'Deactivated' : 'Activated'} staff ID: ${staffId}`,
      ]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      username: row.username,
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
    };
  });
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const result = await pool.query(
    'SELECT 1 FROM staff_users WHERE email = $1',
    [email]
  );
  return result.rows.length > 0;
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const result = await pool.query(
    'SELECT 1 FROM staff_users WHERE username = $1',
    [username]
  );
  return result.rows.length > 0;
}
