import { z } from 'zod';

export const userSearchQuerySchema = z.object({
  search: z.string().trim().min(1, 'Search text is required').max(30),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

export const userIdParams = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id'),
});