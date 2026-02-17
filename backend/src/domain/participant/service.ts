import { pool, withTransaction } from '../../config/database';
import { generateUniqueID } from '../shared/crypto';
import { sendUniqueIDEmail } from '../../infra/email/service';
import { sendUniqueIDSMS } from '../../infra/sms/service';

export interface Participant {
  id: number;
  uniqueId: string;
  firstName: string;
  lastName: string;
  govId: string;
  phone: string;
  email: string;
  totalPoints: number;
  activePoints: number;
  status: 'ACTIVE' | 'LOCKED';
  createdAt: Date;
}

export async function createParticipant(
  firstName: string,
  lastName: string,
  govId: string,
  phone: string,
  email: string,
  staffId: number
): Promise<Participant> {
  return withTransaction(async (client) => {
    let uniqueId = generateUniqueID();
    let exists = true;

    // Generate unique ID
    while (exists) {
      uniqueId = generateUniqueID();
      const check = await client.query(
        'SELECT 1 FROM participants WHERE unique_id = $1',
        [uniqueId]
      );
      exists = check.rows.length > 0;
    }

    const result = await client.query(
      `INSERT INTO participants (unique_id, first_name, last_name, gov_id, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, unique_id, first_name, last_name, gov_id, phone, email,
                 total_points, active_points, status, created_at`,
      [uniqueId, firstName, lastName, govId, phone, email]
    );

    await client.query(
      `INSERT INTO transaction_log (type, participant_id, staff_user_id, note)
       VALUES ($1, $2, $3, $4)`,
      ['REGISTER', result.rows[0].id, staffId, `Registered participant: ${uniqueId}`]
    );

    const row = result.rows[0];

    // Send Unique ID to participant
    await Promise.all([
      sendUniqueIDEmail(email, firstName, uniqueId),
      sendUniqueIDSMS(phone, uniqueId),
    ]);

    return {
      id: row.id,
      uniqueId: row.unique_id,
      firstName: row.first_name,
      lastName: row.last_name,
      govId: row.gov_id,
      phone: row.phone,
      email: row.email,
      totalPoints: row.total_points,
      activePoints: row.active_points,
      status: row.status,
      createdAt: row.created_at,
    };
  });
}

export async function getParticipantByUniqueId(uniqueId: string): Promise<Participant | null> {
  const result = await pool.query(
    `SELECT id, unique_id, first_name, last_name, gov_id, phone, email,
            total_points, active_points, status, created_at
     FROM participants WHERE unique_id = $1`,
    [uniqueId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    uniqueId: row.unique_id,
    firstName: row.first_name,
    lastName: row.last_name,
    govId: row.gov_id,
    phone: row.phone,
    email: row.email,
    totalPoints: row.total_points,
    activePoints: row.active_points,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function searchParticipants(query: string): Promise<Participant[]> {
  const result = await pool.query(
    `SELECT id, unique_id, first_name, last_name, gov_id, phone, email,
            total_points, active_points, status, created_at
     FROM participants
     WHERE unique_id ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1
     ORDER BY created_at DESC
     LIMIT 20`,
    [`%${query}%`]
  );

  return result.rows.map(row => ({
    id: row.id,
    uniqueId: row.unique_id,
    firstName: row.first_name,
    lastName: row.last_name,
    govId: row.gov_id,
    phone: row.phone,
    email: row.email,
    totalPoints: row.total_points,
    activePoints: row.active_points,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function addPoints(
  participantId: number,
  points: number,
  staffId: number,
  note?: string
): Promise<Participant> {
  return withTransaction(async (client) => {
    // Lock row for update
    const lockResult = await client.query(
      'SELECT id, status FROM participants WHERE id = $1 FOR UPDATE',
      [participantId]
    );

    if (lockResult.rows.length === 0) {
      throw new Error('Participant not found');
    }

    if (lockResult.rows[0].status === 'LOCKED') {
      throw new Error('Participant is locked');
    }

    const result = await client.query(
      `UPDATE participants
       SET total_points = total_points + $1,
           active_points = active_points + $1,
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, unique_id, first_name, last_name, gov_id, phone, email,
                 total_points, active_points, status, created_at`,
      [points, participantId]
    );

    await client.query(
      `INSERT INTO transaction_log (type, participant_id, staff_user_id, points_change, note)
       VALUES ($1, $2, $3, $4, $5)`,
      ['ADD_POINTS', participantId, staffId, points, note || `Added ${points} points`]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      uniqueId: row.unique_id,
      firstName: row.first_name,
      lastName: row.last_name,
      govId: row.gov_id,
      phone: row.phone,
      email: row.email,
      totalPoints: row.total_points,
      activePoints: row.active_points,
      status: row.status,
      createdAt: row.created_at,
    };
  });
}

export async function lockParticipant(
  participantId: number,
  staffId: number,
  reason: string
): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE participants SET status = 'LOCKED', updated_at = NOW()
       WHERE id = $1`,
      [participantId]
    );

    await client.query(
      `INSERT INTO transaction_log (type, participant_id, staff_user_id, note)
       VALUES ($1, $2, $3, $4)`,
      ['LOCK_PARTICIPANT', participantId, staffId, reason]
    );
  });
}

export async function unlockParticipant(
  participantId: number,
  staffId: number
): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE participants SET status = 'ACTIVE', updated_at = NOW()
       WHERE id = $1`,
      [participantId]
    );

    await client.query(
      `INSERT INTO transaction_log (type, participant_id, staff_user_id, note)
       VALUES ($1, $2, $3, $4)`,
      ['UNLOCK_PARTICIPANT', participantId, staffId, 'Unlocked participant']
    );
  });
}

export async function checkFieldExists(
  field: 'phone' | 'email' | 'gov_id',
  value: string
): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM participants WHERE ${field} = $1`,
    [value]
  );
  return result.rows.length > 0;
}
