import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../../middleware/validator';
import { loginLimiter } from '../../middleware/rateLimiter';
import { authenticateStaff } from '../../domain/staff/service';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post('/login', loginLimiter, validateBody(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await authenticateStaff(username, password);

    if (!result) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    res.json({
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';
    res.status(400).json({ error: message });
  }
});

router.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
