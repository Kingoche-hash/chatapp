import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.nodeEnv === 'production' ? 20 : 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
});

export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: env.nodeEnv === 'production' ? 30 : 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many uploads, please try again later' },
});