import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { env } from '../../config/env';
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
import { uploadPrizeImage } from '../../infra/storage/prizeImageStorage';

const router = Router();
const MAX_IMAGE_SIZE_BYTES = env.PRIZE_IMAGE_MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      callback(new Error('Only JPG, PNG, WEBP, and GIF images are allowed'));
      return;
    }
    callback(null, true);
  },
});

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
  '/upload-image',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  (req, res, next) => {
    upload.single('image')(req, res, (error: unknown) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({ error: `Image is too large. Max size is ${env.PRIZE_IMAGE_MAX_SIZE_MB}MB` });
          return;
        }
        res.status(400).json({ error: 'Invalid image upload payload' });
        return;
      }
      if (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Image upload failed' });
        return;
      }
      next();
    });
  },
  async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Image file is required' });
        return;
      }

      const imageUrl = await uploadPrizeImage(req.file.buffer, req.file.originalname);
      res.status(201).json({ imageUrl });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload image' });
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
      const result = await deletePrize(parseInt(req.params.id));

      if (!result.deleted && !result.archived) {
        res.status(404).json({ error: 'Prize not found' });
        return;
      }

      if (result.archived) {
        res.json({ message: 'Prize has existing usage and was archived instead of deleted' });
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
