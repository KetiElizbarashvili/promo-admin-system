import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const correlationId = randomUUID();
  const startMs = Date.now();

  // Attach so downstream handlers can reference it
  res.setHeader('X-Correlation-Id', correlationId);

  res.on('finish', () => {
    const log = {
      timestamp: new Date().toISOString(),
      correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startMs,
      // Prefer the real client IP forwarded by Akamai/proxy over socket IP
      clientIp:
        req.headers['true-client-ip'] ??
        req.headers['x-forwarded-for'] ??
        req.socket.remoteAddress,
    };

    if (res.statusCode >= 500) {
      process.stderr.write(JSON.stringify(log) + '\n');
    } else {
      process.stdout.write(JSON.stringify(log) + '\n');
    }
  });

  next();
}
