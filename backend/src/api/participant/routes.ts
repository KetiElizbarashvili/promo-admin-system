import { Router } from 'express';
import { z } from 'zod';
import { validateBody, validateQuery } from '../../middleware/validator';
import { authenticateToken, requireRole, AuthRequest } from '../../middleware/auth';
import { otpLimiter, otpVerifyLimiter } from '../../middleware/rateLimiter';
import {
  createParticipant,
  getParticipantByUniqueId,
  listParticipants,
  searchParticipants,
  addPoints,
  lockParticipant,
  unlockParticipant,
  checkFieldExists,
} from '../../domain/participant/service';
import {
  startVerification,
  sendPhoneOTP,
  verifyPhoneOTP,
  sendEmailOTP,
  verifyEmailOTP,
  isVerificationComplete,
  getVerificationSession,
} from '../../domain/participant/verification';

const router = Router();

const startRegistrationSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  govId: z.string().min(1).max(50),
  phone: z.string().regex(/^[0-9]{9,15}$/),
  email: z.string().email(),
});

const verifyPhoneSchema = z.object({
  sessionId: z.string(),
  code: z.string().length(6),
});

const verifyEmailSchema = z.object({
  sessionId: z.string(),
  code: z.string().length(6),
});

const resendOTPSchema = z.object({
  sessionId: z.string(),
  type: z.enum(['phone', 'email']),
});

const completeRegistrationSchema = z.object({
  sessionId: z.string(),
});

const searchSchema = z.object({
  query: z.string().min(1),
});

const addPointsSchema = z.object({
  points: z.number().int().min(1),
  note: z.string().optional(),
});

const lockSchema = z.object({
  reason: z.string().min(1),
});

router.post(
  '/register/start',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'STAFF']),
  validateBody(startRegistrationSchema),
  async (req, res) => {
    try {
      const { firstName, lastName, govId, phone, email } = req.body;

      if (await checkFieldExists('phone', phone)) {
        res.status(400).json({ error: 'Phone number already registered' });
        return;
      }

      if (await checkFieldExists('email', email)) {
        res.status(400).json({ error: 'Email already registered' });
        return;
      }

      if (await checkFieldExists('gov_id', govId)) {
        res.status(400).json({ error: 'Government ID already registered' });
        return;
      }

      const sessionId = await startVerification(phone, email);

      await sendPhoneOTP(sessionId);

      res.json({
        message: 'Registration started. Phone verification code sent.',
        sessionId,
        participant: { firstName, lastName, govId, phone, email },
        nextStep: 'verify-phone',
      });
    } catch (error) {
      process.stdout.write(JSON.stringify({ level: 'error', event: 'register_start_failed', error: error instanceof Error ? error.message : String(error) }) + '\n');
      res.status(500).json({ error: 'Failed to start registration' });
    }
  }
);

router.post(
  '/register/verify-phone',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'STAFF']),
  otpVerifyLimiter,
  validateBody(verifyPhoneSchema),
  async (req, res) => {
    try {
      const { sessionId, code } = req.body;

      const result = await verifyPhoneOTP(sessionId, code);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      await sendEmailOTP(sessionId);

      res.json({
        message: 'Phone verified. Email verification code sent.',
        sessionId,
        nextStep: 'verify-email',
      });
    } catch (error) {
      res.status(500).json({ error: 'Phone verification failed' });
    }
  }
);

router.post(
  '/register/verify-email',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'STAFF']),
  otpVerifyLimiter,
  validateBody(verifyEmailSchema),
  async (req, res) => {
    try {
      const { sessionId, code } = req.body;

      const result = await verifyEmailOTP(sessionId, code);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({
        message: 'Email verified successfully.',
        sessionId,
        nextStep: 'complete-registration',
      });
    } catch (error) {
      res.status(500).json({ error: 'Email verification failed' });
    }
  }
);

router.post(
  '/register/resend-otp',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'STAFF']),
  otpLimiter,
  validateBody(resendOTPSchema),
  async (req, res) => {
    try {
      const { sessionId, type } = req.body;

      const result =
        type === 'phone' ? await sendPhoneOTP(sessionId) : await sendEmailOTP(sessionId);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({ message: `${type === 'phone' ? 'Phone' : 'Email'} code resent` });
    } catch (error) {
      res.status(500).json({ error: 'Failed to resend code' });
    }
  }
);

router.post(
  '/register/complete',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'STAFF']),
  validateBody(completeRegistrationSchema.merge(startRegistrationSchema)),
  async (req: AuthRequest, res) => {
    try {
      const { sessionId, firstName, lastName, govId, phone, email } = req.body;

      if (!(await isVerificationComplete(sessionId))) {
        res.status(400).json({ error: 'Verification not complete' });
        return;
      }

      const session = await getVerificationSession(sessionId);
      if (!session || session.phone !== phone || session.email !== email) {
        res.status(400).json({ error: 'Session data mismatch' });
        return;
      }

      const participant = await createParticipant(
        firstName,
        lastName,
        govId,
        phone,
        email,
        req.user!.id
      );

      res.json({
        message: 'Participant registered successfully. Unique ID sent to phone and email.',
        participant,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to complete registration' });
    }
  }
);

router.get(
  '/',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'STAFF']),
  async (_req, res) => {
    try {
      const participants = await listParticipants();
      res.json({ participants });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch participants' });
    }
  }
);

router.get(
  '/search',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'STAFF']),
  validateQuery(searchSchema),
  async (req, res) => {
    try {
      const { query } = req.query as { query: string };
      const participants = await searchParticipants(query);
      res.json({ participants });
    } catch (error) {
      res.status(500).json({ error: 'Search failed' });
    }
  }
);

router.get(
  '/:uniqueId',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'STAFF']),
  async (req, res) => {
    try {
      const participant = await getParticipantByUniqueId(req.params.uniqueId);

      if (!participant) {
        res.status(404).json({ error: 'Participant not found' });
        return;
      }

      res.json({ participant });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch participant' });
    }
  }
);

router.post(
  '/:uniqueId/add-points',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'STAFF']),
  validateBody(addPointsSchema),
  async (req: AuthRequest, res) => {
    try {
      const participant = await getParticipantByUniqueId(req.params.uniqueId);

      if (!participant) {
        res.status(404).json({ error: 'Participant not found' });
        return;
      }

      const { points, note } = req.body;

      const updated = await addPoints(participant.id, points, req.user!.id, note);

      res.json({
        message: 'Points added successfully',
        participant: updated,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add points';
      res.status(400).json({ error: message });
    }
  }
);

router.post(
  '/:uniqueId/lock',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  validateBody(lockSchema),
  async (req: AuthRequest, res) => {
    try {
      const participant = await getParticipantByUniqueId(req.params.uniqueId);

      if (!participant) {
        res.status(404).json({ error: 'Participant not found' });
        return;
      }

      const { reason } = req.body;

      await lockParticipant(participant.id, req.user!.id, reason);

      res.json({ message: 'Participant locked successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to lock participant' });
    }
  }
);

router.post(
  '/:uniqueId/unlock',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  async (req: AuthRequest, res) => {
    try {
      const participant = await getParticipantByUniqueId(req.params.uniqueId);

      if (!participant) {
        res.status(404).json({ error: 'Participant not found' });
        return;
      }

      await unlockParticipant(participant.id, req.user!.id);

      res.json({ message: 'Participant unlocked successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to unlock participant' });
    }
  }
);

export default router;
