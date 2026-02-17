import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../../middleware/validator';
import { authenticateToken, requireRole, AuthRequest } from '../../middleware/auth';
import { otpLimiter, otpVerifyLimiter } from '../../middleware/rateLimiter';
import {
  getAllStaff,
  createStaff,
  resetStaffPassword,
  checkEmailExists,
  checkUsernameExists,
  getStaffById,
} from '../../domain/staff/service';
import {
  createEmailVerification,
  verifyEmailCode,
  isEmailVerified,
  sendVerificationEmail,
} from '../../domain/staff/verification';
import { generatePassword, generateUsername, generateOTP } from '../../domain/shared/crypto';
import { sendStaffCredentials } from '../../infra/email/service';

const router = Router();

const createStaffSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['SUPER_ADMIN', 'STAFF']),
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const resendCodeSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  staffId: z.number(),
});

router.get('/', authenticateToken, requireRole(['SUPER_ADMIN']), async (_req, res) => {
  try {
    const staff = await getAllStaff();
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

router.post(
  '/',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  validateBody(createStaffSchema),
  async (req: AuthRequest, res) => {
    try {
      const { email } = req.body;

      if (await checkEmailExists(email)) {
        res.status(400).json({ error: 'Email already exists' });
        return;
      }

      const code = generateOTP();
      await createEmailVerification(email, code);
      await sendVerificationEmail(email, code);

      res.json({
        message: 'Verification code sent to email',
        email,
        nextStep: 'verify-email',
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create staff' });
    }
  }
);

router.post(
  '/verify-email',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  otpVerifyLimiter,
  validateBody(verifyEmailSchema),
  async (req: AuthRequest, res) => {
    try {
      const { email, code } = req.body;

      const result = await verifyEmailCode(email, code);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({ message: 'Email verified successfully', email });
    } catch (error) {
      res.status(500).json({ error: 'Verification failed' });
    }
  }
);

router.post(
  '/complete-registration',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  validateBody(createStaffSchema),
  async (req: AuthRequest, res) => {
    try {
      const { firstName, lastName, email, role } = req.body;

      if (!(await isEmailVerified(email))) {
        res.status(400).json({ error: 'Email not verified' });
        return;
      }

      let username = generateUsername(firstName, lastName);
      while (await checkUsernameExists(username)) {
        username = generateUsername(firstName, lastName);
      }

      const password = generatePassword();

      const staff = await createStaff(
        firstName,
        lastName,
        email,
        username,
        password,
        role,
        req.user!.id
      );

      await sendStaffCredentials(email, firstName, username, password);

      res.json({
        message: 'Staff created successfully. Credentials sent to email.',
        staff: {
          id: staff.id,
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          username: staff.username,
          role: staff.role,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to complete registration' });
    }
  }
);

router.post(
  '/resend-code',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  otpLimiter,
  validateBody(resendCodeSchema),
  async (_req, res) => {
    try {
      const { email } = _req.body;

      const code = generateOTP();
      await createEmailVerification(email, code);
      await sendVerificationEmail(email, code);

      res.json({ message: 'Verification code resent' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to resend code' });
    }
  }
);

router.post(
  '/reset-password',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  validateBody(resetPasswordSchema),
  async (req: AuthRequest, res) => {
    try {
      const { staffId } = req.body;

      const staff = await getStaffById(staffId);
      if (!staff) {
        res.status(404).json({ error: 'Staff not found' });
        return;
      }

      const newPassword = generatePassword();
      await resetStaffPassword(staffId, newPassword, req.user!.id);
      await sendStaffCredentials(staff.email, staff.firstName, staff.username, newPassword);

      res.json({ message: 'Password reset successfully. New password sent to email.' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }
);

export default router;
