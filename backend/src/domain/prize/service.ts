import { pool, withTransaction } from '../../config/database';

export interface Prize {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  costPoints: number;
  stockQty: number | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
}

function rowToPrize(row: Record<string, unknown>): Prize {
  return {
    id: row.id as number,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    imageUrl: (row.image_url as string | null) ?? null,
    costPoints: row.cost_points as number,
    stockQty: (row.stock_qty as number | null) ?? null,
    status: row.status as 'ACTIVE' | 'INACTIVE',
    createdAt: row.created_at as Date,
  };
}

export async function getAllPrizes(): Promise<Prize[]> {
  const result = await pool.query(
    `SELECT id, name, description, image_url, cost_points, stock_qty, status, created_at
     FROM prizes ORDER BY created_at DESC`
  );
  return result.rows.map(rowToPrize);
}

export async function getActivePrizes(): Promise<Prize[]> {
  const result = await pool.query(
    `SELECT id, name, description, image_url, cost_points, stock_qty, status, created_at
     FROM prizes
     WHERE status = 'ACTIVE' AND (stock_qty IS NULL OR stock_qty > 0)
     ORDER BY cost_points ASC`
  );
  return result.rows.map(rowToPrize);
}

export async function getPrizeById(id: number): Promise<Prize | null> {
  const result = await pool.query(
    `SELECT id, name, description, image_url, cost_points, stock_qty, status, created_at
     FROM prizes WHERE id = $1`,
    [id]
  );
  if (result.rows.length === 0) return null;
  return rowToPrize(result.rows[0]);
}

export async function createPrize(
  name: string,
  description: string | null,
  imageUrl: string | null,
  costPoints: number,
  stockQty: number | null
): Promise<Prize> {
  const result = await pool.query(
    `INSERT INTO prizes (name, description, image_url, cost_points, stock_qty)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, description, image_url, cost_points, stock_qty, status, created_at`,
    [name, description, imageUrl, costPoints, stockQty]
  );
  return rowToPrize(result.rows[0]);
}

export async function updatePrize(
  id: number,
  data: {
    name?: string;
    description?: string | null;
    imageUrl?: string | null;
    costPoints?: number;
    stockQty?: number | null;
    status?: 'ACTIVE' | 'INACTIVE';
  }
): Promise<Prize | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramCount = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramCount++}`);
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(data.description);
  }
  if (data.imageUrl !== undefined) {
    fields.push(`image_url = $${paramCount++}`);
    values.push(data.imageUrl);
  }
  if (data.costPoints !== undefined) {
    fields.push(`cost_points = $${paramCount++}`);
    values.push(data.costPoints);
  }
  if (data.stockQty !== undefined) {
    fields.push(`stock_qty = $${paramCount++}`);
    values.push(data.stockQty);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    values.push(data.status);
  }

  if (fields.length === 0) {
    return getPrizeById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE prizes SET ${fields.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, name, description, image_url, cost_points, stock_qty, status, created_at`,
    values
  );

  if (result.rows.length === 0) return null;
  return rowToPrize(result.rows[0]);
}

export async function deletePrize(id: number): Promise<boolean> {
  const result = await pool.query('DELETE FROM prizes WHERE id = $1', [id]);
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function redeemPrize(
  participantId: number,
  prizeId: number,
  staffId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await withTransaction(async (client) => {
      // Lock participant row
      const participantResult = await client.query(
        `SELECT id, unique_id, active_points, status FROM participants
         WHERE id = $1 FOR UPDATE`,
        [participantId]
      );

      if (participantResult.rows.length === 0) {
        throw new Error('Participant not found');
      }

      const participant = participantResult.rows[0];

      if (participant.status === 'LOCKED') {
        throw new Error('Participant is locked');
      }

      // Lock prize row
      const prizeResult = await client.query(
        `SELECT id, name, cost_points, stock_qty, status FROM prizes
         WHERE id = $1 FOR UPDATE`,
        [prizeId]
      );

      if (prizeResult.rows.length === 0) {
        throw new Error('Prize not found');
      }

      const prize = prizeResult.rows[0];

      if (prize.status !== 'ACTIVE') {
        throw new Error('Prize is not active');
      }

      if (participant.active_points < prize.cost_points) {
        throw new Error('Insufficient active points');
      }

      if (prize.stock_qty !== null && prize.stock_qty <= 0) {
        throw new Error('Prize out of stock');
      }

      // Deduct points
      await client.query(
        `UPDATE participants
         SET active_points = active_points - $1, updated_at = NOW()
         WHERE id = $2`,
        [prize.cost_points, participantId]
      );

      // Deduct stock if not unlimited
      if (prize.stock_qty !== null) {
        await client.query(
          `UPDATE prizes
           SET stock_qty = stock_qty - 1, updated_at = NOW()
           WHERE id = $1`,
          [prizeId]
        );
      }

      // Log transaction
      await client.query(
        `INSERT INTO transaction_log (type, participant_id, staff_user_id, points_change, prize_id, note)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'REDEEM',
          participantId,
          staffId,
          -prize.cost_points,
          prizeId,
          `Redeemed: ${prize.name}`,
        ]
      );
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Redemption failed',
    };
  }
}
