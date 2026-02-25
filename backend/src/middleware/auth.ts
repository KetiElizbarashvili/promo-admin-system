import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { getUserTokenRevokedAt } from '../infra/redis/client';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: 'SUPER_ADMIN' | 'STAFF';
    iat?: number;
  };
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Primary: HttpOnly cookie; fallback: Authorization header for API clients
  const token: string | undefined =
    req.cookies?.token ??
    (req.headers['authorization']?.startsWith('Bearer ')
      ? req.headers['authorization'].slice(7)
      : undefined);

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: number;
      username: string;
      role: 'SUPER_ADMIN' | 'STAFF';
      iat: number;
    };

    // Check token revocation: reject tokens issued before the user's revocation timestamp
    const revokedAt = await getUserTokenRevokedAt(decoded.id);
    if (revokedAt !== null && decoded.iat * 1000 < revokedAt) {
      res.status(401).json({ error: 'Session has been revoked. Please log in again.' });
      return;
    }

    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(roles: Array<'SUPER_ADMIN' | 'STAFF'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
