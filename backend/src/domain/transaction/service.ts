import { pool } from '../../config/database';

export interface LeaderboardEntry {
  rank: number;
  uniqueId: string;
  firstName: string;
  lastName: string;
  totalPoints: number;
  activePoints: number;
}

export interface TransactionLogEntry {
  id: number;
  type: string;
  participantId: number | null;
  participantName: string | null;
  staffUserId: number | null;
  staffName: string | null;
  pointsChange: number | null;
  prizeId: number | null;
  prizeName: string | null;
  note: string | null;
  createdAt: Date;
}

export async function getLeaderboard(
  limit: number = 100,
  offset: number = 0
): Promise<LeaderboardEntry[]> {
  const result = await pool.query(
    `SELECT
       ROW_NUMBER() OVER (ORDER BY total_points DESC, created_at ASC) as rank,
       unique_id,
       first_name,
       last_name,
       total_points,
       active_points
     FROM participants
     WHERE status = 'ACTIVE'
     ORDER BY total_points DESC, created_at ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return result.rows.map(row => ({
    rank: parseInt(row.rank),
    uniqueId: row.unique_id,
    firstName: row.first_name,
    lastName: row.last_name,
    totalPoints: row.total_points,
    activePoints: row.active_points,
  }));
}

export async function getPublicLeaderboard(
  limit: number = 100
): Promise<{ rank: number; uniqueId: string; totalPoints: number }[]> {
  const result = await pool.query(
    `SELECT
       ROW_NUMBER() OVER (ORDER BY total_points DESC, created_at ASC) as rank,
       unique_id,
       total_points
     FROM participants
     WHERE status = 'ACTIVE'
     ORDER BY total_points DESC, created_at ASC
     LIMIT $1`,
    [limit]
  );

  return result.rows.map(row => ({
    rank: parseInt(row.rank),
    uniqueId: row.unique_id,
    totalPoints: row.total_points,
  }));
}

export async function searchPublicLeaderboard(
  uniqueId: string
): Promise<{ rank: number; uniqueId: string; totalPoints: number; activePoints: number } | null> {
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*) + 1 FROM participants
        WHERE total_points > p.total_points
        AND status = 'ACTIVE') as rank,
       p.unique_id,
       p.total_points,
       p.active_points
     FROM participants p
     WHERE p.unique_id = $1 AND p.status = 'ACTIVE'`,
    [uniqueId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    rank: parseInt(row.rank),
    uniqueId: row.unique_id,
    totalPoints: row.total_points,
    activePoints: row.active_points,
  };
}

export async function getTransactionLogs(
  filters?: {
    type?: string;
    participantId?: number;
    staffUserId?: number;
    startDate?: Date;
    endDate?: Date;
  },
  limit: number = 100,
  offset: number = 0
): Promise<TransactionLogEntry[]> {
  let query = `
    SELECT
      tl.id,
      tl.type,
      tl.participant_id,
      CONCAT(p.first_name, ' ', p.last_name) as participant_name,
      tl.staff_user_id,
      CONCAT(s.first_name, ' ', s.last_name) as staff_name,
      tl.points_change,
      tl.prize_id,
      pr.name as prize_name,
      tl.note,
      tl.created_at
    FROM transaction_log tl
    LEFT JOIN participants p ON tl.participant_id = p.id
    LEFT JOIN staff_users s ON tl.staff_user_id = s.id
    LEFT JOIN prizes pr ON tl.prize_id = pr.id
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramCount = 1;

  if (filters?.type) {
    query += ` AND tl.type = $${paramCount++}`;
    params.push(filters.type);
  }

  if (filters?.participantId) {
    query += ` AND tl.participant_id = $${paramCount++}`;
    params.push(filters.participantId);
  }

  if (filters?.staffUserId) {
    query += ` AND tl.staff_user_id = $${paramCount++}`;
    params.push(filters.staffUserId);
  }

  if (filters?.startDate) {
    query += ` AND tl.created_at >= $${paramCount++}`;
    params.push(filters.startDate);
  }

  if (filters?.endDate) {
    query += ` AND tl.created_at <= $${paramCount++}`;
    params.push(filters.endDate);
  }

  query += ` ORDER BY tl.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  return result.rows.map(row => ({
    id: row.id,
    type: row.type,
    participantId: row.participant_id,
    participantName: row.participant_name,
    staffUserId: row.staff_user_id,
    staffName: row.staff_name,
    pointsChange: row.points_change,
    prizeId: row.prize_id,
    prizeName: row.prize_name,
    note: row.note,
    createdAt: row.created_at,
  }));
}
