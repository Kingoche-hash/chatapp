import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: env.nodeEnv === 'production' ? 60 : 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many searches, please slow down' },
});