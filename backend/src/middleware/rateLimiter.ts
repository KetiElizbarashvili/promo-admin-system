import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes',
  skipSuccessfulRequests: true,
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1,
  message: 'Please wait 60 seconds before requesting a new code',
  keyGenerator: (req) => {
    // Rate limit per phone/email + IP
    const identifier = req.body.phone || req.body.email || 'unknown';
    return `${req.ip}-${identifier}`;
  },
});

export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many verification attempts, please try again later',
});
