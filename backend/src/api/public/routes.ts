import { Router } from 'express';
import { z } from 'zod';
import { validateQuery } from '../../middleware/validator';
import {
  getPublicLeaderboard,
  searchPublicLeaderboard,
} from '../../domain/transaction/service';

const router = Router();

const limitSchema = z.object({
  limit: z.string().transform(Number).default('100'),
});

router.get('/leaderboard', validateQuery(limitSchema), async (req, res) => {
  try {
    const { limit } = req.query as { limit: number };
    const leaderboard = await getPublicLeaderboard(Math.min(limit, 1000));
    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

router.get('/search/:uniqueId', async (req, res) => {
  try {
    const result = await searchPublicLeaderboard(req.params.uniqueId);

    if (!result) {
      res.status(404).json({ error: 'Participant not found' });
      return;
    }

    res.json({ participant: result });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;
