import { z } from 'zod';

export const userSearchQuerySchema = z.object({
  search: z.string().trim().min(1, 'Search text is required').max(30),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});