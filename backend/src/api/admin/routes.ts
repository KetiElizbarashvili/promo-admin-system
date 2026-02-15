import { Router } from 'express';
import { z } from 'zod';
import { validateQuery } from '../../middleware/validator';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { getLeaderboard, getTransactionLogs } from '../../domain/transaction/service';

const router = Router();

const leaderboardSchema = z.object({
  limit: z.string().transform(Number).default('100'),
  offset: z.string().transform(Number).default('0'),
});

const logsSchema = z.object({
  type: z.string().optional(),
  participantId: z.string().transform(Number).optional(),
  staffUserId: z.string().transform(Number).optional(),
  startDate: z.string().transform((s) => new Date(s)).optional(),
  endDate: z.string().transform((s) => new Date(s)).optional(),
  limit: z.string().transform(Number).default('100'),
  offset: z.string().transform(Number).default('0'),
});

router.get(
  '/leaderboard',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'STAFF']),
  validateQuery(leaderboardSchema),
  async (req, res) => {
    try {
      const { limit, offset } = req.query as { limit: number; offset: number };
      const leaderboard = await getLeaderboard(
        Math.min(limit, 1000),
        Math.max(offset, 0)
      );
      res.json({ leaderboard });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  }
);

router.get(
  '/logs',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  validateQuery(logsSchema),
  async (req, res) => {
    try {
      const {
        type,
        participantId,
        staffUserId,
        startDate,
        endDate,
        limit,
        offset,
      } = req.query as any;

      const logs = await getTransactionLogs(
        { type, participantId, staffUserId, startDate, endDate },
        Math.min(limit || 100, 1000),
        Math.max(offset || 0, 0)
      );

      res.json({ logs });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  }
);

export default router;
