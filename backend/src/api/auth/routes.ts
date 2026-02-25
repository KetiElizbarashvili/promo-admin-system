import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../../middleware/validator';
import { loginLimiter } from '../../middleware/rateLimiter';
import { authenticateStaff } from '../../domain/staff/service';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { revokeUserTokens } from '../../infra/redis/client';
import { env } from '../../config/env';

const router = Router();

const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  // Cross-origin deployments (e.g. Render) require SameSite=None + Secure so the browser
  // sends the cookie on XHR requests from a different domain. Strict is safe for local dev
  // since frontend and backend share the same registrable domain (localhost).
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'strict') as 'none' | 'strict',
  maxAge: 8 * 60 * 60 * 1000,
  path: '/',
};

const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

router.post('/login', loginLimiter, validateBody(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await authenticateStaff(username, password);

    if (!result) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    res.cookie('token', result.token, TOKEN_COOKIE_OPTIONS);
    res.json({ user: result.user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    res.status(400).json({ error: message });
  }
});

router.post('/logout', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user) {
      await revokeUserTokens(req.user.id);
    }
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Logged out successfully' });
  } catch {
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Logged out successfully' });
  }
});

router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

export default router;
