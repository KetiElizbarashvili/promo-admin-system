import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../../middleware/validator';
import { authenticateToken, requireRole, AuthRequest } from '../../middleware/auth';
import {
  getAllPrizes,
  getActivePrizes,
  getPrizeById,
  createPrize,
  updatePrize,
  deletePrize,
  redeemPrize,
} from '../../domain/prize/service';
import { getParticipantByUniqueId } from '../../domain/participant/service';

const router = Router();

const imageUrlField = z.string()
  .max(500)
  .transform((val) => {
    if (!val) return null;
    if (!/^https?:\/\//i.test(val)) return `https://${val}`;
    return val;
  })
  .nullable()
  .optional();

const createPrizeSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
  imageUrl: imageUrlField,
  costPoints: z.number().int().min(1),
  stockQty: z.number().int().min(0).nullable().optional(),
});

const updatePrizeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
  imageUrl: imageUrlField,
  costPoints: z.number().int().min(1).optional(),
  stockQty: z.number().int().min(0).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

const redeemSchema = z.object({
  uniqueId: z.string(),
  prizeId: z.number().int(),
});

router.get(
  '/',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'STAFF']),
  async (_req, res) => {
    try {
      const prizes = await getAllPrizes();
      res.json({ prizes });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch prizes' });
    }
  }
);

router.get(
  '/active',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'STAFF']),
  async (_req, res) => {
    try {
      const prizes = await getActivePrizes();
      res.json({ prizes });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch active prizes' });
    }
  }
);

router.get(
  '/:id',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'STAFF']),
  async (req, res) => {
    try {
      const prize = await getPrizeById(parseInt(req.params.id));

      if (!prize) {
        res.status(404).json({ error: 'Prize not found' });
        return;
      }

      res.json({ prize });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch prize' });
    }
  }
);

router.post(
  '/',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  validateBody(createPrizeSchema),
  async (req, res) => {
    try {
      const { name, description, imageUrl, costPoints, stockQty } = req.body;

      const prize = await createPrize(name, description || null, imageUrl || null, costPoints, stockQty || null);

      res.status(201).json({
        message: 'Prize created successfully',
        prize,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create prize' });
    }
  }
);

router.put(
  '/:id',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  validateBody(updatePrizeSchema),
  async (req, res) => {
    try {
      const prize = await updatePrize(parseInt(req.params.id), req.body);

      if (!prize) {
        res.status(404).json({ error: 'Prize not found' });
        return;
      }

      res.json({
        message: 'Prize updated successfully',
        prize,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update prize' });
    }
  }
);

router.delete(
  '/:id',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  async (req, res) => {
    try {
      const deleted = await deletePrize(parseInt(req.params.id));

      if (!deleted) {
        res.status(404).json({ error: 'Prize not found' });
        return;
      }

      res.json({ message: 'Prize deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete prize' });
    }
  }
);

router.post(
  '/redeem',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'STAFF']),
  validateBody(redeemSchema),
  async (req: AuthRequest, res) => {
    try {
      const { uniqueId, prizeId } = req.body;

      const participant = await getParticipantByUniqueId(uniqueId);

      if (!participant) {
        res.status(404).json({ error: 'Participant not found' });
        return;
      }

      const result = await redeemPrize(participant.id, prizeId, req.user!.id);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({ message: 'Prize redeemed successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to redeem prize' });
    }
  }
);

export default router;
